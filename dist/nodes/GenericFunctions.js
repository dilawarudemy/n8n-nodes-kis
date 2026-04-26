"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kisGetAuthorization = kisGetAuthorization;
exports.kisApiRequest = kisApiRequest;
exports.loadCollections = loadCollections;
exports.loadDocumentIds = loadDocumentIds;
exports.loadCollectionFields = loadCollectionFields;
exports.getFieldsFromParameters = getFieldsFromParameters;
const n8n_workflow_1 = require("n8n-workflow");
/**
 * KIS returns a short-lived Authorization token from sign_in.
 * n8n's generic credential authentication cannot derive that dynamic header
 * from the saved app token/secret alone, so requests authenticate explicitly.
 */
async function kisGetAuthorization() {
    var _a, _b, _c;
    const credentials = (await this.getCredentials('kisApi'));
    const baseUrl = (credentials.baseUrl || '').replace(/\/+$/, '');
    if (!baseUrl) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), { message: 'Missing Base URL in KIS credentials.' });
    }
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
        throw new n8n_workflow_1.NodeApiError(this.getNode(), fullResponse, {
            message: 'Authorization missing from KIS sign_in response.',
        });
    }
    return authorization;
}
/**
 * Shared KIS API request helper.
 */
async function kisApiRequest(options) {
    var _a;
    const credentials = (await this.getCredentials('kisApi'));
    const authorization = await kisGetAuthorization.call(this);
    const baseUrl = (credentials.baseUrl || '').replace(/\/+$/, '');
    const url = options.url.startsWith('http')
        ? options.url
        : `${baseUrl}${options.url.startsWith('/') ? options.url : `/${options.url}`}`;
    return await this.helpers.httpRequest({
        method: options.method,
        url,
        body: options.body,
        qs: options.qs,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...options.headers,
            Authorization: authorization,
        },
        json: (_a = options.json) !== null && _a !== void 0 ? _a : true,
        returnFullResponse: options.returnFullResponse,
        ignoreHttpStatusErrors: options.ignoreHttpStatusErrors,
    });
}
/**
 * Load KIS collections for dropdowns.
 */
async function loadCollections() {
    var _a;
    const response = await kisApiRequest.call(this, {
        method: 'GET',
        url: '/api_token_access/collections',
        qs: {
            page: 1,
            per_page: 1000,
        },
    });
    const collections = (_a = response === null || response === void 0 ? void 0 : response.data) !== null && _a !== void 0 ? _a : [];
    return collections.map((collection) => {
        var _a, _b, _c, _d, _e, _f;
        return ({
            name: (_c = (_b = (_a = collection === null || collection === void 0 ? void 0 : collection.attributes) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : collection === null || collection === void 0 ? void 0 : collection.id) !== null && _c !== void 0 ? _c : 'Unknown',
            value: (_f = (_e = (_d = collection === null || collection === void 0 ? void 0 : collection.attributes) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : collection === null || collection === void 0 ? void 0 : collection.id) !== null && _f !== void 0 ? _f : '',
        });
    });
}
/**
 * Load document IDs from selected collection.
 */
async function loadDocumentIds() {
    var _a, _b, _c;
    const collection = this.getCurrentNodeParameter('collection');
    if (!collection) {
        return [];
    }
    const response = await kisApiRequest.call(this, {
        method: 'POST',
        url: '/api_token_access/data_handlers/index',
        body: {
            data_handler: {
                collection_name: collection,
                limit: 100,
            },
        },
    });
    const documents = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.queries) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.documents) !== null && _c !== void 0 ? _c : [];
    return documents
        .map((document) => {
        var _a, _b, _c;
        const id = (_c = (_b = (_a = document === null || document === void 0 ? void 0 : document._id) === null || _a === void 0 ? void 0 : _a.$oid) !== null && _b !== void 0 ? _b : document === null || document === void 0 ? void 0 : document._id) !== null && _c !== void 0 ? _c : document === null || document === void 0 ? void 0 : document.id;
        return {
            name: id,
            value: id,
        };
    })
        .filter((option) => Boolean(option.value));
}
/**
 * Load fields from a selected collection.
 */
async function loadCollectionFields() {
    var _a, _b, _c, _d, _e, _f;
    const collection = this.getCurrentNodeParameter('collection');
    if (!collection) {
        return [];
    }
    const listResponse = await kisApiRequest.call(this, {
        method: 'GET',
        url: '/api_token_access/collections',
        qs: {
            page: 1,
            per_page: 1000,
        },
    });
    const selectedCollection = (_a = listResponse === null || listResponse === void 0 ? void 0 : listResponse.data) === null || _a === void 0 ? void 0 : _a.find((entry) => { var _a; return ((_a = entry === null || entry === void 0 ? void 0 : entry.attributes) === null || _a === void 0 ? void 0 : _a.name) === collection || (entry === null || entry === void 0 ? void 0 : entry.id) === collection; });
    if (!selectedCollection) {
        return [];
    }
    let included = (_b = listResponse === null || listResponse === void 0 ? void 0 : listResponse.included) !== null && _b !== void 0 ? _b : [];
    if (!Array.isArray(included) || included.length === 0) {
        const detailResponse = await kisApiRequest.call(this, {
            method: 'GET',
            url: `/api_token_access/collections/${selectedCollection.id}`,
            qs: {
                include: 'fields',
            },
        });
        included = (_c = detailResponse === null || detailResponse === void 0 ? void 0 : detailResponse.included) !== null && _c !== void 0 ? _c : [];
    }
    const reserved = new Set(['_id', 'u_at', 'c_at']);
    const fieldIds = new Set(((_f = (_e = (_d = selectedCollection === null || selectedCollection === void 0 ? void 0 : selectedCollection.relationships) === null || _d === void 0 ? void 0 : _d.fields) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : [])
        .map((entry) => entry === null || entry === void 0 ? void 0 : entry.id)
        .filter(Boolean));
    const seen = new Set();
    return (included !== null && included !== void 0 ? included : [])
        .filter((field) => fieldIds.has(field === null || field === void 0 ? void 0 : field.id))
        .map((field) => { var _a; return (_a = field === null || field === void 0 ? void 0 : field.attributes) === null || _a === void 0 ? void 0 : _a.field_name; })
        .filter((fieldName) => {
        if (typeof fieldName !== 'string' || fieldName.length === 0) {
            return false;
        }
        if (reserved.has(fieldName) || seen.has(fieldName)) {
            return false;
        }
        seen.add(fieldName);
        return true;
    })
        .sort((a, b) => a.localeCompare(b))
        .map((fieldName) => ({
        name: fieldName,
        value: fieldName,
    }));
}
/**
 * Build document fields from Create/Update node parameters.
 *
 * Supports:
 * - JSON mode: fieldsJson
 * - UI mode: fieldsUi.field[]
 */
function getFieldsFromParameters(itemIndex, jsonParameters = false) {
    var _a;
    if (jsonParameters) {
        const fieldsJson = this.getNodeParameter('fieldsJson', itemIndex, '{}');
        if (typeof fieldsJson === 'object') {
            return fieldsJson;
        }
        try {
            return JSON.parse(fieldsJson || '{}');
        }
        catch {
            throw new Error('Fields (JSON) must be valid JSON.');
        }
    }
    const fieldsUi = this.getNodeParameter('fieldsUi', itemIndex, {});
    const fields = {};
    for (const field of (_a = fieldsUi === null || fieldsUi === void 0 ? void 0 : fieldsUi.field) !== null && _a !== void 0 ? _a : []) {
        if (!field.name) {
            continue;
        }
        fields[field.name] = castValue(field.value);
    }
    return fields;
}
/**
 * Best-effort value casting for UI fields.
 */
function castValue(value) {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmed = value.trim();
    if (trimmed === '') {
        return '';
    }
    if (trimmed.toLowerCase() === 'true') {
        return true;
    }
    if (trimmed.toLowerCase() === 'false') {
        return false;
    }
    if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
        return Number(trimmed);
    }
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
            return JSON.parse(trimmed);
        }
        catch {
            return value;
        }
    }
    return value;
}
