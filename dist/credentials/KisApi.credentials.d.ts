import type { ICredentialDataDecryptedObject, ICredentialType, IDataObject, IHttpRequestOptions, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';
export declare class KisApi implements ICredentialType {
    name: string;
    displayName: string;
    properties: INodeProperties[];
    preAuthentication(this: {
        helpers: {
            httpRequest: (options: IHttpRequestOptions) => Promise<any>;
        };
    }, credentials: ICredentialDataDecryptedObject): Promise<IDataObject>;
    authenticate: (credentials: ICredentialDataDecryptedObject, requestOptions: IHttpRequestOptions) => Promise<IHttpRequestOptions>;
    test: ICredentialTestRequest;
}
