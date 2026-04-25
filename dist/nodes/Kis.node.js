"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kis = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class Kis {
    constructor() {
        this.description = {
            displayName: 'KIS',
            name: 'kis',
            icon: 'file:kis.svg',
            group: ['output'],
            version: 1,
            description: 'Interact with KIS data',
            defaults: {
                name: 'KIS',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [{ name: 'kisApi', required: true }],
            properties: [
                // RESOURCE
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    options: [
                        {
                            name: 'Data',
                            value: 'data',
                        },
                        {
                            name: 'Collection',
                            value: 'collection',
                        },
                    ],
                    default: 'data',
                },
                // OPERATIONS
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    displayOptions: {
                        show: { resource: ['data'] },
                    },
                    options: [
                        { name: 'Create', value: 'create' },
                        { name: 'Update', value: 'update' },
                        { name: 'Delete', value: 'delete' },
                        { name: 'Search', value: 'search' },
                    ],
                    default: 'search',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    displayOptions: {
                        show: { resource: ['collection'] },
                    },
                    options: [
                        { name: 'Get All', value: 'getAll' },
                    ],
                    default: 'getAll',
                },
                // COLLECTION
                {
                    displayName: 'Collection',
                    name: 'collection',
                    type: 'options',
                    required: true,
                    typeOptions: { loadOptionsMethod: 'getCollections' },
                    default: '',
                    displayOptions: {
                        show: { resource: ['data'] },
                    },
                },
                // DOCUMENT ID (for update/delete)
                {
                    displayName: 'Document ID',
                    name: 'documentId',
                    type: 'options',
                    required: true,
                    typeOptions: {
                        loadOptionsMethod: 'getDocumentIds',
                        loadOptionsDependsOn: ['collection'],
                    },
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['update', 'delete'],
                        },
                    },
                    default: '',
                },
                // LIMIT (search)
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    default: 25,
                    typeOptions: {
                        minValue: 1,
                    },
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['search'],
                        },
                    },
                },
                // FILTERS (Search)
                {
                    displayName: 'Filters',
                    name: 'filters',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    default: {
                        filter: [],
                    },
                    placeholder: 'Add Filter',
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['search'],
                        },
                    },
                    options: [
                        {
                            name: 'filter',
                            displayName: 'Filter',
                            values: [
                                {
                                    displayName: 'Field',
                                    name: 'filter_column',
                                    type: 'string',
                                    default: '',
                                    description: 'Column name to filter',
                                },
                                {
                                    displayName: 'Operator',
                                    name: 'filter_operator',
                                    type: 'options',
                                    options: [
                                        { name: 'Equals', value: 'eq' },
                                        { name: 'Not Equals', value: 'ne' },
                                        { name: 'Greater Than', value: 'gt' },
                                        { name: 'Greater Or Equal', value: 'gte' },
                                        { name: 'Less Than', value: 'lt' },
                                        { name: 'Less Or Equal', value: 'lte' },
                                        { name: 'Like', value: 'like' },
                                    ],
                                    default: 'eq',
                                },
                                {
                                    displayName: 'Value',
                                    name: 'filter_value',
                                    type: 'string',
                                    default: '',
                                },
                            ],
                        },
                    ],
                },
                // EXECUTION SAFETY (Update / Delete)
                {
                    displayName: 'Apply To All Input Items',
                    name: 'applyToAllItems',
                    type: 'boolean',
                    default: false,
                    description: 'If false, runs once only. If true, runs once per incoming item.',
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['update', 'delete'],
                        },
                    },
                },
                // FIELDS (Create / Update)
                {
                    displayName: 'JSON Parameters',
                    name: 'jsonParameters',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to send the fields as JSON',
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['create', 'update'],
                        },
                    },
                },
                {
                    displayName: 'Fields (UI)',
                    name: 'fieldsUi',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    placeholder: 'Add Field',
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['create', 'update'],
                            jsonParameters: [false],
                        },
                    },
                    default: {},
                    options: [
                        {
                            name: 'field',
                            displayName: 'Field',
                            values: [
                                {
                                    displayName: 'Field Name',
                                    name: 'name',
                                    type: 'options',
                                    typeOptions: {
                                        loadOptionsMethod: 'getCollectionFields',
                                        loadOptionsDependsOn: ['collection'],
                                    },
                                    default: '',
                                    required: true,
                                },
                                {
                                    displayName: 'Value',
                                    name: 'value',
                                    type: 'string',
                                    default: '',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Fields (JSON)',
                    name: 'fieldsJson',
                    type: 'json',
                    default: '{}',
                    description: 'JSON object of fields to create or update. Example: {"foo":"bar","count":2}',
                    displayOptions: {
                        show: {
                            resource: ['data'],
                            operation: ['create', 'update'],
                            jsonParameters: [true],
                        },
                    },
                },
            ],
        };
        this.methods = {
            loadOptions: {
                async getCollections() {
                    return GenericFunctions_1.loadCollections.call(this);
                },
                async getDocumentIds() {
                    return GenericFunctions_1.loadDocumentIds.call(this);
                },
                async getCollectionFields() {
                    return GenericFunctions_1.loadCollectionFields.call(this);
                },
            },
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g;
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                const applyToAllItems = operation === 'update' || operation === 'delete'
                    ? this.getNodeParameter('applyToAllItems', i, false)
                    : true;
                if (!applyToAllItems && i > 0) {
                    continue;
                }
                // ======================
                // COLLECTION: GET ALL
                // ======================
                if (resource === 'collection' && operation === 'getAll') {
                    const resp = await GenericFunctions_1.kisApiRequest.call(this, {
                        method: 'GET',
                        url: '/api_token_access/collections',
                    });
                    returnData.push({ json: resp });
                }
                // ======================
                // DATA OPERATIONS
                // ======================
                if (resource === 'data') {
                    const collection = this.getNodeParameter('collection', i);
                    // CREATE
                    if (operation === 'create') {
                        const jsonParameters = this.getNodeParameter('jsonParameters', i);
                        const fields = GenericFunctions_1.getFieldsFromParameters.call(this, i, jsonParameters);
                        const resp = await GenericFunctions_1.kisApiRequest.call(this, {
                            method: 'POST',
                            url: '/api_token_access/data_handlers',
                            body: {
                                data_handler: {
                                    collection_name: collection,
                                    documents: [fields],
                                },
                            },
                        });
                        returnData.push({ json: resp });
                    }
                    // UPDATE
                    if (operation === 'update') {
                        const documentId = this.getNodeParameter('documentId', i);
                        const jsonParameters = this.getNodeParameter('jsonParameters', i);
                        const fields = GenericFunctions_1.getFieldsFromParameters.call(this, i, jsonParameters);
                        const resp = await GenericFunctions_1.kisApiRequest.call(this, {
                            method: 'PUT',
                            url: `/api_token_access/data_handlers/${documentId}`,
                            body: {
                                data_handler: {
                                    collection_name: collection,
                                    documents: [
                                        {
                                            _id: documentId,
                                            ...fields,
                                        },
                                    ],
                                },
                            },
                        });
                        returnData.push({ json: resp });
                    }
                    // DELETE
                    if (operation === 'delete') {
                        const documentId = this.getNodeParameter('documentId', i);
                        const resp = await GenericFunctions_1.kisApiRequest.call(this, {
                            method: 'DELETE',
                            url: `/api_token_access/data_handlers/${documentId}`,
                            body: {
                                data_handler: {
                                    collection_name: collection,
                                    document_id: documentId,
                                },
                            },
                            returnFullResponse: true,
                            ignoreHttpStatusErrors: true,
                        });
                        const status = (_a = resp === null || resp === void 0 ? void 0 : resp.statusCode) !== null && _a !== void 0 ? _a : resp === null || resp === void 0 ? void 0 : resp.status;
                        const body = resp === null || resp === void 0 ? void 0 : resp.body;
                        returnData.push({
                            json: status === 204 || status === '204'
                                ? { msg: 'Deleted', id: documentId, collection, status }
                                : { msg: 'Failed to Delete.', id: documentId, collection, status, body },
                        });
                    }
                    // SEARCH
                    if (operation === 'search') {
                        const limit = this.getNodeParameter('limit', i);
                        const filtersParam = this.getNodeParameter('filters', i, {});
                        const filters = ((_b = filtersParam === null || filtersParam === void 0 ? void 0 : filtersParam.filter) !== null && _b !== void 0 ? _b : [])
                            .filter((filter) => filter.filter_column && filter.filter_operator)
                            .map((filter) => {
                            var _a;
                            return ({
                                filter_column: filter.filter_column,
                                filter_operator: filter.filter_operator,
                                filter_value: (_a = filter.filter_value) !== null && _a !== void 0 ? _a : '',
                            });
                        });
                        const body = {
                            data_handler: {
                                collection_name: collection,
                                limit: limit,
                            },
                        };
                        if (filters.length > 0) {
                            body.data_handler.filters = filters;
                        }
                        const resp = await GenericFunctions_1.kisApiRequest.call(this, {
                            method: 'POST',
                            url: '/api_token_access/data_handlers/index',
                            body,
                        });
                        const docs = (_e = (_d = (_c = resp === null || resp === void 0 ? void 0 : resp.queries) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.documents) !== null && _e !== void 0 ? _e : [];
                        for (const doc of docs) {
                            returnData.push({
                                json: {
                                    ...doc,
                                    id: (_g = (_f = doc === null || doc === void 0 ? void 0 : doc._id) === null || _f === void 0 ? void 0 : _f.$oid) !== null && _g !== void 0 ? _g : doc === null || doc === void 0 ? void 0 : doc._id,
                                },
                            });
                        }
                    }
                }
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                    itemIndex: i,
                });
            }
        }
        return [returnData];
    }
}
exports.Kis = Kis;
