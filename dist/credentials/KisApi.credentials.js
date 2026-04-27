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
        this.authenticate = async (credentials, requestOptions) => {
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
    // KIS returns a short-lived Authorization token from sign_in.
    async preAuthentication(credentials) {
        var _a, _b, _c;
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
        const headers = (_a = fullResponse === null || fullResponse === void 0 ? void 0 : fullResponse.headers) !== null && _a !== void 0 ? _a : {};
        const authorization = headers.authorization ||
            headers.Authorization ||
            ((_b = fullResponse === null || fullResponse === void 0 ? void 0 : fullResponse.body) === null || _b === void 0 ? void 0 : _b.authorization) ||
            ((_c = fullResponse === null || fullResponse === void 0 ? void 0 : fullResponse.body) === null || _c === void 0 ? void 0 : _c.Authorization);
        if (!authorization || typeof authorization !== 'string') {
            throw new Error('Authorization missing from KIS sign_in response.');
        }
        return { authorization };
    }
}
exports.KisApi = KisApi;
