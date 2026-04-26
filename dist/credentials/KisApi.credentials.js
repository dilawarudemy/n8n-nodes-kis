"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KisApi = void 0;
class KisApi {
    constructor() {
        this.name = 'kisApi';
        this.displayName = 'KIS API';
        this.properties = [
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
        this.test = {
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
}
exports.KisApi = KisApi;
