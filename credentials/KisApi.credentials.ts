import type {
	ICredentialDataDecryptedObject,
	ICredentialType,
	IDataObject,
	IHttpRequestOptions,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class KisApi implements ICredentialType {
	name = 'kisApi';
	displayName = 'KIS API';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.getkis.io/api/v1',
		},
		{
			displayName: 'App Token',
			name: 'appToken',
			type: 'string',
			default: '',
		},
		{
			displayName: 'App Secret',
			name: 'secret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Authorization',
			name: 'authorization',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
		},
	];

	// KIS returns a short-lived Authorization token from sign_in.
	async preAuthentication(
		this: { helpers: { httpRequest: (options: IHttpRequestOptions) => Promise<any> } },
		credentials: ICredentialDataDecryptedObject,
	): Promise<IDataObject> {
		const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');

		const fullResponse = await this.helpers.httpRequest({
			method: 'POST',
			url: `${baseUrl}/api_access_auth/sign_in`,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: {
				app_token: credentials.appToken,
				secret: credentials.secret,
			},
			json: true,
			returnFullResponse: true,
		});

		const headers = fullResponse?.headers ?? {};
		const authorization =
			headers.authorization ||
			headers.Authorization ||
			fullResponse?.body?.authorization ||
			fullResponse?.body?.Authorization;

		if (!authorization || typeof authorization !== 'string') {
			throw new Error('Authorization missing from KIS sign_in response.');
		}

		return { authorization };
	}

	authenticate = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> => {
		const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');
		const authorization = credentials.authorization;

		if (!authorization || typeof authorization !== 'string') {
			throw new Error('KIS authorization token is missing. Re-save the KIS credential so n8n can initialize the hidden authorization field.');
		}

		return {
			...requestOptions,
			url: requestOptions.url.startsWith('http')
				? requestOptions.url
				: `${baseUrl}${requestOptions.url.startsWith('/') ? requestOptions.url : `/${requestOptions.url}`}`,
			headers: {
				...requestOptions.headers,
				Authorization: authorization,
			},
		};
	};

	// This enables the Test button in n8n Credentials UI.
	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api_access_auth/sign_in',
			body: {
				app_token: '={{$credentials.appToken}}',
				secret: '={{$credentials.secret}}',
			},
			json: true,
		},
	};
}
