"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KisGetDataTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class KisGetDataTrigger {
    constructor() {
        this.description = {
            displayName: 'KIS New Document',
            name: 'kisGetDataTrigger',
            icon: 'file:kis.svg',
            group: ['trigger'],
            version: 1,
            description: 'Triggers when new documents are created in a KIS collection',
            defaults: {
                name: 'KIS New Document',
            },
            polling: true,
            inputs: [],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [
                {
                    name: 'kisApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Collection Name',
                    name: 'collection',
                    type: 'options',
                    required: true,
                    typeOptions: {
                        loadOptionsMethod: 'getCollections',
                    },
                    default: '',
                    description: 'Collection to monitor',
                },
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    default: 25,
                    typeOptions: {
                        minValue: 1,
                        maxValue: 200,
                    },
                    description: 'Maximum documents fetched per poll',
                },
            ],
        };
        this.methods = {
            loadOptions: {
                async getCollections() {
                    return GenericFunctions_1.loadCollections.call(this);
                },
            },
        };
    }
    async poll() {
        var _a, _b, _c;
        const webhookData = this.getWorkflowStaticData('node');
        const collection = this.getNodeParameter('collection');
        const limit = this.getNodeParameter('limit');
        const now = new Date().toISOString();
        let startDate = webhookData.lastTimeChecked;
        if (!startDate) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            startDate = oneDayAgo.toISOString();
        }
        const filters = [
            {
                filter_column: 'c_at',
                filter_operator: 'gt',
                filter_value: startDate,
            },
        ];
        try {
            const response = await GenericFunctions_1.kisApiRequest.call(this, {
                method: 'POST',
                url: '/api_token_access/data_handlers/index',
                body: {
                    data_handler: {
                        collection_name: collection,
                        limit,
                        filters,
                    },
                },
            });
            const docs = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.queries) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.documents) !== null && _c !== void 0 ? _c : [];
            if (!Array.isArray(docs) || docs.length === 0) {
                webhookData.lastTimeChecked = now;
                return null;
            }
            const items = docs.map((doc) => {
                var _a, _b;
                const id = (_b = (_a = doc === null || doc === void 0 ? void 0 : doc._id) === null || _a === void 0 ? void 0 : _a.$oid) !== null && _b !== void 0 ? _b : doc === null || doc === void 0 ? void 0 : doc._id;
                return {
                    ...doc,
                    id,
                };
            });
            let newestTimestamp = startDate;
            for (const doc of items) {
                if (!doc.c_at)
                    continue;
                if (new Date(doc.c_at).getTime() > new Date(newestTimestamp).getTime()) {
                    newestTimestamp = doc.c_at;
                }
            }
            webhookData.lastTimeChecked = newestTimestamp;
            return [this.helpers.returnJsonArray(items)];
        }
        catch (error) {
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
        }
    }
}
exports.KisGetDataTrigger = KisGetDataTrigger;
