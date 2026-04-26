import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, ILoadOptionsFunctions } from 'n8n-workflow';
export declare class Kis implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getCollections(this: ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
            getDocumentIds(this: ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
            getCollectionFields(this: ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
