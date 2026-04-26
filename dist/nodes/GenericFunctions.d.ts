import type { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions, IPollFunctions, ITriggerFunctions, INodePropertyOptions, IDataObject } from 'n8n-workflow';
/**
 * KIS credentials shape used by this package.
 */
export type KisCreds = {
    baseUrl: string;
    appToken: string;
    secret: string;
};
/**
 * KIS returns a short-lived Authorization token from sign_in.
 * n8n's generic credential authentication cannot derive that dynamic header
 * from the saved app token/secret alone, so requests authenticate explicitly.
 */
export declare function kisGetAuthorization(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions | ITriggerFunctions): Promise<string>;
/**
 * Shared KIS API request helper.
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
