import type {
	ICredentialType,
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
	];

	//  This enables the “Test” button in n8n Credentials UI
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
