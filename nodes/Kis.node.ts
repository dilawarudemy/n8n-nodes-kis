import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';
import {
	kisApiRequest,
	loadCollections,
	loadDocumentIds,
	loadCollectionFields,
	getFieldsFromParameters,
} from './GenericFunctions';

export class Kis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'KIS',
		name: 'kis',
		icon: 'file:kis.svg',
		group: ['output'],
		version: 1,
		description: 'Interact with KIS data',
		defaults: {
			name: 'KIS',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'kisApi', required: true }],

		properties: [
			// RESOURCE
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Data',
						value: 'data',
					},
					{
						name: 'Collection',
						value: 'collection',
					},
				],
				default: 'data',
			},

			// OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['data'] },
				},
				options: [
					{ name: 'Create', value: 'create' },
					{ name: 'Update', value: 'update' },
					{ name: 'Delete', value: 'delete' },
					{ name: 'Search', value: 'search' },
				],
				default: 'search',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: { resource: ['collection'] },
				},
				options: [
					{ name: 'Get All', value: 'getAll' },
				],
				default: 'getAll',
			},

			// COLLECTION
			{
				displayName: 'Collection',
				name: 'collection',
				type: 'options',
				required: true,
				typeOptions: { loadOptionsMethod: 'getCollections' },
				default: '',
				displayOptions: {
					show: { resource: ['data'] },
				},
			},

			// DOCUMENT ID (for update/delete)
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'options',
				required: true,
				typeOptions: {
					loadOptionsMethod: 'getDocumentIds',
					loadOptionsDependsOn: ['collection'],
				},
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['update', 'delete'],
					},
				},
				default: '',
			},

			// LIMIT (search)
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['search'],
					},
				},
			},

			// FILTERS (Search)
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {
					filter: [],
				},
				placeholder: 'Add Filter',
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['search'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Field',
								name: 'filter_column',
								type: 'string',
								default: '',
								description: 'Column name to filter',
							},
							{
								displayName: 'Operator',
								name: 'filter_operator',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'eq' },
									{ name: 'Not Equals', value: 'ne' },
									{ name: 'Greater Than', value: 'gt' },
									{ name: 'Greater Or Equal', value: 'gte' },
									{ name: 'Less Than', value: 'lt' },
									{ name: 'Less Or Equal', value: 'lte' },
									{ name: 'Like', value: 'like' },
								],
								default: 'eq',
							},
							{
								displayName: 'Value',
								name: 'filter_value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},

			// EXECUTION SAFETY (Update / Delete)
			{
				displayName: 'Apply To All Input Items',
				name: 'applyToAllItems',
				type: 'boolean',
				default: false,
				description:
					'If false, runs once only. If true, runs once per incoming item.',
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['update', 'delete'],
					},
				},
			},

			// FIELDS (Create / Update)
			{
				displayName: 'JSON Parameters',
				name: 'jsonParameters',
				type: 'boolean',
				default: false,
				description: 'Whether to send the fields as JSON',
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Fields (UI)',
				name: 'fieldsUi',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['create', 'update'],
						jsonParameters: [false],
					},
				},
				default: {},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getCollectionFields',
									loadOptionsDependsOn: ['collection'],
								},
								default: '',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Fields (JSON)',
				name: 'fieldsJson',
				type: 'json',
				default: '{}',
				description: 'JSON object of fields to create or update. Example: {"foo":"bar","count":2}',
				displayOptions: {
					show: {
						resource: ['data'],
						operation: ['create', 'update'],
						jsonParameters: [true],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getCollections(this: ILoadOptionsFunctions) {
				return loadCollections.call(this);
			},
			async getDocumentIds(this: ILoadOptionsFunctions) {
				return loadDocumentIds.call(this);
			},
			async getCollectionFields(this: ILoadOptionsFunctions) {
				return loadCollectionFields.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i);
				const operation = this.getNodeParameter('operation', i);
				const applyToAllItems = operation === 'update' || operation === 'delete'
					? this.getNodeParameter('applyToAllItems', i, false) as boolean
					: true;

				if (!applyToAllItems && i > 0) {
					continue;
				}

				// ======================
				// COLLECTION: GET ALL
				// ======================
				if (resource === 'collection' && operation === 'getAll') {
					const resp = await kisApiRequest.call(this, {
						method: 'GET',
						url: '/api_token_access/collections',
					});

					returnData.push({ json: resp });
				}

				// ======================
				// DATA OPERATIONS
				// ======================
				if (resource === 'data') {
					const collection = this.getNodeParameter('collection', i);

					// CREATE
					if (operation === 'create') {
						const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;
						const fields = getFieldsFromParameters.call(this, i, jsonParameters);

						const resp = await kisApiRequest.call(this, {
							method: 'POST',
							url: '/api_token_access/data_handlers',
							body: {
								data_handler: {
									collection_name: collection,
									documents: [fields],
								},
							},
						});

						returnData.push({ json: resp });
					}

					// UPDATE
					if (operation === 'update') {
						const documentId = this.getNodeParameter('documentId', i);
						const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;
						const fields = getFieldsFromParameters.call(this, i, jsonParameters);

						const resp = await kisApiRequest.call(this, {
							method: 'PUT',
							url: `/api_token_access/data_handlers/${documentId}`,
							body: {
								data_handler: {
									collection_name: collection,
									documents: [
										{
											_id: documentId,
											...fields,
										},
									],
								},
							},
						});

						returnData.push({ json: resp });
					}

					// DELETE
					if (operation === 'delete') {
						const documentId = this.getNodeParameter('documentId', i);

						const resp = await kisApiRequest.call(this, {
							method: 'DELETE',
							url: `/api_token_access/data_handlers/${documentId}`,
							body: {
								data_handler: {
									collection_name: collection,
									document_id: documentId,
								},
							},
							returnFullResponse: true,
							ignoreHttpStatusErrors: true,
						});

						const status = (resp as any)?.statusCode ?? (resp as any)?.status;
						const body = (resp as any)?.body;

						returnData.push({
							json: status === 204 || status === '204'
								? { msg: 'Deleted', id: documentId, collection, status }
								: { msg: 'Failed to Delete.', id: documentId, collection, status, body },
						});
					}

					// SEARCH
					if (operation === 'search') {
						const limit = this.getNodeParameter('limit', i);
						const filtersParam = this.getNodeParameter('filters', i, {}) as {
							filter?: Array<{
								filter_column?: string;
								filter_operator?: string;
								filter_value?: string;
							}>;
						};
						const filters = (filtersParam?.filter ?? [])
							.filter((filter) => filter.filter_column && filter.filter_operator)
							.map((filter) => ({
								filter_column: filter.filter_column as string,
								filter_operator: filter.filter_operator as string,
								filter_value: filter.filter_value ?? '',
							}));

						const body: {
							data_handler: {
								collection_name: string;
								limit: number;
								filters?: Array<{
									filter_column: string;
									filter_operator: string;
									filter_value: string;
								}>;
							};
						} = {
							data_handler: {
								collection_name: collection as string,
								limit: limit as number,
							},
						};

						if (filters.length > 0) {
							body.data_handler.filters = filters;
						}

						const resp = await kisApiRequest.call(this, {
							method: 'POST',
							url: '/api_token_access/data_handlers/index',
							body,
						});

						const docs = resp?.queries?.[0]?.documents ?? [];

						for (const doc of docs) {
							returnData.push({
								json: {
									...doc,
									id: doc?._id?.$oid ?? doc?._id,
								},
							});
						}
					}
				}
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as any, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
