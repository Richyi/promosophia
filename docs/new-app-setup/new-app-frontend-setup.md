# New Application Frontend Client Setup Guide

This guide explains how to set up a new frontend client to connect with the backend API for authentication, authorization, and real-time agent interactions.

## Overview

The backend provides authentication via Stack Auth, multi-tenant data isolation, and real-time agent execution via WebSocket-like streaming endpoints. This guide covers all aspects of integrating a new frontend application with these services.

---

## 1. StackAuth Authentication & Authorization Setup

### 1.1 StackAuth Project Configuration

#### Create a New StackAuth Project

1. **Sign up for StackAuth**: Visit [stack-auth.com](https://stack-auth.com) and create an account
2. **Create a new project**: Choose a unique project name
3. **Configure authentication methods**: Enable email/password authentication
4. **Set up team (account) management**: Enable team creation and membership

#### Get Your Project Credentials

After creating your project, you'll receive:
- **Project ID**: A UUID identifying your StackAuth project
- **Publishable Client Key**: Safe for client-side use
- **Secret Server Key**: Keep this secure, only for server-side operations

```bash
# Example credentials (replace with your actual values)
STACK_PROJECT_ID=your-project-uuid-here
STACK_PUB_CLIENT_KEY=pck_your_publishable_key_here
STACK_SECRET_SERVER_KEY=ssk_your_secret_key_here
```

### 1.2 Frontend Authentication Setup

#### Install Dependencies

```bash
npm install @stackframe/stack
# or
yarn add @stackframe/stack
```

#### Server-Side Configuration (`stack.tsx`)

Create a server-side configuration file:

```typescript
// stack.tsx
import "server-only";
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie", // For Next.js apps
  projectId: process.env.STACK_PROJECT_ID!,
  publishableClientKey: process.env.STACK_PUB_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
  urls: {
    signIn: '/auth/signin', // Customize your sign-in URL
    // Add other URL customizations as needed
  }
});
```

#### Root Layout Configuration

Wrap your application with StackAuth providers:

```tsx
// app/layout.tsx
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
```

#### Authentication Handler

Create an authentication handler for OAuth callbacks:

```tsx
// app/handler/[...stack]/page.tsx
import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";

export default function Handler(props: unknown) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
```

### 1.3 Authentication Pages

#### Sign-In Page

```tsx
// app/auth/signin/page.tsx
import { SignIn } from '@stackframe/stack';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">
          Sign In to Your Account
        </h1>
        <SignIn />
      </div>
    </div>
  );
}
```

#### Sign-Up Page (Optional)

```tsx
// app/auth/signup/page.tsx
import { SignUp } from '@stackframe/stack';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">
          Create Your Account
        </h1>
        <SignUp />
      </div>
    </div>
  );
}
```

### 1.4 User Authentication Hooks

#### Basic User Hook

```tsx
// hooks/useAuth.ts
import { useUser } from "@stackframe/stack";

export function useAuth() {
  const user = useUser();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: user === undefined,
  };
}
```

#### Team/Account Context Hook

```tsx
// hooks/useCurrentAccount.ts
import { useUser } from "@stackframe/stack";

export function useCurrentAccount() {
  const user = useUser();

  return {
    account: user?.selectedTeam,
    accountId: user?.selectedTeam?.id,
    accountName: user?.selectedTeam?.displayName,
    userRole: user?.selectedTeam?.role, // 'owner', 'member', etc.
  };
}
```

### 1.5 Authorization & Permissions

#### Permission Checking

```tsx
// hooks/usePermissions.ts
import { useUser } from "@stackframe/stack";

export function usePermissions() {
  const user = useUser();

  const hasPermission = (permission: string): boolean => {
    if (!user?.selectedTeam) return false;

    // Admin/owner check
    if (user.selectedTeam.role === 'owner') return true;

    // Check specific permissions (if your app uses them)
    // This depends on how you've configured permissions in StackAuth
    return false; // Implement based on your permission system
  };

  return {
    hasPermission,
    isOwner: user?.selectedTeam?.role === 'owner',
    isMember: user?.selectedTeam?.role === 'member',
  };
}
```

#### Protected Route Component

```tsx
// components/ProtectedRoute.tsx
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermission?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission
}: ProtectedRouteProps) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && user === null) {
      router.push('/auth/signin');
      return;
    }

    if (requiredPermission && user?.selectedTeam) {
      // Check permission logic here
      const hasPermission = false; // Implement permission check
      if (!hasPermission) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, router, requireAuth, requiredPermission]);

  if (user === undefined) {
    return <div>Loading...</div>; // Loading state
  }

  if (requireAuth && user === null) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
```

### 1.6 Authentication Flow

#### Complete Authentication Flow

1. **User visits protected page** → Redirected to `/auth/signin`
2. **User enters credentials** → StackAuth validates against your project
3. **OAuth callback** → Handler processes authentication
4. **JWT token issued** → Stored in cookies (Next.js) or localStorage
5. **User context available** → `useUser()` hook provides user data
6. **Team selection** → User can switch between accounts they belong to

#### JWT Token Structure

The JWT token contains:
```json
{
  "sub": "user-uuid",           // User ID
  "selected_team_id": "team-uuid", // Current account/team ID
  "project_id": "project-uuid",    // StackAuth project ID
  "exp": 1234567890,             // Expiration timestamp
  "iat": 1234567890               // Issued at timestamp
}
```

---

## 2. Environment Variables Configuration

### 2.1 Required Environment Variables

Create a `.env.local` file in your project root:

```bash
# ==================================================
# STACK AUTH CONFIGURATION
# ==================================================

# StackAuth Project ID (from your StackAuth dashboard)
STACK_PROJECT_ID=your-project-uuid-here

# StackAuth Client Key (safe for client-side use)
STACK_PUB_CLIENT_KEY=pck_your_publishable_client_key

# StackAuth Server Key (keep secret, server-side only)
STACK_SECRET_SERVER_KEY=ssk_your_secret_server_key

# ==================================================
# BACKEND API CONFIGURATION
# ==================================================

# Backend API URL (where your backend server runs)
NEXT_PUBLIC_AGENT_URL=http://localhost:8000

# Backend API Key (for API authentication)
BACKEND_API_KEY=your-backend-api-key

# ==================================================
# OPTIONAL CONFIGURATION
# ==================================================

# StackAuth API URL (usually don't need to change)
NEXT_PUBLIC_STACK_API_URL=https://api.stack-auth.com

# Database URL (if your frontend needs direct DB access)
DATABASE_URL=your-database-connection-string

# Other service integrations
# Add as needed based on your specific requirements
```

### 2.2 Environment Variable Validation

Create an environment validation utility:

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // StackAuth
  STACK_PROJECT_ID: z.string().min(1, 'STACK_PROJECT_ID is required'),
  STACK_PUB_CLIENT_KEY: z.string().min(1, 'STACK_PUB_CLIENT_KEY is required'),
  STACK_SECRET_SERVER_KEY: z.string().min(1, 'STACK_SECRET_SERVER_KEY is required'),

  // Backend API
  NEXT_PUBLIC_AGENT_URL: z.string().url('NEXT_PUBLIC_AGENT_URL must be a valid URL'),
  BACKEND_API_KEY: z.string().min(1, 'BACKEND_API_KEY is required'),

  // Optional
  NEXT_PUBLIC_STACK_API_URL: z.string().url().optional().default('https://api.stack-auth.com'),
  DATABASE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

### 2.3 Environment-Specific Configuration

```typescript
// lib/config.ts
import { env } from './env';

export const config = {
  // StackAuth
  stackAuth: {
    projectId: env.STACK_PROJECT_ID,
    publishableClientKey: env.STACK_PUB_CLIENT_KEY,
    secretServerKey: env.STACK_SECRET_SERVER_KEY,
    apiUrl: env.NEXT_PUBLIC_STACK_API_URL,
  },

  // Backend API
  backend: {
    url: env.NEXT_PUBLIC_AGENT_URL,
    apiKey: env.BACKEND_API_KEY,
  },

  // Database (if needed)
  database: {
    url: env.DATABASE_URL,
  },

  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
```

---

## 3. Agent API Integration for Real-Time Updates

### 3.1 Understanding Agent Architecture

The backend provides real-time agent execution through:
- **Streaming responses** via Server-Sent Events (SSE)
- **State management** with LangGraph checkpoints
- **Interrupt handling** for user input requirements
- **Multi-tenant isolation** by account/team

### 3.2 Backend API Authentication Headers

All backend API calls require authentication headers:

```typescript
// lib/api.ts
import { useUser } from "@stackframe/stack";

export function useAuthenticatedFetch() {
  const user = useUser();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);

    // Backend API authentication
    headers.set('X-API-Key', process.env.BACKEND_API_KEY!);
    headers.set('X-Project-Id', process.env.STACK_PROJECT_ID!);
    headers.set('Content-Type', 'application/json');

    // User authentication (if user is logged in)
    if (user) {
      try {
        // Get JWT token from StackAuth
        const authJson = await user.getAuthJson();
        if (authJson?.accessToken) {
          headers.set('Authorization', `Bearer ${authJson.accessToken}`);
        }

        // Set account context
        if (user.selectedTeam?.id) {
          headers.set('X-Account-ID', user.selectedTeam.id);
        }
      } catch (error) {
        console.error('Error setting auth headers:', error);
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return authenticatedFetch;
}
```

### 3.3 Agent Execution Types

The backend supports different agent execution modes:

#### 3.3.1 Run Agent (New Execution)

```typescript
// hooks/useAgent.ts
import { useState } from 'react';
import { useAuthenticatedFetch } from '@/lib/api';

interface AgentState {
  messages: Array<{
    id: string;
    type: 'human' | 'ai' | 'system' | 'tool';
    content: string;
  }>;
  // Add other state properties as needed
}

export function useAgent() {
  const [isRunning, setIsRunning] = useState(false);
  const authenticatedFetch = useAuthenticatedFetch();

  const runAgent = async (threadId: string, initialMessage: string) => {
    setIsRunning(true);

    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_AGENT_URL}/agent`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'run',
          thread_id: threadId,
          state: {
            messages: [
              {
                role: 'user',
                content: initialMessage,
                // Add other message properties as needed
              }
            ],
            user_id: 'user-id-from-auth', // Will be overridden by backend
            account_id: 'account-id-from-auth', // Will be overridden by backend
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent execution failed: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      // Process Server-Sent Events
      // Implementation details in next section

    } catch (error) {
      console.error('Agent execution error:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  return { runAgent, isRunning };
}
```

#### 3.3.2 Resume Agent (Continue Interrupted Execution)

```typescript
const resumeAgent = async (threadId: string, userResponse: string) => {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_AGENT_URL}/agent`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'resume',
      thread_id: threadId,
      resume: {
        command: userResponse // The user's response to the interruption
      }
    }),
  });

  // Handle streaming response...
};
```

#### 3.3.3 Fork Agent (Branch from Checkpoint)

```typescript
const forkAgent = async (threadId: string, checkpointId: string, newState: any) => {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_AGENT_URL}/agent`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'fork',
      thread_id: threadId,
      config: {
        configurable: {
          thread_id: threadId,
          checkpoint_id: checkpointId
        }
      },
      state: newState
    }),
  });

  // Handle streaming response...
};
```

### 3.4 Real-Time Streaming Response Handling

#### Server-Sent Events Processing

```typescript
// lib/sse-parser.ts
export interface SSEEvent {
  event: string;
  data: any;
}

export function parseSSEStream(response: Response): AsyncIterable<SSEEvent> {
  if (!response.body) {
    throw new Error('Response has no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return {
    async *[Symbol.asyncIterator]() {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line

          for (const line of lines) {
            if (line.startsWith('event:')) {
              const eventType = line.slice(6).trim();
              // Parse the next 'data:' line
              const dataIndex = lines.indexOf(line) + 1;
              if (dataIndex < lines.length && lines[dataIndex].startsWith('data:')) {
                const dataStr = lines[dataIndex].slice(5).trim();
                try {
                  const data = JSON.parse(dataStr);
                  yield { event: eventType, data };
                } catch (e) {
                  console.error('Failed to parse SSE data:', dataStr);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
}
```

#### Complete Agent Hook with Streaming

```typescript
// hooks/useLangGraphAgent.ts
import { useState, useCallback } from 'react';
import { useAuthenticatedFetch } from '@/lib/api';
import { parseSSEStream } from '@/lib/sse-parser';

interface AgentCheckpoint {
  id: string;
  nodes: Array<{
    name: string;
    state: any;
  }>;
  state: any;
  error?: boolean;
  interruptValue?: any;
}

interface AgentMessage {
  id: string;
  type: 'human' | 'ai' | 'system' | 'tool';
  content: string;
  tool_calls?: any[];
}

export function useLangGraphAgent() {
  const [checkpoints, setCheckpoints] = useState<AgentCheckpoint[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const authenticatedFetch = useAuthenticatedFetch();

  const runAgent = useCallback(async (
    threadId: string,
    initialState: any
  ) => {
    setIsRunning(true);

    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_AGENT_URL}/agent`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'run',
          thread_id: threadId,
          state: initialState
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent execution failed: ${response.statusText}`);
      }

      // Process streaming events
      for await (const { event, data } of parseSSEStream(response)) {
        switch (event) {
          case 'checkpoint':
            handleCheckpoint(data);
            break;
          case 'message':
            handleMessage(data);
            break;
          case 'interrupt':
            handleInterrupt(data);
            break;
          case 'custom':
            handleCustomEvent(data);
            break;
          case 'error':
            handleError(data);
            break;
        }
      }

    } catch (error) {
      console.error('Agent execution error:', error);
      setIsRunning(false);
      throw error;
    }

    setIsRunning(false);
  }, [authenticatedFetch]);

  const handleCheckpoint = (checkpointData: any) => {
    const newCheckpoint: AgentCheckpoint = {
      id: checkpointData.config?.configurable?.checkpoint_id,
      nodes: checkpointData.next?.map((nodeName: string) => ({
        name: nodeName,
        state: {} // Node-specific state
      })) || [],
      state: checkpointData.values || {},
      error: false
    };

    setCheckpoints(prev => [...prev, newCheckpoint]);
  };

  const handleMessage = (messageData: any) => {
    const newMessage: AgentMessage = {
      id: messageData.message?.id || Date.now().toString(),
      type: messageData.message?.type || 'ai',
      content: messageData.message?.content || '',
      tool_calls: messageData.message?.tool_calls
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleInterrupt = (interruptData: any) => {
    // Handle agent interruption requiring user input
    console.log('Agent interrupted:', interruptData);
    // Update UI to show interruption and collect user response
  };

  const handleCustomEvent = (customData: any) => {
    // Handle custom application-specific events
    console.log('Custom event:', customData);
  };

  const handleError = (errorData: any) => {
    console.error('Agent error:', errorData);
    // Update UI to show error state
  };

  const stopAgent = useCallback(async (threadId: string) => {
    try {
      await authenticatedFetch(`${process.env.NEXT_PUBLIC_AGENT_URL}/agent/stop`, {
        method: 'POST',
        body: JSON.stringify({ thread_id: threadId }),
      });
    } catch (error) {
      console.error('Error stopping agent:', error);
    }
  }, [authenticatedFetch]);

  return {
    checkpoints,
    messages,
    isRunning,
    runAgent,
    stopAgent
  };
}
```

### 3.5 State Management and Persistence

#### Restoring Agent State

```typescript
// lib/agent-state.ts
export async function restoreAgentState(threadId: string): Promise<AgentCheckpoint[]> {
  const authenticatedFetch = useAuthenticatedFetch();

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_AGENT_URL}/history?thread_id=${threadId}`
  );

  if (!response.ok) {
    throw new Error('Failed to restore agent state');
  }

  const history = await response.json();
  return history.map(transformHistoryToCheckpoint);
}
```

#### Checkpoint Management

```typescript
// lib/checkpoint-utils.ts
export function transformHistoryToCheckpoint(historyItem: any): AgentCheckpoint {
  return {
    id: historyItem.checkpoint_id,
    nodes: [], // Transform based on your graph structure
    state: historyItem.values,
    error: false,
    createdAt: new Date(historyItem.created_at)
  };
}
```

### 3.6 Error Handling and Connection Management

```typescript
// hooks/useAgentConnection.ts
import { useEffect, useRef } from 'react';

export function useAgentConnection() {
  const abortControllerRef = useRef<AbortController>();

  const cancelCurrentRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    }
  };

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    cancelCurrentRequest,
    getSignal: () => abortControllerRef.current?.signal
  };
}
```

---

## 4. Complete Integration Example

### 4.1 Main Application Component

```tsx
// app/dashboard/page.tsx
import { useLangGraphAgent } from '@/hooks/useLangGraphAgent';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Dashboard() {
  const { user } = useAuth();
  const { checkpoints, messages, isRunning, runAgent, stopAgent } = useLangGraphAgent();

  const handleSendMessage = async (message: string) => {
    if (!user?.selectedTeam?.id) return;

    await runAgent(`thread-${Date.now()}`, {
      messages: [{
        role: 'user',
        content: message,
      }],
      user_id: user.id,
      account_id: user.selectedTeam.id,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.displayName}!
          </h1>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {/* Messages Display */}
              <div className="h-96 overflow-y-auto border rounded p-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-2 ${
                    msg.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <span className={`inline-block p-2 rounded ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}>
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const message = formData.get('message') as string;
                if (message.trim()) {
                  handleSendMessage(message);
                  (e.target as HTMLFormElement).reset();
                }
              }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="message"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded"
                    disabled={isRunning}
                  />
                  <button
                    type="submit"
                    disabled={isRunning}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    {isRunning ? 'Running...' : 'Send'}
                  </button>
                  {isRunning && (
                    <button
                      type="button"
                      onClick={() => stopAgent(checkpoints[0]?.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### 4.2 Environment Setup Script

```bash
#!/bin/bash
# setup-env.sh

# Copy environment template
cp .env.example .env.local

echo "Please update the following values in .env.local:"
echo "1. STACK_PROJECT_ID - Get from StackAuth dashboard"
echo "2. STACK_PUB_CLIENT_KEY - Get from StackAuth dashboard"
echo "3. STACK_SECRET_SERVER_KEY - Get from StackAuth dashboard"
echo "4. BACKEND_API_KEY - Get from backend administrator"
echo "5. NEXT_PUBLIC_AGENT_URL - Backend API URL"

echo ""
echo "After updating environment variables, run:"
echo "npm install"
echo "npm run dev"
```

---

## 5. Troubleshooting

### Common Issues

#### Authentication Issues
- **"Invalid token"**: Check JWT expiration and StackAuth project configuration
- **"User not found in account"**: Ensure user is a member of the selected team
- **403 Forbidden**: Check user permissions and account membership

#### API Connection Issues
- **CORS errors**: Ensure backend allows your frontend domain
- **401 Unauthorized**: Verify BACKEND_API_KEY and STACK_PROJECT_ID
- **Connection refused**: Check NEXT_PUBLIC_AGENT_URL is correct

#### Real-time Updates Issues
- **No streaming events**: Check Server-Sent Events implementation
- **Interrupted connections**: Implement reconnection logic
- **State desync**: Ensure proper checkpoint handling

### Debug Configuration

```typescript
// lib/debug.ts
export const DEBUG_MODE = process.env.NODE_ENV === 'development';

export function debugLog(message: string, data?: any) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

export function debugError(message: string, error?: any) {
  if (DEBUG_MODE) {
    console.error(`[ERROR] ${message}`, error);
  }
}
```

---

## 6. StackAuth Webhook Integration for Database Synchronization

### 6.1 Understanding Webhook-Based Database Sync

The backend provides webhook endpoints that automatically synchronize your application database with StackAuth events. When users are created, updated, or deleted in StackAuth, or when teams and permissions change, the backend receives webhook notifications and updates the corresponding database records.

**Benefits:**
- **Real-time synchronization**: Database stays in sync with StackAuth
- **Multi-tenant isolation**: Each account's data is properly segregated
- **Audit trail**: All changes are tracked with timestamps
- **Error handling**: Failed webhook deliveries are logged and can be retried

### 6.2 Configuring StackAuth Webhooks

#### Step 1: Access StackAuth Dashboard

1. Log into your [StackAuth dashboard](https://stack-auth.com)
2. Navigate to your project settings
3. Find the "Webhooks" or "Integrations" section
4. View Details of the newly created webhook
5. Get Verification secret which is SVIX_WEBHOOK_SIGNING_SECRET (e.g. whsec_nLlFjKX762P5uTQE42baEp)
6. Add SVIX_WEBHOOK_SIGNING_SECRET environment variable to frontend .env

#### Step 2: Create Webhook Endpoint

Create a new webhook with the following configuration:

```json
{
  "name": "Database Sync Webhook",
  "url": "https://your-backend-domain.com/webhooks/stackauth",
  "method": "POST",
  "headers": {
    "X-API-Key": "your-backend-api-key",
    "X-Project-Id": "your-stack-project-id",
    "Content-Type": "application/json"
  },
  "events": [
    "user.created",
    "user.updated",
    "user.deleted",
    "team.created",
    "team.updated",
    "team.deleted",
    "team_membership.created",
    "team_membership.updated",
    "team_membership.deleted",
    "team_permission.created",
    "team_permission.updated",
    "team_permission.deleted"
  ]
}
```

#### Step 3: Environment Variables for Webhooks

Ensure your backend has the required environment variables:

```bash
# Backend API Key (used for webhook authentication)
BACKEND_API_KEY=your-backend-api-key

# Stack Project ID (used for webhook authentication)
STACK_PROJECT_ID=your-stack-project-id

# SVIX secret for signing webhook
SVIX_WEBHOOK_SIGNING_SECRET=your-svix-secret-for-webhook
```

### 6.3 Supported Webhook Events

The backend handles the following StackAuth webhook events:

#### User Events
- **`user.created`**: Creates new user record with profile information
- **`user.updated`**: Updates existing user information
- **`user.deleted`**: Soft deletes user (removes from database)

#### Team/Account Events
- **`team.created`**: Creates new account/team record
- **`team.updated`**: Updates account information
- **`team.deleted`**: Removes account and associated data

#### Membership Events
- **`team_membership.created`**: Adds user to account membership
- **`team_membership.updated`**: Updates membership information
- **`team_membership.deleted`**: Removes user from account

#### Permission Events
- **`team_permission.created`**: Grants permission to user in account
- **`team_permission.updated`**: Updates user permission
- **`team_permission.deleted`**: Revokes user permission

### 6.3.1 Example Webhook Frontend Code
```
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { z } from "zod";

const TeamIDSchema = z.string().describe("The unique identifier of this team");

const SelectedTeamSchema = z.object({
    id: TeamIDSchema,
    created_at_millis: z
        .number()
        .describe(
            "The time the team was created (the number of milliseconds since epoch, January 1, 1970, UTC)",
        ),
    display_name: z
        .string()
        .describe("Human-readable team display name. This is not a unique identifier."),
    profile_image_url: z
        .string()
        .nullish()
        .describe("URL of the profile image for team. Can be a Base64 encoded image. Must be smaller than 100KB. Please compress and crop to a square before passing in."),
    client_metadata: z
        .record(z.string(), z.any())
        .nullish()
        .describe(
            "Client metadata. Used as a data store, accessible from the client side. Do not store information that should not be exposed to the client.",
        ),
    server_metadata: z
        .record(z.string(), z.any())
        .nullish()
        .describe(
            "Server metadata. Used as a data store, only accessible from the server side. You can store secret information related to the team here.",
        ),
});

const TeamCreatedEventPayloadSchema = SelectedTeamSchema;
const TeamUpdatedEventPayloadSchema = SelectedTeamSchema;

const TeamDeletedEventPayloadSchema = z.object({
    id: TeamIDSchema,
});

const UserIDSchema = z.string().describe("The unique identifier of this user");

const UserCreatedEventPayloadSchema = z.object({
    id: UserIDSchema,
    primary_email: z.string().nullish().describe("Primary email"),
    primary_email_verified: z
        .boolean()
        .describe(
            "Whether the primary email has been verified to belong to this user",
        ),
    display_name: z
        .string()
        .nullish()
        .describe(
            "Human-readable user display name. This is not a unique identifier.",
        ),
    signed_up_at_millis: z
        .number()
        .describe(
            "The time the user signed up (the number of milliseconds since epoch, January 1, 1970, UTC)",
        ),
    last_active_at_millis: z
        .number()
        .describe(
            "The time the user was last active (identify) => `(the number of milliseconds since epoch, January 1, 1970, UTC)`",
        ),
    has_password: z
        .boolean()
        .describe("Whether the user has a password associated with their account"),
    selected_team: SelectedTeamSchema.nullish(),
    selected_team_id: z
        .string()
        .nullish()
        .describe("ID of the team currently selected by the user"),
    profile_image_url: z
        .string()
        .nullish()
        .describe(
            "URL of the profile image for user. Can be a Base64 encoded image. Please compress and crop to a square before passing in.",
        ),
    client_metadata: z
        .record(z.string(), z.any())
        .nullish()
        .describe(
            "Client metadata. Used as a data store, accessible from the client side. Do not store information that should not be exposed to the client.",
        ),
    server_metadata: z
        .record(z.string(), z.any())
        .nullish()
        .describe(
            "Server metadata. Used as a data store, only accessible from the server side. You can store secret information related to the user here.",
        ),
});

const UserUpdatedEventPayloadSchema = UserCreatedEventPayloadSchema;

const UserDeletedEventPayloadSchema = z.object({
    id: UserIDSchema,
});

const TeamMembershipCreatedEventPayloadSchema = z.object({
    team_id: TeamIDSchema,
    user_id: UserIDSchema,
});

const TeamMembershipDeletedEventPayloadSchema = TeamMembershipCreatedEventPayloadSchema;

const TeamPermissionIDSchema = z.string().describe("The permission ID used to uniquely identify a permission. Can either be a custom permission with lowercase letters, numbers, `:`, and `_` characters, or one of the system permissions: `$update_team`, `$delete_team`, `$read_members`, `$remove_members`, `$invite_members`, `$manage_api_keys`");

const TeamPermissionCreatedEventPayloadSchema = z.object({
    id: TeamPermissionIDSchema,
    team_id: TeamIDSchema,
    user_id: UserIDSchema,
});

const TeamPermissionDeletedEventPayloadSchema = TeamPermissionCreatedEventPayloadSchema;

const StackAuthEventPayloadSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("user.created"),
        data: UserCreatedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("user.updated"),
        data: UserUpdatedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("user.deleted"),
        data: UserDeletedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team.created"),
        data: TeamCreatedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team.updated"),
        data: TeamUpdatedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team.deleted"),
        data: TeamDeletedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team_membership.created"),
        data: TeamMembershipCreatedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team_membership.deleted"),
        data: TeamMembershipDeletedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team_permission.created"),
        data: TeamPermissionCreatedEventPayloadSchema,
    }),
    z.object({
        type: z.literal("team_permission.deleted"),
        data: TeamPermissionDeletedEventPayloadSchema,
    }),
]);

const SVIX_WEBHOOK_SIGNING_SECRET = process.env.SVIX_WEBHOOK_SIGNING_SECRET!;

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL;

export async function POST(request: Request) {
    const body = await request.text();

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key, parent) => {
        headers[key] = value;
    });

    const wh = new Webhook(SVIX_WEBHOOK_SIGNING_SECRET);

    let payload: any = {};

    try {
        payload = wh.verify(body, headers);
    } catch (e) {
        return NextResponse.json(
            { error: `Unable to verify webhook: ${(e as Error).message}` },
            { status: 401 },
        );
    }

    const parsedPayload = StackAuthEventPayloadSchema.parse(payload);

    try {
        const STACK_PROJECT_ID = process.env.STACK_PROJECT_ID;
        const apiUrl = `${AGENT_URL}/webhooks/stackauth`;
        console.log(`[StackAuth Webhook] Calling internal API at: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.BACKEND_API_KEY || '',
                'X-Project-ID': STACK_PROJECT_ID || '',
            },
            body: JSON.stringify(parsedPayload)
        });

        if (!response.ok) {
            console.log(`Backend error: ${response.statusText}`);
            return NextResponse.json(
                { error: `Backend error: ${response.statusText}` },
                { status: response.status },
            );
        }
        return NextResponse.json({ message: "Webhook received and processed successfully" });
    } catch (e) {
        return NextResponse.json(
            { error: `Unable to forward webhook to backend: ${(e as Error).message}` },
            { status: 500 },
        );
    }
}

// Optional: Add a verification endpoint for your domain
export async function GET(request: Request) {
    return Response.json(
        { message: 'StackAuth webhook endpoint is active' }
    );
}
```

### 6.4 Webhook Data Structure

#### User Event Payload
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
      "account_id": "team-uuid",
      "custom_field": "value"
    },
    "client_metadata": {
      "department": "Engineering"
    }
  }
}
```

#### Team Event Payload
```json
{
  "type": "team.created",
  "data": {
    "id": "team-uuid",
    "display_name": "Acme Corp",
    "created_at_millis": 1703123456789,
    "profile_image_url": "https://example.com/logo.jpg",
    "client_metadata": {
      "industry": "Technology"
    },
    "server_metadata": {
      "subscription_tier": "premium"
    }
  }
}
```

#### Membership Event Payload
```json
{
  "type": "team_membership.created",
  "data": {
    "team_id": "team-uuid",
    "user_id": "user-uuid"
  }
}
```

#### Permission Event Payload
```json
{
  "type": "team_permission.created",
  "data": {
    "id": "permission-id",
    "team_id": "team-uuid",
    "user_id": "user-uuid",
    "permission_type": "admin"
  }
}
```

### 6.5 Database Schema Updates

The webhook handler updates the following database tables:

#### User Table
```sql
CREATE TABLE User (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  updatedAt TIMESTAMP,
  signedUpAt TIMESTAMP,
  lastActiveAt TIMESTAMP,
  primaryEmailVerified BOOLEAN,
  accountId UUID REFERENCES Account(id),
  profileImageUrl VARCHAR(500),
  clientMetadata JSONB,
  serverMetadata JSONB
);
```

#### Account Table
```sql
CREATE TABLE Account (
  id UUID PRIMARY KEY,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  name VARCHAR(255),
  profileImageUrl VARCHAR(500),
  clientMetadata JSONB,
  serverMetadata JSONB
);
```

#### AccountMembership Table
```sql
CREATE TABLE AccountMembership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountId UUID REFERENCES Account(id),
  userId UUID REFERENCES User(id),
  updatedAt TIMESTAMP,
  UNIQUE(accountId, userId)
);
```

#### AccountPermission Table
```sql
CREATE TABLE AccountPermission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountId UUID REFERENCES Account(id),
  userId UUID REFERENCES User(id),
  permissionId VARCHAR(255),
  updatedAt TIMESTAMP,
  UNIQUE(accountId, userId, permissionId)
);
```

#### EmailAddress Table
```sql
CREATE TABLE EmailAddress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  userId UUID REFERENCES User(id),
  isPrimary BOOLEAN DEFAULT false,
  updatedAt TIMESTAMP
);
```

### 6.6 Webhook Processing Logic

#### User Creation/Update Flow
1. **Validate account exists**: Checks if `account_id` from metadata exists in Account table
2. **Upsert user record**: Creates or updates User table with profile information
3. **Sync email address**: Creates or updates primary email in EmailAddress table
4. **Handle metadata**: Stores client and server metadata as JSONB

#### Team/Account Creation/Update Flow
1. **Convert timestamps**: Transforms millisecond timestamps to database timestamps
2. **Upsert account record**: Creates or updates Account table
3. **Preserve metadata**: Stores client and server metadata

#### Membership Management Flow
1. **Find existing membership**: Queries AccountMembership table
2. **Update or create**: Upserts membership record with current timestamp
3. **Handle deletions**: Removes membership records when users leave teams

#### Permission Management Flow
1. **Validate membership**: Ensures user is still a member of the account
2. **Upsert permissions**: Creates or updates permission records
3. **Handle revocations**: Removes permission records when access is revoked

### 6.7 Webhook Security and Validation

#### Authentication
- **API Key validation**: Uses `X-API-Key` header for endpoint authentication
- **Project validation**: Uses `X-Project-Id` header to ensure correct project
- **Signature verification**: (Optional) Can implement webhook signature verification

#### Data Validation
- **Required fields**: Validates presence of critical identifiers
- **Account existence**: Ensures referenced accounts exist before creating users
- **Data type conversion**: Properly converts StackAuth data types to database formats
- **Sanitization**: Prevents injection attacks through proper data handling

### 6.8 Error Handling and Monitoring

#### Webhook Processing Errors
```typescript
// Backend error responses
{
  "detail": "account_id is required in server_metadata or selected_team_id"
}

{
  "detail": "Account with id 123-456-789 does not exist"
}
```

#### Monitoring Webhook Deliveries
- **StackAuth dashboard**: View webhook delivery status and retry failed deliveries
- **Backend logs**: Monitor webhook processing and database operations
- **Health checks**: Implement endpoint health monitoring

#### Retry Logic
- **Automatic retries**: StackAuth automatically retries failed webhook deliveries
- **Exponential backoff**: Implements increasing delays between retry attempts
- **Manual retries**: Failed webhooks can be manually retried from StackAuth dashboard

### 6.9 Testing Webhook Integration

#### Development Testing
```bash
# Use ngrok or similar to expose local backend
ngrok http 8000

# Update webhook URL in StackAuth dashboard
# https://abc123.ngrok.io/webhooks/stackauth
```

#### Manual Testing with curl
```bash
curl -X POST https://your-backend.com/webhooks/stackauth \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-backend-api-key" \
  -H "X-Project-Id: your-stack-project-id" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "test-user-id",
      "display_name": "Test User",
      "primary_email": "test@example.com",
      "selected_team_id": "test-account-id"
    }
  }'
```

#### Integration Testing Checklist
- [ ] Webhook URL is accessible and responding
- [ ] Authentication headers are properly configured
- [ ] All event types are subscribed to
- [ ] Database records are created/updated correctly
- [ ] Error scenarios are handled gracefully
- [ ] Sensitive data is properly secured

### 6.10 Production Deployment Considerations

#### Webhook URL Configuration
- **HTTPS required**: Webhooks must use HTTPS in production
- **Static IP**: Consider using a static IP for your backend
- **Load balancing**: Ensure webhook endpoint is accessible through load balancers

#### Security Best Practices
- **IP whitelisting**: Restrict webhook access to StackAuth IP ranges
- **Rate limiting**: Implement rate limiting to prevent abuse
- **Monitoring**: Set up alerts for webhook failures
- **Backup processing**: Implement dead letter queues for failed webhooks

#### Performance Considerations
- **Async processing**: Webhook handlers should be asynchronous
- **Database transactions**: Use transactions for data consistency
- **Connection pooling**: Ensure database connections are properly managed
- **Timeout handling**: Implement appropriate timeouts for external operations

### 6.11 Troubleshooting Webhook Issues

#### Common Problems and Solutions

**Webhooks not being delivered:**
- Check webhook URL is publicly accessible
- Verify authentication headers are correct
- Ensure HTTPS is used in production

**Database sync issues:**
- Check backend logs for processing errors
- Verify database connectivity and permissions
- Ensure required fields are present in webhook payload

**Authentication failures:**
- Confirm `BACKEND_API_KEY` matches backend configuration
- Verify `STACK_PROJECT_ID` is correct
- Check webhook endpoint authentication logic

**Data validation errors:**
- Review webhook payload structure against documentation
- Ensure account IDs exist before user creation
- Check timestamp format conversions

This webhook integration ensures your application database remains synchronized with StackAuth, providing real-time updates for user management, team changes, and permission modifications across your multi-tenant application.

---

This comprehensive guide provides everything needed to set up a new frontend client with full authentication, authorization, real-time agent integration, and database synchronization capabilities.</contents>
</xai:function_call">The file /Users/rich/workspace/rt-smarts/client/docs/new-frontend-setup.md has been updated.

Assistant: Great! I've created a comprehensive documentation file for setting up a new frontend client. Let me now update the TODO list to reflect the completion of this task. The documentation covers:

1. ✅ StackAuth authentication and authorization setup in detail
2. ✅ Environment variables needed for a new frontend client  
3. ✅ Explanation of how to interact with agent APIs in the backend for real-time updates

The documentation includes:
- Detailed StackAuth setup instructions
- Authentication flow explanations
- JWT token structure and usage
- Permission system implementation
- Environment variable configuration
- Real-time agent API integration
- Server-Sent Events handling
- Complete code examples
- Error handling and troubleshooting
- A practical integration example

This should provide everything a new frontend developer needs to integrate with the backend. Let me update the TODO list.<|control702|><xai:function_call name="todo_write">
<parameter name="merge">true
