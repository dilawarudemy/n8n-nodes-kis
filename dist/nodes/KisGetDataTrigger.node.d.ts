import type { ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription, IPollFunctions } from 'n8n-workflow';
export declare class KisGetDataTrigger implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getCollections(this: ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
        };
    };
    poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
