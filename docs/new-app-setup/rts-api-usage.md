# RT-Smarts API Endpoints Documentation

This document describes all available API endpoints in the backend server, including detailed authentication requirements, request/response formats, and comprehensive error handling.

## Base URL
The API is served from the backend server. Frontend applications connect using the `NEXT_PUBLIC_AGENT_URL` environment variable.

## Authentication

### API Key Authentication
Most endpoints require API key authentication via headers:
- `X-API-Key`: Backend API key (from `BACKEND_API_KEY` environment variable)
- `X-Project-Id`: Stack project ID (from `STACK_PROJECT_ID` environment variable)

This authentication method is used for:
- Webhook endpoints (system-to-system communication)
- Administrative endpoints that don't require user context

### User Authentication
Certain endpoints require full user authentication with JWT token validation and permission checking:

**Required Headers:**
- `Authorization: Bearer <jwt_token>` - JWT token obtained from Stack Auth
- `X-API-Key: <backend_api_key>` - Backend API key for additional validation
- `X-Project-Id: <stack_project_id>` - Stack project ID

**JWT Token Requirements:**
- Must be valid Stack Auth JWT token
- Contains `sub` claim (user ID)
- Contains `selected_team_id` claim (account ID)
- Must be signed by Stack Auth and not expired

**Permission System:**
- Permissions are fetched from Stack Auth API for the specific user/team combination
- Special permissions: `"*"` or `"admin"` grant all access
- Specific permissions are checked for restricted operations
- Users must be members of the account (team) to access account-specific resources

**Environment Variables Required for User Authentication:**
```bash
# Stack Auth API URL for JWT verification and permission checking
NEXT_PUBLIC_STACK_API_URL=https://api.stack-auth.com dev (http://localhost:8102)

# Backend API key for dual authentication
BACKEND_API_KEY=your-backend-api-key

# Stack project ID for project identification
STACK_PROJECT_ID=your-stack-project-id

# Per-project Stack Auth keys (replace PROJECT_ID with actual project ID)
STACK_PUB_CLIENT_KEY_PROJECT_ID=your-publishable-client-key
STACK_SECRET_SERVER_KEY_PROJECT_ID=your-secret-server-key
```

## Required Frontend Environment Variables

The frontend needs these environment variables to connect to the backend API:

```bash
# Backend API URL (client-side accessible)
NEXT_PUBLIC_AGENT_URL=http://localhost:8000

# Stack Auth API URL for authentication flows
NEXT_PUBLIC_STACK_API_URL=https://api.stack-auth.com dev (http://localhost:8102)

# API Key for backend authentication
BACKEND_API_KEY=your-backend-api-key

# Stack project ID for project identification
STACK_PROJECT_ID=your-stack-project-id

# Stack Auth client configuration (from stack.tsx)
STACK_PUB_CLIENT_KEY=your-publishable-client-key
STACK_SECRET_SERVER_KEY=your-secret-server-key
```

## Endpoints

### 1. StackAuth Webhooks
**Endpoint:** `POST /webhooks/stackauth`

Handles StackAuth webhook events for synchronizing user, team, and membership data between Stack Auth and the application database.

**Authentication:** API Key authentication required
- `X-API-Key`: Backend API key
- `X-Project-Id`: Stack project ID

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `type` | `string` | Body | Required | Webhook event type | Specifies the type of StackAuth event. Options: user.created, user.updated, user.deleted, team.created, team.updated, team.deleted, team_membership.created, team_membership.updated, team_membership.deleted, team_permission.created, team_permission.updated, team_permission.deleted. |
| `data` | `object` | Body | Required | Event data payload | Contains the complete event data from StackAuth. Structure varies by event type but always includes an id field and event-specific metadata. |

**Request Body Example (User Created Event):**
```json
{
  "type": "user.created",
  "data": {
    "id": "user-uuid",
    "display_name": "John Doe",
    "primary_email": "john@example.com",
    "primary_email_verified": true,
    "signed_up_at_millis": 1703123456789,
    "last_active_at_millis": 1703123456789,
    "profile_image_url": "https://example.com/avatar.jpg",
    "selected_team_id": "team-uuid",
    "server_metadata": {
      "account_id": "team-uuid"
    },
    "client_metadata": {}
  }
}
```

**Data Usage:**
- **User Events**: Creates/updates/deletes user records, syncs email addresses
- **Team Events**: Creates/updates/deletes account records
- **Membership Events**: Manages user-to-account relationships
- **Permission Events**: Manages user permissions within accounts

**Response:**
```json
{
  "status": "success"
}
```

**Error Scenarios:**
- `400 Bad Request`: Missing `account_id` in server_metadata or selected_team_id
- `400 Bad Request`: Account with specified ID does not exist
- `401 Unauthorized`: Missing or invalid X-API-Key header
- `401 Unauthorized`: Missing or invalid X-Project-Id header
- `500 Internal Server Error`: Database operation failed or webhook processing error

### 2. Get Graph State
**Endpoint:** `GET /state`

Retrieves the current state of a LangGraph thread/graph execution.

**Authentication:** API Key authentication required
- `X-API-Key`: Backend API key
- `X-Project-Id`: Stack project ID

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `thread_id` | `string` (UUID) | Query | Required | Unique identifier of the LangGraph thread | Used to query the PostgreSQL checkpoint store for the thread's current state. Must be a valid UUID format. Locates the specific conversation thread and returns its latest checkpoint data including node states, variables, and execution context. |

**Data Usage:**
- `thread_id`: Used to locate the specific thread in the PostgreSQL checkpoint store
- Returns current node state, variables, and execution context

**Response:**
```json
{
  "id": "string", // State snapshot ID
  "created_at": "2025-01-01T00:00:00Z", // ISO timestamp
  "updated_at": "2025-01-01T00:00:00Z", // ISO timestamp
  "checkpoint_id": "string", // Checkpoint identifier
  "parent_checkpoint_id": "string", // Parent checkpoint (if any)
  "checkpoint_ns": "string", // Checkpoint namespace
  "thread_id": "string", // Thread identifier
  "metadata": {
    "account_id": "string", // Account that owns the thread
    "user_id": "string", // User who started the thread
    "langgraph_step": 1 // Current step number
  },
  "config": {
    "configurable": {
      "thread_id": "string"
    }
  },
  "values": {
    // Current state values (varies by graph)
  },
  "next": ["node_name"], // Next nodes to execute
  "tasks": [], // Pending tasks
  "error": null // Error information if any
}
```

**Error Scenarios:**
- `400 Bad Request`: Missing thread_id parameter
- `401 Unauthorized`: Missing or invalid X-API-Key header
- `401 Unauthorized`: Missing or invalid X-Project-Id header
- `404 Not Found`: Thread not found (implicit - returns empty/null state)

### 3. Get State History
**Endpoint:** `GET /history`

Retrieves complete execution history for a LangGraph thread, including all checkpoints and subgraph states.

**Authentication:** API Key authentication required
- `X-API-Key`: Backend API key
- `X-Project-Id`: Stack project ID

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `thread_id` | `string` (UUID) | Query | Required | Unique identifier of the LangGraph thread | Used to query all checkpoints and state snapshots for the thread from the PostgreSQL checkpoint store. Must be a valid UUID format. Retrieves both main graph checkpoints and subgraph checkpoints, sorted by creation time (newest first) for debugging and state restoration purposes. |

**Data Usage:**
- `thread_id`: Used to query all checkpoints and state snapshots for the thread
- Includes main graph checkpoints and any subgraph checkpoints
- Returns chronological history for debugging and state restoration

**Response:**
```json
[
  {
    "id": "string",
    "created_at": "2025-01-01T00:00:00Z",
    "checkpoint_id": "string",
    "checkpoint_ns": "string", // Empty string for main graph, subgraph name for subgraphs
    "thread_id": "string",
    "metadata": {
      "account_id": "string",
      "user_id": "string",
      "langgraph_step": 1
    },
    "values": {
      // State values at this checkpoint
    },
    "next": ["node_name"],
    "error": null
  }
]
```

**Notes:**
- Results are sorted by creation time (newest first)
- Includes checkpoints from subgraphs (checkpoint_ns will contain subgraph name)
- Used for thread debugging, state restoration, and audit trails

**Error Scenarios:**
- `400 Bad Request`: Missing thread_id parameter
- `401 Unauthorized`: Missing or invalid X-API-Key header
- `401 Unauthorized`: Missing or invalid X-Project-Id header

### 4. Stop Agent
**Endpoint:** `POST /agent/stop`

Stops a currently running LangGraph agent execution for a specific thread.

**Authentication:** Full user authentication required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User must have membership in the account that owns the thread
- Thread ownership is verified by checking account_id in thread metadata

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `thread_id` | `string` (UUID) | Body | Required | Unique identifier of the thread to stop | Identifies which active agent execution to terminate. Must be a valid UUID. Sets an asyncio.Event to signal the running agent to stop gracefully. Only affects threads that are currently running. |

**Request Body Example:**
```json
{
  "thread_id": "uuid-string"
}
```

**Data Usage:**
- `thread_id`: Identifies which active agent execution to terminate
- Sets an asyncio.Event to signal the running agent to stop gracefully
- Only affects threads that are currently running (have active connections)

**Response:**
```json
{
  "status": "stopped",
  "thread_id": "string"
}
```

**Error Scenarios:**
- `400 Bad Request`: Missing thread_id in request body
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: User is not a member of the account that owns the thread
- `404 Not Found`: Thread is not currently running (no active connection found)

### 5. Run Agent (Main Endpoint)
**Endpoint:** `POST /agent`

Executes LangGraph agents with real-time streaming responses via Server-Sent Events.

**Authentication:** Full user authentication required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User permissions are passed to the agent for access control within the graph
- Thread ownership is enforced - users can only interact with threads in their account

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `type` | `string` | Body | Required | Execution mode | Defines the type of agent execution. Options: "run" (start new), "resume" (continue interrupted), "fork" (branch from checkpoint), "replay" (replay from checkpoint). |
| `thread_id` | `string` (UUID) | Body | Required | Unique identifier of the LangGraph thread | Identifies the conversation thread for this agent execution. Must be a valid UUID. Used to track state and maintain conversation continuity. |
| `state` | `object` | Body | Required for "run"/"fork" | Initial graph state | Contains the starting state for new executions. Includes messages array, user/account context, and any graph-specific variables. |
| `resume` | `object` | Body | Required for "resume" | Continuation data | Contains user response to agent interruption. The "command" field provides the answer that allows the agent to continue execution. |
| `config` | `object` | Body | Required for "fork"/"replay" | Checkpoint configuration | Specifies which checkpoint to fork from or replay. Contains configurable thread_id and other checkpoint metadata. |
| `initiated_by` | `string` | Body | Optional | Source identifier | Tracks where the request originated (e.g., "email", "chat", "api"). Used for analytics and debugging. |
| `email_data` | `object` | Body | Optional | Email context | Provides email-specific context when the agent is triggered by an email. Contains subject, body, sender, and attachment information. |
| `files` | `array` | Body | Optional | File attachments | Array of file objects with name, type, and base64-encoded content. Files are processed and made available to the agent during execution. |

**Request Body Examples:**

**Start new agent execution:**
```json
{
  "type": "run",
  "thread_id": "uuid-string",
  "state": {
    "messages": [
      {"role": "user", "content": "Hello, I need help with my loan application"}
    ],
    "user_id": "auto-filled-from-jwt",
    "account_id": "auto-filled-from-jwt"
  },
  "initiated_by": "chat"
}
```

**Resume interrupted agent:**
```json
{
  "type": "resume",
  "thread_id": "uuid-string",
  "resume": {
    "command": "Yes, I would like to proceed with the loan application"
  }
}
```

**Fork from checkpoint:**
```json
{
  "type": "fork",
  "thread_id": "uuid-string",
  "config": {
    "configurable": {
      "thread_id": "original-thread-uuid"
    }
  },
  "state": {
    "messages": []
  }
}
```

**Execution Types:**
- `"run"`: Start new agent execution with initial state
- `"resume"`: Continue interrupted agent with user response
- `"fork"`: Create new thread from existing checkpoint state
- `"replay"`: Replay execution from specific checkpoint

**Data Usage:**
- `user_id`: Extracted from JWT token, used for personalization and access control
- `account_id`: Extracted from JWT token, ensures multi-tenant isolation
- `thread_id`: Identifies the conversation thread in the database
- `files`: Processed and stored for agent access during execution
- `email_data`: Provides context for email-triggered workflows
- `initiated_by`: Tracks the source of the agent invocation

**Response:** Server-Sent Events stream

**Event Types:**
- `checkpoint`: State persistence updates
- `interrupt`: Agent requires user input to continue
- `message`: Agent response messages
- `custom`: Application-specific events

**Error Scenarios:**
- `400 Bad Request`: Missing required type parameter
- `400 Bad Request`: Missing required thread_id parameter
- `400 Bad Request`: Missing resume data for 'resume' type
- `400 Bad Request`: Missing config data for 'fork'/'replay' types
- `400 Bad Request`: Invalid type parameter
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: User is not a member of the account
- `403 Forbidden`: Thread belongs to different account

### 6. List Adapters
**Endpoint:** `GET /api/adapters`

Retrieves all API adapters configured for a specific account.

**Authentication:** Full user authentication required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- Account ID from JWT must match the requested account_id parameter
- User must have membership in the account

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `account_id` | `string` (UUID) | Query | Required | Unique identifier of the account | Filters adapters to only those belonging to the specified account. Must match the account_id from the user's JWT token for security. Ensures multi-tenant isolation - users can only see adapters for accounts they belong to. Used to query the ApiAdapter table for records where accountId matches this value. |

**Data Usage:**
- `account_id`: Filters adapters to only those belonging to the specified account
- Ensures multi-tenant isolation - users can only see adapters for accounts they belong to

**Response:**
```json
{
  "adapters": [
    {
      "id": "string", // Adapter UUID
      "name": "string", // Human-readable name
      "description": "string", // Description of the adapter
      "accountId": "string", // Account that owns the adapter
      "createdAt": "2025-01-01T00:00:00Z", // ISO timestamp
      "updatedAt": "2025-01-01T00:00:00Z", // ISO timestamp
      "createdBy": "string", // User ID who created the adapter
      "config": {
        // Adapter-specific configuration
      },
      "isActive": true // Whether adapter is enabled
    }
  ]
}
```

**Error Scenarios:**
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: Account ID mismatch (user requesting adapters for account they don't belong to)

### 7. Create Adapter
**Endpoint:** `POST /api/adapters`

Creates a new API adapter for connecting external services.

**Authentication:** Full user authentication with `write_adapter` permission required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User must have `write_adapter` permission in the account
- Special permissions: `"*"` or `"admin"` grant access
- Account ID in request must match user's account from JWT

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `accountId` | `string` (UUID) | Body | Required | Account that will own the adapter | Must match the account_id from the user's JWT token for security. Ensures the adapter is created in the correct account and user has permissions there. |
| `name` | `string` | Body | Required | Unique adapter name within account | Human-readable identifier for the adapter. Must be unique within the account. Used for referencing the adapter in API calls and UI. |
| `description` | `string` | Body | Optional | Human-readable description | Optional description of what the adapter does and its purpose. |
| `adapterType` | `string` | Body | Required | Type of adapter | Defines the adapter implementation type (e.g., "rest_api", "graphql"). Determines which adapter class to instantiate. |
| `baseUrl` | `string` (URL) | Body | Required | Base URL for API calls | The root URL for all API calls made through this adapter. All endpoint paths are relative to this URL. |
| `authType` | `string` | Body | Required | Authentication method | Specifies how to authenticate with the external API. Options: "none", "bearer", "api_key", "basic". |
| `authConfig` | `object` | Body | Required | Authentication configuration | Contains authentication details based on authType. For "api_key": {apiKey: string}, for "bearer": {bearerToken: string}, for "basic": {username: string, password: string}. |
| `headers` | `object` | Body | Optional | Default headers | Key-value pairs of headers to include in all API calls. Defaults to {"Content-Type": "application/json"}. |
| `timeout` | `number` | Body | Optional | Request timeout in milliseconds | How long to wait for API responses. Defaults to 30000 (30 seconds). |
| `retryConfig` | `object` | Body | Optional | Retry configuration | Defines retry behavior for failed requests. Contains maxRetries (default: 3) and backoffMultiplier (default: 2). |

**Request Body Example:**
```json
{
  "accountId": "uuid-string",
  "name": "my-rest-adapter",
  "description": "Adapter for connecting to external REST API",
  "adapterType": "rest_api",
  "baseUrl": "https://api.example.com/v1",
  "authType": "bearer",
  "authConfig": {
    "bearerToken": "your-api-token"
  },
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  "timeout": 30000,
  "retryConfig": {
    "maxRetries": 3,
    "backoffMultiplier": 2
  }
}
```

**Data Usage:**
- `accountId`: Ensures adapter is created in correct account (validated against JWT)
- `createdBy`: Automatically set to user_id from JWT token
- Adapter configuration is stored encrypted in database
- Name must be unique within the account

**Response:** Created adapter object with generated ID and timestamps

**Error Scenarios:**
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: Account ID mismatch between request and JWT
- `403 Forbidden`: Missing `write_adapter` permission

### 8. Update Adapter
**Endpoint:** `PUT /api/adapters/{adapter_id}`

Updates configuration of an existing API adapter.

**Authentication:** Full user authentication with `write_adapter` permission required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User must have `write_adapter` permission in the account
- Adapter ownership is verified - user must belong to account that owns the adapter

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `adapter_id` | `string` (UUID) | Path | Required | Unique identifier of the adapter to update | Identifies which adapter configuration to modify. Must be a valid UUID format. The adapter must exist and belong to the user's account. Used to query the ApiAdapter table and perform partial updates on the matching record. |
| `name` | `string` | Body | Optional | Updated adapter name | New name for the adapter. Must be unique within the account if provided. |
| `description` | `string` | Body | Optional | Updated description | New human-readable description for the adapter. |
| `authConfig` | `object` | Body | Optional | Updated authentication configuration | New authentication settings. Sensitive data is re-encrypted before storage. |
| `headers` | `object` | Body | Optional | Updated default headers | New default headers to include in API calls. |
| `timeout` | `number` | Body | Optional | Updated timeout | New request timeout in milliseconds. |
| `isActive` | `boolean` | Body | Optional | Adapter active status | Enable or disable the adapter. Inactive adapters cannot be used for API calls. |

**Request Body Example (Partial Update):**
```json
{
  "name": "updated-adapter-name",
  "description": "Updated description for the adapter",
  "timeout": 45000,
  "isActive": true
}
```
```json
{
  "name": "string", // Updated name
  "description": "string", // Updated description
  "authConfig": { // Updated authentication
    "bearerToken": "new_token"
  },
  "isActive": true, // Enable/disable adapter
  // Any other configurable fields
}
```

**Data Usage:**
- `adapter_id`: Identifies which adapter to update
- Only provided fields are updated (partial update)
- `updatedAt` timestamp is automatically set
- Sensitive fields like auth tokens are re-encrypted if changed

**Response:** Complete updated adapter object

**Error Scenarios:**
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: User is not a member of the account that owns the adapter
- `403 Forbidden`: Missing `write_adapter` permission
- `404 Not Found`: Adapter with specified ID not found

### 9. List Adapter Endpoints
**Endpoint:** `GET /api/adapters/{adapter_id}/endpoints`

Retrieves all configured endpoints for a specific API adapter.

**Authentication:** Full user authentication required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User must be a member of the account that owns the adapter
- Adapter ownership is verified before returning endpoints

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|-------------|-------|
| `adapter_id` | `string` (UUID) | Path | Required | Unique identifier of the adapter | Identifies which adapter's endpoints to retrieve. Must be a valid UUID format. The adapter must exist and belong to the user's account. Used to query the ApiEndpoint table for records where adapterId matches this value, returning all endpoints associated with the specified adapter. |

**Response:**
```json
{
  "endpoints": [
    {
      "id": "string", // Endpoint UUID
      "adapterId": "string", // Parent adapter ID
      "name": "string", // Endpoint name (e.g., "getUsers", "createOrder")
      "description": "string", // Human-readable description
      "method": "GET|POST|PUT|DELETE|PATCH", // HTTP method
      "path": "string", // Relative path (e.g., "/users", "/orders/{id}")
      "headers": { // Additional headers for this endpoint
        "Accept": "application/json"
      },
      "queryParams": { // Default query parameters
        "limit": "100"
      },
      "requestSchema": { // JSON schema for request body validation
        "type": "object",
        "properties": {
          // Request schema definition
        }
      },
      "responseSchema": { // JSON schema for response validation
        "type": "object",
        "properties": {
          // Response schema definition
        }
      },
      "isActive": true, // Whether endpoint is enabled
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Error Scenarios:**
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: User is not a member of the account that owns the adapter
- `404 Not Found`: Adapter with specified ID not found

### 10. Create Adapter Endpoint
**Endpoint:** `POST /api/adapters/{adapter_id}/endpoints`

Creates a new endpoint configuration for an existing API adapter.

**Authentication:** Full user authentication with `write_adapter` permission required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User must have `write_adapter` permission in the account
- Adapter ownership is verified before creating endpoint

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|-------------|-------|
| `adapter_id` | `string` (UUID) | Path | Required | Unique identifier of the parent adapter | Identifies which adapter to add the new endpoint to. Must be a valid UUID format. The adapter must exist and belong to the user's account. Used to set the adapterId foreign key when creating the new ApiEndpoint record. The endpoint name must be unique within this specific adapter. |
| `name` | `string` | Body | Required | Unique endpoint name within adapter | Human-readable identifier for the endpoint. Must be unique within the parent adapter. Used for referencing the endpoint in API calls and UI. |
| `description` | `string` | Body | Optional | Human-readable description | Optional description of what the endpoint does and its purpose. |
| `method` | `string` | Body | Required | HTTP method | The HTTP method for the endpoint. Options: GET, POST, PUT, DELETE, PATCH. Determines the type of operation the endpoint performs. |
| `path` | `string` | Body | Required | Relative path with optional parameters | The API endpoint path relative to the adapter's baseUrl. Can include path parameters in curly braces (e.g., "/users/{userId}"). |
| `pathParams` | `object` | Body | Optional | Path parameter definitions | Defines the schema for path parameters found in the path string. Each parameter should have type and description fields. |
| `queryParams` | `object` | Body | Optional | Query parameter definitions | Defines the schema for query parameters that can be sent with the request. Each parameter can have type, default value, and description. |
| `headers` | `object` | Body | Optional | Additional headers | Key-value pairs of headers to include in requests to this endpoint. Merged with adapter-level default headers. |
| `requestSchema` | `object` | Body | Optional | JSON schema for request validation | JSON Schema object that validates the structure and types of request payloads. Used for runtime validation before sending requests. |
| `responseSchema` | `object` | Body | Optional | JSON schema for response validation | JSON Schema object that validates the structure and types of API responses. Used for runtime validation of received data. |

**Request Body Example:**
```json
{
  "name": "getUsers",
  "description": "Retrieve a list of users",
  "method": "GET",
  "path": "/users",
  "queryParams": {
    "limit": {
      "type": "integer",
      "default": 100,
      "description": "Maximum number of results to return"
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive"],
      "description": "Filter users by status"
    }
  },
  "headers": {
    "Accept": "application/json"
  },
  "requestSchema": {
    "type": "object",
    "properties": {
      "limit": {"type": "integer", "minimum": 1, "maximum": 1000},
      "status": {"type": "string", "enum": ["active", "inactive"]}
    }
  },
  "responseSchema": {
    "type": "object",
    "properties": {
      "users": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": {"type": "string"},
            "name": {"type": "string"},
            "email": {"type": "string", "format": "email"}
          },
          "required": ["id", "name", "email"]
        }
      },
      "total": {"type": "integer"}
    },
    "required": ["users"]
  }
}
```

**Data Usage:**
- `adapterId`: Automatically set to the path parameter
- Endpoint name must be unique within the adapter
- Path parameters in the path string (e.g., `{userId}`) are validated against `pathParams` definition
- Schemas are used for runtime validation of requests and responses

**Response:** Created endpoint object with generated ID and timestamps

**Error Scenarios:**
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: User is not a member of the account that owns the adapter
- `403 Forbidden`: Missing `write_adapter` permission
- `404 Not Found`: Adapter with specified ID not found

### 11. Test Adapter Endpoint
**Endpoint:** `POST /api/adapters/test`

Tests an API adapter endpoint with sample data to verify configuration.

**Authentication:** Full user authentication required
- `Authorization: Bearer <jwt_token>` - Valid Stack Auth JWT token
- `X-API-Key: <backend_api_key>` - Backend API key
- `X-Project-Id: <stack_project_id>` - Stack project ID

**Authentication Details:**
- JWT token must contain valid `sub` (user_id) and `selected_team_id` (account_id)
- User must be a member of the account that owns the adapter
- Adapter ownership is verified before testing

**Request Parameters:**

| Parameter | Type | Location | Required | Description | Usage |
|-----------|------|----------|----------|-------------|-------|
| `adapterName` | `string` | Body | Required | Name of the adapter to test | Identifies which adapter configuration to use for the test. Must match an existing adapter name within the user's account. |
| `endpointName` | `string` | Body | Required | Name of the endpoint to test | Specifies which endpoint within the adapter to execute. Must match an existing endpoint name in the specified adapter. |
| `testData` | `object` | Body | Required | Sample request payload | JSON object containing sample data to send to the external API. This data is used as the request body or query parameters depending on the endpoint configuration. |
| `accountId` | `string` (UUID) | Body | Required | Account identifier | Must match the account_id from the user's JWT token. Ensures users can only test adapters they have access to within their account. |

**Request Body Example:**
```json
{
  "adapterName": "my-rest-adapter",
  "endpointName": "getUsers",
  "testData": {
    "limit": 10,
    "status": "active",
    "department": {
      "id": 123,
      "name": "Engineering"
    }
  },
  "accountId": "uuid-string"
}
```

**Data Usage:**
- `adapterName` and `endpointName`: Identify which adapter endpoint to test
- `testData`: Sample payload sent to the external API
- `accountId`: Ensures user can only test adapters they have access to
- Test makes actual HTTP call to external API using adapter configuration
- Validates request/response against configured schemas if present

**Response:** Test execution result
```json
{
  "success": true, // Whether the test succeeded
  "response": { // Actual response from external API
    "data": {},
    "status": 200,
    "headers": {}
  },
  "request": { // Details of the request made
    "url": "string",
    "method": "string",
    "headers": {},
    "body": {}
  },
  "validation": { // Schema validation results (if schemas configured)
    "requestValid": true,
    "responseValid": true,
    "errors": []
  },
  "duration": 1250, // Response time in milliseconds
  "error": null // Error message if test failed
}
```

**Error Scenarios:**
- `401 Unauthorized`: Missing/invalid Authorization header
- `401 Unauthorized`: Missing/invalid X-API-Key header
- `401 Unauthorized`: Missing/invalid X-Project-Id header
- `401 Unauthorized`: Invalid JWT token or missing user_id/account_id claims
- `403 Forbidden`: Account ID mismatch (user testing adapter for different account)
- `403 Forbidden`: User is not a member of the account that owns the adapter
- `404 Not Found`: Adapter or endpoint not found

## Error Responses

All endpoints return standardized HTTP error responses with detailed error messages.

### HTTP Status Codes and Scenarios

**400 Bad Request:**
- Missing required parameters (thread_id, account_id, adapter_id, etc.)
- Invalid request body format or structure
- Missing account_id in webhook data
- Account referenced in webhook doesn't exist
- Invalid type parameter for agent execution
- Missing resume/config data for specific agent types

**401 Unauthorized:**
- Missing or invalid X-API-Key header
- Missing or invalid X-Project-Id header
- Missing or invalid Authorization header (Bearer token)
- Invalid JWT token format or signature
- Missing user_id (sub) claim in JWT
- Missing account_id (selected_team_id) claim in JWT
- Failed to validate session with StackAuth API
- Authentication service (StackAuth) unavailable

**403 Forbidden:**
- Account ID mismatch (user accessing resources for different account)
- Thread belongs to different account than user
- User is not a member of the specified account
- Missing required permissions (write_adapter, etc.)
- User has no permissions for the account
- Insufficient permissions for operation

**404 Not Found:**
- Thread not currently running (agent/stop endpoint)
- Adapter not found
- Endpoint not found
- Resource doesn't exist

**500 Internal Server Error:**
- Database operation failures
- Webhook processing errors
- Graph compilation errors
- Internal server exceptions

**503 Service Unavailable:**
- StackAuth API unavailable for permission validation
- Database connection issues
- External service dependencies down

### Error Response Format
```json
{
  "detail": "Human-readable error description explaining what went wrong"
}
```

### Authentication-Specific Errors

**JWT Token Validation Failures:**
- Expired tokens
- Invalid issuer/audience
- Malformed tokens
- Tokens signed with wrong key

**Permission Validation Failures:**
- User not found in account membership
- No permissions assigned to user for account
- Required permission not in user's permission list
- Special permissions ("*" or "admin") required but not present

## Streaming Responses

The `/agent` endpoint uses Server-Sent Events (SSE) for real-time streaming of agent execution. Each event is sent as the agent progresses through its workflow.

### Server-Sent Events Format
```
event: <event_type>
data: <json_payload>

```

### Checkpoint Events
Persist state changes and execution progress.

```json
{
  "type": "checkpoint",
  "payload": {
    "next": ["tool_execution", "final_answer"], // Next nodes to execute
    "checkpoint_ns": "", // Namespace (empty for main graph)
    "checkpoint_id": "abc123", // Unique checkpoint identifier
    "config": {
      "configurable": {
        "thread_id": "uuid-string"
      }
    },
    "metadata": {
      "langgraph_step": 2,
      "account_id": "uuid",
      "user_id": "uuid"
    },
    "values": {
      // Current state values
      "messages": [...],
      "agent_scratchpad": "..."
    }
  }
}
```

### Interrupt Events
Agent requires user input to continue execution.

```json
{
  "type": "interrupt",
  "interrupts": [
    {
      "value": "Please provide the loan amount", // Question/prompt for user
      "resumable": true, // Whether execution can resume
      "ns": "", // Namespace
      "when": "during", // When the interrupt occurred
      "config": {
        "configurable": {
          "thread_id": "uuid-string"
        }
      }
    }
  ]
}
```

### Message Events
Agent response messages for UI display.

```json
{
  "type": "message",
  "node": "agent_response", // LangGraph node that emitted the message
  "message": {
    "id": "msg_123",
    "type": "ai", // "human", "ai", "system", "tool"
    "content": "Based on the loan application, I recommend...", // Message content
    "additional_kwargs": {}, // Extra metadata
    "response_metadata": { // Model-specific metadata
      "model_name": "gpt-4",
      "finish_reason": "stop"
    }
  }
}
```

### Custom Events
Application-specific events for specialized UI handling.

```json
{
  "type": "custom",
  "output_render_type": "custom_event",
  "event_name": "loan_analysis_complete",
  "data": {
    "loan_id": "uuid",
    "risk_score": 0.85,
    "recommendations": [...],
    "charts": {
      "risk_breakdown": "chart_data"
    }
  }
}
```

### Event Flow Example
1. **Initial Request** → Connection established
2. **Checkpoint** → Agent starts processing
3. **Message** → Agent sends initial response
4. **Checkpoint** → State persisted after tool call
5. **Message** → Tool execution result
6. **Interrupt** → Agent needs user clarification
7. **Connection closes** → Waits for resume command

### Connection Management
- Connections are tracked per thread_id
- Maximum one active connection per thread
- Automatic cleanup on completion or error
- Stop endpoint sets event to gracefully terminate stream

## CORS Configuration

The API is configured with CORS to allow all origins (`*`) in development. In production, origins should be restricted to specific domains.

## Rate Limiting

No explicit rate limiting is implemented in the current server configuration.
