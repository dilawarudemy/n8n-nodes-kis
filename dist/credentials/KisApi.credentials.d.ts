import type { ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';
export declare class KisApi implements ICredentialType {
    name: string;
    displayName: string;
    properties: INodeProperties[];
    test: ICredentialTestRequest;
}
