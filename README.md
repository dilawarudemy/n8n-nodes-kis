# n8n-nodes-kis

Community node package for **KIS ([getkis](https://kis.work))** in **n8n**.

This package provides nodes to interact with KIS collections
(datatables) and documents directly from n8n workflows.

------------------------------------------------------------------------

## Features

-   List collections
-   Search documents
-   Create documents
-   Update documents
-   Delete documents
-   Optional polling trigger 

------------------------------------------------------------------------

## Installation

### Install via n8n UI

1.  Go to **Settings → Community Nodes**

2.  Click **Install**

3.  Enter:

    n8n-nodes-kis

4.  Restart n8n

------------------------------------------------------------------------

## Credentials Setup

Create new credentials in n8n:

-   **Base URL**: https://api.getkis.io/api/v1
-   **App Token**
-   **App Secret**

Click **Save** and then **Test** to validate.

If authentication fails with 401: - Double-check token/secret - Remove
trailing spaces - Confirm correct Base URL

------------------------------------------------------------------------

## Nodes Included

### KIS Get All Collections

Lists all accessible collections.

------------------------------------------------------------------------

### KIS Search Data

Searches documents inside a collection.

Inputs: - Collection Name - Filters (if configured)

Returns: - One n8n item per document

------------------------------------------------------------------------

### KIS Create Data

Creates a new document in a collection.

Inputs: - Collection Name - Fields (UI) OR Fields (JSON)

Example JSON: { "name": "John Doe", "age": 35, "active": true }

------------------------------------------------------------------------

### KIS Update Data

Updates an existing document.

Inputs: - Collection Name - Document ID - Fields (UI) OR Fields (JSON)

------------------------------------------------------------------------

### KIS Delete Data

Deletes a document by ID.

Note: Be careful when running workflows with multiple incoming items, as
nodes execute once per item by default.

------------------------------------------------------------------------

## Permissions

If you receive errors like: - "Api key is not allowed to do this" - HTTP
422 permission errors

Check API access permissions in KIS Cloud and ensure: - Collection
access is enabled - Write permission is granted for Create/Update/Delete

------------------------------------------------------------------------

## Example Workflow

Manual Trigger → KIS Create Data

Fields JSON example: { "title": "Test Entry", "status": "active" }

------------------------------------------------------------------------

## Development

Build the project:

npm install npm run build

For local testing:

Windows CMD: set
N8N_CUSTOM_EXTENSIONS=C:`\path`{=tex}`\to`{=tex}`\n`{=tex}8n-nodes-kis`\dist`{=tex}
n8n start

------------------------------------------------------------------------

## License

MIT
