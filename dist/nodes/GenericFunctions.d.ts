import type { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions, IPollFunctions, INodePropertyOptions, IDataObject } from 'n8n-workflow';
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
export declare function kisApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions, options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    body?: IDataObject;
    qs?: IDataObject;
    headers?: IDataObject;
    json?: boolean;
    returnFullResponse?: boolean;
    ignoreHttpStatusErrors?: boolean;
}): Promise<any>;
/**
 * Load KIS collections for dropdowns.
 */
export declare function loadCollections(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
/**
 * Load document IDs from selected collection.
 */
export declare function loadDocumentIds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
/**
 * Load fields from a selected collection.
 */
export declare function loadCollectionFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
/**
 * Build document fields from Create/Update node parameters.
 *
 * Supports:
 * - JSON mode: fieldsJson
 * - UI mode: fieldsUi.field[]
 */
export declare function getFieldsFromParameters(this: IExecuteFunctions, itemIndex: number, jsonParameters?: boolean): IDataObject;
