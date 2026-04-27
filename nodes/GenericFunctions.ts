import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IPollFunctions,
	INodePropertyOptions,
	IDataObject,
} from 'n8n-workflow';

/**
 * KIS credentials shape used by this package.
 */
export type KisCreds = {
	baseUrl: string;
	appToken: string;
	secret: string;
};

/**
 * Shared KIS API request helper.
 *
 * IMPORTANT:
 * - Uses n8n's official httpRequestWithAuthentication helper.
 * - Does not call this.helpers.httpRequest().
 * - Does not manually get/sign an Authorization token.
 * - Do not manually add Authorization headers in node files.
 * - Pass relative URLs only, for example:
 *   url: '/api_token_access/data_handlers/index'
 *
 * Authentication must be configured in credentials/KisApi.credentials.ts.
 */
export async function kisApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
	options: {
		method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
		url: string;
		body?: IDataObject;
		qs?: IDataObject;
		headers?: IDataObject;
		json?: boolean;
		returnFullResponse?: boolean;
		ignoreHttpStatusErrors?: boolean;
	},
): Promise<any> {
	return await this.helpers.httpRequestWithAuthentication.call(this, 'kisApi', {
		method: options.method,
		url: options.url,
		body: options.body,
		qs: options.qs,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...options.headers,
		},
		json: options.json ?? true,
		returnFullResponse: options.returnFullResponse,
		ignoreHttpStatusErrors: options.ignoreHttpStatusErrors,
	});
}

/**
 * Load KIS collections for dropdowns.
 */
export async function loadCollections(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = await kisApiRequest.call(this, {
		method: 'GET',
		url: '/api_token_access/collections',
		qs: {
			page: 1,
			per_page: 1000,
		},
	});

	const collections = response?.data ?? [];

	return collections.map((collection: any) => ({
		name: collection?.attributes?.name ?? collection?.id ?? 'Unknown',
		value: collection?.attributes?.name ?? collection?.id ?? '',
	}));
}

/**
 * Load document IDs from selected collection.
 */
export async function loadDocumentIds(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const collection = this.getCurrentNodeParameter('collection') as string;

	if (!collection) {
		return [];
	}

	const response = await kisApiRequest.call(this, {
		method: 'POST',
		url: '/api_token_access/data_handlers/index',
		body: {
			data_handler: {
				collection_name: collection,
				limit: 100,
			},
		},
	});

	const documents = response?.queries?.[0]?.documents ?? [];

	return documents
		.map((document: any) => {
			const id = document?._id?.$oid ?? document?._id ?? document?.id;

			return {
				name: id,
				value: id,
			};
		})
		.filter((option: INodePropertyOptions) => Boolean(option.value));
}

/**
 * Load fields from a selected collection.
 */
export async function loadCollectionFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const collection = this.getCurrentNodeParameter('collection') as string;

	if (!collection) {
		return [];
	}

	const listResponse = await kisApiRequest.call(this, {
		method: 'GET',
		url: '/api_token_access/collections',
		qs: {
			page: 1,
			per_page: 1000,
		},
	});

	const selectedCollection = (listResponse as any)?.data?.find(
		(entry: any) => entry?.attributes?.name === collection || entry?.id === collection,
	);

	if (!selectedCollection) {
		return [];
	}

	let included: any[] = (listResponse as any)?.included ?? [];

	if (!Array.isArray(included) || included.length === 0) {
		const detailResponse = await kisApiRequest.call(this, {
			method: 'GET',
			url: `/api_token_access/collections/${selectedCollection.id}`,
			qs: {
				include: 'fields',
			},
		});

		included = (detailResponse as any)?.included ?? [];
	}

	const reserved = new Set(['_id', 'u_at', 'c_at']);
	const fieldIds = new Set(
		(selectedCollection?.relationships?.fields?.data ?? [])
			.map((entry: any) => entry?.id)
			.filter(Boolean),
	);
	const seen = new Set<string>();

	return (included ?? [])
		.filter((field: any) => fieldIds.has(field?.id))
		.map((field: any) => field?.attributes?.field_name)
		.filter((fieldName: unknown): fieldName is string => {
			if (typeof fieldName !== 'string' || fieldName.length === 0) {
				return false;
			}

			if (reserved.has(fieldName) || seen.has(fieldName)) {
				return false;
			}

			seen.add(fieldName);
			return true;
		})
		.sort((a: string, b: string) => a.localeCompare(b))
		.map((fieldName: string) => ({
			name: fieldName,
			value: fieldName,
		}));
}

/**
 * Build document fields from Create/Update node parameters.
 *
 * Supports:
 * - JSON mode: fieldsJson
 * - UI mode: fieldsUi.field[]
 */
export function getFieldsFromParameters(
	this: IExecuteFunctions,
	itemIndex: number,
	jsonParameters = false,
): IDataObject {
	if (jsonParameters) {
		const fieldsJson = this.getNodeParameter('fieldsJson', itemIndex, '{}') as string | IDataObject;

		if (typeof fieldsJson === 'object') {
			return fieldsJson;
		}

		try {
			return JSON.parse(fieldsJson || '{}') as IDataObject;
		} catch {
			throw new Error('Fields (JSON) must be valid JSON.');
		}
	}

	const fieldsUi = this.getNodeParameter('fieldsUi', itemIndex, {}) as {
		field?: Array<{
			name?: string;
			value?: unknown;
		}>;
	};

	const fields: IDataObject = {};

	for (const field of fieldsUi?.field ?? []) {
		if (!field.name) {
			continue;
		}

		fields[field.name] = castValue(field.value) as IDataObject[string];
	}

	return fields;
}

/**
 * Best-effort value casting for UI fields.
 */
function castValue(value: unknown): unknown {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();

	if (trimmed === '') {
		return '';
	}

	if (trimmed.toLowerCase() === 'true') {
		return true;
	}

	if (trimmed.toLowerCase() === 'false') {
		return false;
	}

	if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
		return Number(trimmed);
	}

	if (
		(trimmed.startsWith('{') && trimmed.endsWith('}')) ||
		(trimmed.startsWith('[') && trimmed.endsWith(']'))
	) {
		try {
			return JSON.parse(trimmed);
		} catch {
			return value;
		}
	}

	return value;
}
