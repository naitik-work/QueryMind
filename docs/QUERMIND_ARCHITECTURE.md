# QueryMind — Architecture & Implementation Guide

A complete beginner-friendly guide to understand, run, and extend QueryMind — a personalized AI chat assistant built with the MERN stack.

---

## 1. Project Overview

### What is QueryMind?

QueryMind is a real-time AI chat application that remembers information about you across different conversations. Unlike a regular chatbot that forgets everything when you start a new chat, QueryMind learns your name, your goals, your preferences, and uses that knowledge to give you personalized responses.

### What Problem Does It Solve?

Regular AI chatbots treat every conversation as a blank slate. If you tell ChatGPT "I'm preparing for MERN interviews" in one chat, it won't remember that in a new chat. QueryMind solves this by extracting important facts from your conversations and storing them in a separate memory database. When you start a new chat, QueryMind retrieves your relevant memories and includes them in the AI context.

### Main Features

- Real-time chat with AI using Socket.IO (instant responses, no page refresh)
- Persistent personalized memory across different chat windows
- JWT-based authentication with email verification
- Chat history preserved in MongoDB
- Markdown rendering for AI responses (code blocks, lists, headings)
- Responsive design that works on desktop, tablet, and mobile
- Memory management — view, delete, or clear your stored memories

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Redux Toolkit |
| Real-time | Socket.IO (client + server) |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| AI | LangChain, Google Gemini, OpenRouter |
| Search | Tavily API (internet search tool) |
| Email | Nodemailer with Gmail OAuth2 |
| Auth | JWT + HTTP-only cookies |

---

## 2. Existing Architecture

Here is how data flows through the application:

```
User (Browser)
    ↓
React Frontend
    ↓
Socket.IO Client  ←→  Socket.IO Server
    ↓                      ↓
HTTP/REST API         Express Middleware
    ↓                      ↓
                    Controllers / Services
                           ↓
                    MongoDB (Mongoose)
                           ↓
                    AI Service (Gemini + LangChain)
```

**Frontend (React)**: The user interface. Built with React components, managed by Redux for state. Communicates with the backend through Socket.IO for real-time chat and HTTP/REST for things like loading chat history and authentication.

**Socket.IO**: A library that creates a persistent two-way connection between the browser and the server. Unlike regular HTTP (where the browser asks and the server responds), Socket.IO allows the server to push messages to the browser instantly.

**Express Backend**: Handles HTTP routes (login, register, get chats) and Socket.IO events (send message, join chat). Uses middleware for authentication.

**MongoDB**: Stores users, chats, messages, and memories. Mongoose provides schema validation and query helpers.

**AI Service**: Uses LangChain to create an AI agent with Google Gemini and a Tavily internet search tool. The agent can answer questions and search the internet when needed.

---

## 3. Folder Structure

```
backend/
├── server.js                          # Entry point — creates HTTP server, connects DB, starts Socket.IO
├── .env                               # Environment variables (secrets, API keys)
├── .env.example                       # Template for environment variables
├── package.json                       # Dependencies and scripts
└── src/
    ├── app.js                         # Express app setup — middleware, CORS, route mounting
    ├── config/
    │   └── database.js                # MongoDB connection using Mongoose
    ├── controllers/
    │   ├── auth.controller.js         # Register, login, logout, email verification, getMe
    │   ├── chat.controller.js         # REST endpoints for messages, chats (legacy + utility)
    │   └── memory.controller.js       # Get, delete, clear memories via REST
    ├── middlewares/
    │   └── auth.middlewares.js        # JWT verification middleware for HTTP routes
    ├── models/
    │   ├── user.model.js              # User schema — username, email, hashed password, verified flag
    │   ├── chat.model.js              # Chat schema — belongs to a user, has a title
    │   ├── message.model.js           # Message schema — belongs to a chat, has content and role
    │   └── memory.model.js            # Memory schema — belongs to a user, key-value facts
    ├── routes/
    │   ├── auth.routes.js             # /api/auth/* routes
    │   ├── chat.routes.js             # /api/chats/* routes
    │   └── memory.routes.js           # /api/memories/* routes
    ├── services/
    │   ├── ai.service.js              # AI response generation, chat title generation, memory extraction
    │   ├── internet.service.js        # Tavily internet search wrapper
    │   ├── mail.service.js            # Nodemailer email sending
    │   └── memory.service.js          # Memory CRUD, extraction, retrieval logic
    ├── sockets/
    │   └── server.socket.js           # Socket.IO server — auth middleware, chat events, message flow
    └── validator/
        └── auth.validation.js         # Express-validator rules for register/login

frontend/
├── index.html                         # HTML entry point — loads Inter font, sets title
├── vite.config.js                     # Vite + React + Tailwind configuration
├── .env.example                       # Frontend env template
├── public/
│   └── favicon.svg                    # QueryMind brain icon favicon
└── src/
    ├── main.jsx                       # React root — wraps App in Redux Provider
    ├── app/
    │   ├── App.jsx                    # Root component — runs auth check, renders router
    │   ├── app.routes.jsx             # React Router setup — login, register, protected dashboard
    │   ├── app.store.js               # Redux store with auth, chat, memory slices
    │   └── index.css                  # Tailwind v4 theme — colors, fonts, animations
    └── features/
        ├── auth/
        │   ├── auth.slice.js          # Redux slice — user, loading, error state
        │   ├── hook/useAuth.js        # Hook — register, login, logout, getMe
        │   ├── services/auth.api.js   # Axios calls to /api/auth/*
        │   ├── components/Protected.jsx  # Route guard — redirects to login if not authenticated
        │   └── pages/
        │       ├── Login.jsx          # Login form
        │       └── Register.jsx       # Register form with email verification flow
        ├── chat/
        │   ├── chat.slice.js          # Redux slice — chats, messages, typing, connection status
        │   ├── hooks/useChat.js       # Hook — Socket.IO connection, send message, load chats
        │   ├── service/
        │   │   ├── chat.api.js        # Axios calls for chat listing, message loading, deletion
        │   │   └── chat.socket.js     # Socket.IO client singleton
        │   ├── components/
        │   │   ├── Sidebar.jsx        # Sidebar with logo, chat list, new chat, settings
        │   │   ├── ChatComposer.jsx   # Message input with auto-resize textarea
        │   │   ├── MessageList.jsx    # Scrollable message list with markdown rendering
        │   │   └── EmptyState.jsx     # Welcome screen when no chat is selected
        │   └── pages/
        │       └── Dashboard.jsx      # Main layout assembling sidebar + chat area
        └── memory/
            ├── memory.slice.js        # Redux slice — memories, loading, panel state
            ├── memory.api.js          # Axios calls to /api/memories/*
            ├── useMemory.js           # Hook — get, delete, clear memories
            └── MemoryPanel.jsx        # Memory management UI
```

---

## 4. Socket.IO

### What is Socket.IO?

When you visit a website normally, your browser sends a request and the server responds. This is called HTTP. The problem is: the server cannot send you a message unless you ask first.

Socket.IO creates a persistent connection between your browser and the server. Think of it like a phone call instead of sending letters. Once connected, either side can send messages at any time.

### Why Not Just Use HTTP for Chat?

With HTTP, after you send a message, you would need to keep asking the server "Is the AI response ready yet?" every few seconds. This is called polling, and it is:

1. Slow — there is always a delay
2. Wasteful — most requests return "not yet"
3. Not real-time

With Socket.IO:
1. You send a message
2. The server processes it
3. The server pushes the response back instantly
4. Your UI updates immediately

### Socket Authentication

When a Socket.IO connection is established, the server needs to know who you are. Here is how it works:

1. You log in via the HTTP login endpoint
2. The server sets a JWT cookie in your browser
3. When Socket.IO connects, the browser automatically sends all cookies
4. The Socket.IO server has middleware that reads the cookie, verifies the JWT, and stores your user info on the socket object
5. All subsequent socket events can access `socket.user` to know who sent the message

The key point: the server NEVER trusts a userId sent from the frontend. It always determines the user from the JWT.

### Chat Rooms

Socket.IO supports "rooms" — logical groups of connections. Each chat gets its own room named `chat:<chatId>`. When you open a chat, your socket joins that room. This ensures:

- Messages go only to the right chat
- When you switch chats, you leave the old room and join the new one
- The server verifies you own the chat before letting you join

### Events

Here is a text diagram of the message flow:

```
User types message
       ↓
React (useChat hook)
       ↓
socket.emit("chat:send", { chatId, message })
       ↓
Node.js Socket Server receives event
       ↓
Validates message and chatId
       ↓
Verifies user owns the chat (or creates new chat)
       ↓
Saves user message to MongoDB
       ↓
socket.emit("chat:typing")
       ↓
Retrieves user memories + chat history from MongoDB
       ↓
Calls AI service with memories + history
       ↓
Saves AI response to MongoDB
       ↓
socket.emit("chat:stop-typing")
socket.emit("chat:ai-message", { _id, chatId, content, role })
       ↓
React receives "chat:ai-message" event
       ↓
Redux state updates
       ↓
UI re-renders with new message
       ↓
Auto-scrolls to bottom
```

### Reconnection

If the internet connection drops:
1. Socket.IO automatically tries to reconnect
2. The frontend shows a "Reconnecting..." indicator
3. When reconnected, the user can continue chatting
4. No data is lost because messages are stored in MongoDB

---

## 5. Chat Message Lifecycle

Step-by-step walkthrough of what happens when you send a message:

1. **User types a message** in the ChatComposer textarea
2. **User presses Enter** (or clicks Send)
3. **Frontend validates** the message is not empty
4. **Optimistic update**: The user message is immediately added to the Redux store so it appears in the UI instantly. A temporary ID is assigned.
5. **Socket.IO emit**: `socket.emit("chat:send", { chatId, message })`
6. **Backend receives** the `chat:send` event
7. **Backend authenticates** the user from `socket.user` (set by the JWT middleware)
8. **Backend validates** the chatId:
   - If chatId is null: creates a new chat (generates title via AI), emits `chat:new-chat`
   - If chatId exists: verifies the authenticated user owns this chat
9. **User message is saved** to MongoDB via the Message model
10. **Typing indicator** is emitted: `socket.emit("chat:typing")`
11. **Memory retrieval**: The backend queries the Memory collection for facts about this user that are relevant to the current message
12. **Chat history**: Recent messages from this chat are loaded from MongoDB
13. **AI context is built**: System instructions + user memories + chat history + current message
14. **AI generates response** using LangChain agent with Gemini (may use internet search tool if needed)
15. **AI response is saved** to MongoDB via the Message model
16. **Stop typing + AI message emitted**: `socket.emit("chat:ai-message", { _id, chatId, content, role })`
17. **Frontend receives** the `chat:ai-message` event
18. **Redux updates**: The AI message is added to the correct chat's message array (deduplicated by `_id`)
19. **UI re-renders**: The new message appears with markdown formatting
20. **Auto-scroll**: The message list scrolls to show the newest message
21. **Background memory extraction**: After responding, the backend analyzes the user's message for memorable facts and saves them to the Memory collection (does not block the response)

---

## 6. Personalized Memory

### Why Chat History and Memory Are Different

**Chat history** is conversation-specific. It contains every message in a particular chat window. When you start a new chat, the history is empty.

**Memory** is user-specific reusable information. It contains facts about YOU that are useful across all conversations.

### Why Not Just Send All Previous Chats?

If you have 50 previous chats with hundreds of messages, sending all of them to the AI would:
1. Cost too much (AI APIs charge per token)
2. Be too slow (more tokens = slower responses)
3. Hit token limits (AI models have maximum context sizes)
4. Include irrelevant information (most old messages are not relevant to the current question)

Instead, QueryMind extracts only the important facts and stores them as compact memories.

### Memory Database Structure

Each memory has:
| Field | Description | Example |
|-------|-------------|---------|
| user | Which user this memory belongs to | ObjectId |
| key | Unique identifier for this fact | "name" |
| value | The actual information | "Naitik" |
| category | Classification | "personal" |
| source | Which chat this came from | ChatId |
| confidence | How confident the AI is | 0.8 |

### How Memories Are Extracted

After a user sends a message, the backend:
1. Sends the message to Gemini with a special prompt
2. Gemini analyzes the message and returns a JSON array of facts
3. Only meaningful personal facts are extracted (name, education, goals, preferences)
4. General questions like "What is React?" produce no memories
5. The result is validated and sanitized (no passwords, tokens, or API keys)

### How Duplicate Memories Are Handled

The Memory model has a unique compound index on `{ user, key }`. This means each user can have exactly one memory per key. When you say "My goal is frontend development" and later say "My goal is full-stack development", the old memory is updated — not duplicated.

This is implemented using MongoDB's `findOneAndUpdate` with `{ upsert: true }`.

### How Memories Are Retrieved

When you send a message:
1. MongoDB text search looks for memories matching keywords in your message
2. If text search finds fewer than 5 results, additional recent/high-confidence memories are added
3. Maximum 15 memories are retrieved per message
4. Only YOUR memories are retrieved (filtered by userId)

### How Memory Reaches the AI Prompt

The AI receives a structured context:

```
[SystemMessage]
You are QueryMind, a helpful AI assistant...

You have the following information about this user:
- name: Naitik
- education: B.Tech CSE final year
- career_goal: MERN developer interviews

Use this information naturally when relevant.

[Previous messages from this chat]
...

[Current user message]
...
```

### User Isolation

Memories are strictly isolated per user:
- Every memory has a `user` field (MongoDB ObjectId)
- Every query filters by the authenticated user's ID
- The API endpoints verify ownership before any operation
- There is no way for User A to see or modify User B's memories

---

## 7. Memory vs Chat History

| Aspect | Chat History | Memory |
|--------|-------------|--------|
| Scope | One chat window | All chats for one user |
| Content | Every message exchanged | Only important facts |
| Size | Grows with every message | Stays small (10-50 items typically) |
| Lifetime | Exists as long as the chat exists | Persists until user deletes it |
| Purpose | Continue a conversation | Personalize ALL conversations |
| Example | "What is a closure?" → AI explanation | "name: Naitik" |

---

## 8. AI Context

### How the AI Receives Information

The AI gets four layers of context:

1. **System instructions**: General behavior rules for QueryMind
2. **Relevant memories**: Personal facts about the user (only relevant ones)
3. **Current chat history**: Recent messages from the current conversation (up to 50)
4. **Current user message**: What the user just typed

### Why All Memories Should Not Be Sent Every Time

If a user has 30 memories and asks "What is a for loop?", most memories (name, education, projects) are irrelevant. Sending them all would waste tokens and potentially confuse the AI.

The memory retrieval system uses text search and relevance scoring to select only the most relevant memories for each specific query.

---

## 9. Authentication

The complete authentication flow:

```
Register
  → express-validator checks username/email/password
  → bcrypt hashes the password
  → User document created in MongoDB
  → JWT token generated with the user's email
  → Nodemailer sends verification email with the token link
  → User clicks the link in their email

Verify Email
  → Server receives the token from the URL query parameter
  → JWT is decoded to get the email
  → User document is found and `verified` is set to true

Login
  → User submits email and password
  → Server finds user by email (selects password field)
  → bcrypt compares the submitted password with the stored hash
  → Server checks if email is verified
  → JWT is signed with user ID and username (7-day expiry)
  → JWT is set as an HTTP cookie named "token"
  → Frontend receives user data and stores in Redux

Authenticated Requests
  → Every request includes the cookie automatically
  → auth middleware reads the cookie, verifies the JWT
  → Sets req.user with the decoded token data
  → Controllers use req.user.id to identify the user

Socket.IO Authentication
  → Socket connection sends cookies via handshake headers
  → Socket middleware parses the cookie, verifies the JWT
  → Sets socket.user with the decoded token data
  → All socket events can access socket.user.id

Logout
  → Server clears the "token" cookie
  → Frontend disconnects Socket.IO
  → Redux clears user state
  → User is redirected to login page
```

---

## 10. Nodemailer

### Why Nodemailer?

QueryMind uses email verification to ensure users register with valid email addresses. Nodemailer is a Node.js library that sends emails using various transport methods.

### Where It Fits

Nodemailer is used only during registration:

```
User clicks Register
  → Backend creates user in MongoDB
  → Backend generates a JWT with the user's email
  → Backend calls sendEmail() with a verification link
  → User receives the email
  → User clicks the verification link
  → Backend verifies the token and marks the user as verified
```

### How It Works

The application uses Gmail's OAuth2 authentication:
1. A Google Cloud project provides Client ID and Client Secret
2. A Refresh Token allows the app to send emails without a password
3. Nodemailer creates a transport using these credentials
4. The `sendEmail` function sends HTML emails with the verification link

---

## 11. Frontend UI Architecture

### Layout Structure

```
+------------------------------------------+
| +----------+ +-------------------------+ |
| |          | | Header (title, status)  | |
| | Sidebar  | +-------------------------+ |
| |          | |                         | |
| | Logo     | | Message List            | |
| | New Chat | |   User messages (teal)  | |
| | -------- | |   AI messages (white)   | |
| | Chat 1   | |   Typing indicator      | |
| | Chat 2   | |                         | |
| | Chat 3   | +-------------------------+ |
| |          | | Composer (textarea+send)| |
| | -------- | +-------------------------+ |
| | Memory   |                             |
| | Logout   |                             |
| +----------+                             |
+------------------------------------------+
```

### Component Breakdown

**Dashboard**: The main layout container. Renders Sidebar + main area. Manages sidebar open/close state.

**Sidebar**: Logo, new chat button, chat list with active highlighting and delete buttons, memory settings link, user info, logout.

**MessageList**: Scrollable container for messages. User messages are teal bubbles on the right. AI messages are white cards on the left with markdown rendering. Shows typing indicator when AI is generating.

**ChatComposer**: Auto-resizing textarea with send button. Enter sends, Shift+Enter adds a new line. Disabled when AI is typing or socket is disconnected.

**EmptyState**: Shown when no chat is selected. Displays the QueryMind logo, welcome message, and example prompt cards.

**MemoryPanel**: Accessible from the sidebar. Shows all stored memories grouped by category. Each memory can be deleted individually. "Clear All" button with confirmation.

### State Management

Redux manages three slices:

**auth**: `user`, `loading`, `error`
**chat**: `chats` (map of chatId → chat data with messages), `currentChatId`, `isAiTyping`, `connectionStatus`, `isLoading`, `error`
**memory**: `memories` (array), `loading`, `error`, `panelOpen`

---

## 12. Responsive Design

### Desktop (>= 768px)
- Sidebar is always visible (280px fixed width)
- Chat area fills the remaining space
- Messages have comfortable max-width (768px centered)

### Tablet (< 768px)
- Sidebar is hidden by default
- Hamburger menu button appears in the header
- Sidebar slides in as an overlay with backdrop
- Tapping a chat closes the sidebar automatically

### Mobile (< 640px)
- Same as tablet behavior
- Composer input and send button stack appropriately
- Message bubbles use up to 85% width
- Font sizes are optimized for readability
- No horizontal scrolling

---

## 13. Important Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `chat:send` | Client → Server | User sends a message |
| `chat:join` | Client → Server | User opens a chat (join room) |
| `chat:leave` | Client → Server | User leaves a chat room |
| `chat:new-chat` | Server → Client | New chat was created (includes ID and title) |
| `chat:user-message` | Server → Client | Confirmation that user message was saved |
| `chat:ai-message` | Server → Client | AI response is ready |
| `chat:typing` | Server → Client | AI is generating a response |
| `chat:stop-typing` | Server → Client | AI finished generating |
| `chat:error` | Server → Client | Something went wrong |
| `connect` | Built-in | Socket connection established |
| `disconnect` | Built-in | Socket connection lost |

---

## 14. Important Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique, 3-30 characters |
| email | String | Unique, valid email format |
| password | String | bcrypt hashed, not returned in queries |
| verified | Boolean | Set to true after email verification |

### Chat
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId (ref User) | The owner of this chat |
| title | String | AI-generated title based on first message |

**Index**: `{ user: 1, updatedAt: -1 }` for fast chat listing

### Message
| Field | Type | Description |
|-------|------|-------------|
| chat | ObjectId (ref Chat) | Which chat this message belongs to |
| content | String | The message text |
| role | String | Either "user" or "ai" |

**Index**: `{ chat: 1, createdAt: 1 }` for fast message loading in order

### Memory
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId (ref User) | Which user this memory belongs to |
| key | String | Unique identifier for this fact (lowercase) |
| value | String | The actual information |
| category | String | personal, education, career, preferences, projects, skills, other |
| source | String | ChatId where this memory was extracted from |
| confidence | Number | 0-1, how confident the extraction was |

**Indexes**:
- `{ user: 1, key: 1 }` (unique) — prevents duplicate facts per user
- `{ user: 1, category: 1 }` — fast category-based queries
- `{ key: "text", value: "text" }` — enables MongoDB text search for relevance matching

### Relationships

```
User ──< Chat ──< Message
  │
  └──< Memory
```

One User has many Chats. One Chat has many Messages. One User has many Memories. Memories are independent of Chats (they work across all chats).

---

## 15. Security Considerations

### JWT Verification
- Every HTTP request checks the JWT cookie via middleware
- Every Socket.IO connection checks the JWT via socket middleware
- The JWT secret is stored in an environment variable, never hardcoded

### Chat Ownership
- Before loading messages, the backend checks `chatModel.findOne({ _id: chatId, user: req.user.id })`
- Before joining a socket room, the backend verifies ownership
- A user cannot access another user's chats

### Memory Ownership
- Every memory query filters by `user: req.user.id`
- Delete operations verify ownership with `{ _id: memoryId, user: userId }`
- A user cannot see or delete another user's memories

### Input Validation
- express-validator validates registration and login fields
- Socket events validate message content (non-empty string)
- Memory extraction filters out sensitive patterns (passwords, tokens, API keys)

### Secrets
- All API keys, database credentials, and JWT secrets are in .env (not committed)
- .env.example provides a template with placeholder values
- Cookies are used for auth (automatically scoped to the domain)

---

## 16. How to Run Locally

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project for Nodemailer OAuth2
- Gemini API key
- OpenRouter API key (free tier available)
- Tavily API key (free tier available)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your actual values
# Set MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.

# Start the development server
npm run dev
```

The backend runs on http://localhost:3000 by default.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Create .env file
# Only needed if your backend runs on a different port
cp .env.example .env

# Start the development server
npm run dev
```

The frontend runs on http://localhost:5173 by default.

### Environment Variables

**Backend (.env)**:
| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No (default: 3000) | Server port |
| MONGO_URI | Yes | MongoDB connection string |
| CLIENT_URL | No (default: http://localhost:5173) | Frontend URL for CORS |
| JWT_SECRET | Yes | Secret for signing JWT tokens |
| GEMINI_API_KEY | Yes | Google Gemini API key |
| GEMINI_API_NAME | No | App name for Gemini |
| OPEN_ROUTER_API_KEY | Yes | For chat title generation |
| TAVILY_API_KEY | Yes | For internet search |
| GOOGLE_CLIENT_ID | Yes | Gmail OAuth2 client ID |
| GOOGLE_CLIENT_SECRET | Yes | Gmail OAuth2 client secret |
| GOOGLE_REFRESH_TOKEN | Yes | Gmail OAuth2 refresh token |
| GOOGLE_USER | Yes | Gmail address for sending emails |

**Frontend (.env)**:
| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | No (default: http://localhost:3000) | Backend URL |

---

## 17. How to Test

### Authentication

1. Open http://localhost:5173/register
2. Fill in username, email, and password (min 8 chars)
3. Click "Create account"
4. You should see "Check your email" success message
5. Check your email for the verification link
6. Click the verification link — you should see "Email Verified Successfully"
7. Go to http://localhost:5173/login
8. Enter your email and password
9. You should be redirected to the Dashboard

### Chat

1. Click "New Chat" in the sidebar (or just type in the composer)
2. Type a message and press Enter
3. Your message should appear immediately (teal bubble)
4. A typing indicator should show while AI generates
5. The AI response should appear (white card with markdown)
6. The chat should appear in the sidebar with a generated title
7. Refresh the page — the chat should still be there
8. Click the chat in the sidebar — messages should load

### Socket.IO

1. Open browser DevTools → Network → WS tab
2. You should see a Socket.IO connection
3. Send a message — watch the socket frames
4. Disable your internet → "Reconnecting..." should appear
5. Re-enable internet → connection should restore

### Memory

1. Open Chat A
2. Type: "My name is Naitik. I am a final-year B.Tech CSE student preparing for MERN interviews."
3. Wait for AI response
4. Click "New Chat" to start Chat B
5. Type: "What should I focus on for my interview preparation?"
6. The AI response should reference MERN/full-stack interviews (personalized)
7. Click "Memory & Settings" in the sidebar
8. You should see memories like: name → Naitik, education → B.Tech CSE, career_goal → MERN interviews
9. Delete one memory (e.g., career_goal)
10. Start a new chat and verify the deleted information is no longer used
11. Click "Clear All" → confirm → all memories should be removed

### Responsive Design

1. Open DevTools → toggle device toolbar
2. Test at 320px width — sidebar should be a drawer, no horizontal scroll
3. Test at 375px — composer should be usable
4. Test at 768px — sidebar starts showing
5. Test at 1024px+ — full desktop layout

---

## 18. Common Problems and Fixes

### Socket Connection Refused
**Symptom**: Socket.IO fails to connect, console shows connection error.
**Fix**: Make sure the backend is running on the correct port. Check that CLIENT_URL in .env matches your frontend URL. Check that CORS credentials are enabled.

### CORS Error
**Symptom**: Browser console shows "Access-Control-Allow-Origin" errors.
**Fix**: Set CLIENT_URL in backend .env to your exact frontend URL (e.g., http://localhost:5173). Make sure the URL has no trailing slash.

### Socket Duplicate Connections
**Symptom**: Multiple connections shown in the server logs.
**Fix**: The socket client uses a singleton pattern. If you see duplicates, check that you are not calling `connectSocket()` multiple times. The `useChat` hook prevents this with a ref.

### AI Response Not Appearing
**Symptom**: User message shows but no AI response comes.
**Fix**: Check that GEMINI_API_KEY is set correctly. Check the backend console for error messages. The `chat:error` event should show a user-friendly error in the UI.

### Chat History Not Loading
**Symptom**: Old chats show in sidebar but messages do not load when clicked.
**Fix**: Check the backend console for MongoDB errors. Verify MONGO_URI is correct. Check that the chat's messages exist in the database.

### Memory Not Being Retrieved
**Symptom**: AI does not use personal information across chats.
**Fix**: Check the Memory collection in MongoDB — are memories being saved? Check the backend console for "Memory extraction error" or "Memory retrieval error" logs. The memory extraction happens in the background — it may take a moment after the first message.

### JWT Not Reaching Socket.IO
**Symptom**: Socket connection fails with "Authentication required" error.
**Fix**: Ensure `withCredentials: true` is set in the Socket.IO client options. Ensure the cookie is being set (check Application → Cookies in DevTools). The cookie name must be "token".

### MongoDB Connection Problems
**Symptom**: Backend crashes with MongoDB connection error.
**Fix**: Check that MONGO_URI is correct. If using Atlas, make sure your IP is whitelisted. Make sure the database user has read/write permissions.

### Environment Variable Problems
**Symptom**: Features do not work despite correct code.
**Fix**: Backend reads from `.env` via `dotenv/config`. Make sure there are no spaces around the `=` sign. Make sure the `.env` file is in the `backend/` directory. Frontend variables must start with `VITE_` to be accessible.

---

## 19. Interview Explanation

### "How I Would Explain QueryMind in an Interview"

> "QueryMind is a full-stack AI chat application I built using the MERN stack. It is similar to ChatGPT in functionality but with one key differentiator: persistent personalized memory.
>
> On the backend, I use Node.js with Express for the API layer, MongoDB for data storage, and Socket.IO for real-time communication. When a user sends a message, it travels through a Socket.IO connection instead of a regular HTTP request. This gives instant responses without polling.
>
> The AI is powered by Google Gemini through LangChain, which also gives the AI access to an internet search tool via Tavily. For authentication, I use JWT stored in HTTP cookies, with Nodemailer handling email verification during registration.
>
> What makes QueryMind unique is the memory system. When a user shares personal information like their name or career goals, the AI extracts those facts and stores them in a separate Memory collection in MongoDB. When the user starts a completely new chat, QueryMind retrieves relevant memories and includes them in the AI context. This means the AI can provide personalized responses across different conversations without sending entire chat histories.
>
> The frontend is built with React and Redux Toolkit, with a responsive design that works on desktop and mobile. I use Tailwind CSS v4 for styling."

### Likely Cross-Questions

**Q: Why Socket.IO instead of just REST API?**
A: REST requires the client to poll for AI responses. Socket.IO provides a persistent bidirectional connection, so the server can push the AI response immediately when it is ready. It also enables features like typing indicators.

**Q: How does Socket.IO authentication work?**
A: Socket.IO sends cookies with the initial handshake. A server-side middleware intercepts the connection, parses the JWT from the cookie, verifies it, and stores the decoded user on the socket object. Unauthenticated connections are rejected.

**Q: How are chats isolated?**
A: Each chat is a Socket.IO "room". When a user opens a chat, their socket joins that room. The server verifies chat ownership before allowing the join. Messages are emitted to specific rooms, ensuring isolation.

**Q: How is memory different from chat history?**
A: Chat history is conversation-specific — every message in one chat window. Memory is user-specific — compact facts (name, goals, preferences) that persist across ALL conversations. Memory is stored in a separate MongoDB collection.

**Q: How does QueryMind remember information across chats?**
A: After receiving a user message, the backend uses Gemini to extract meaningful personal facts and saves them as memories. Before generating an AI response, it retrieves relevant memories and includes them in the AI prompt context.

**Q: Where is memory stored?**
A: In a MongoDB collection called "memories" with fields: user, key, value, category, source, confidence. It has a unique compound index on (user, key) to prevent duplicates.

**Q: How do you avoid duplicate memories?**
A: The unique compound index on { user, key } ensures one memory per key per user. When a new value is extracted for an existing key, MongoDB's findOneAndUpdate with upsert replaces the old value instead of creating a duplicate.

**Q: How do you prevent users from accessing another user's memory?**
A: Every database query includes the authenticated user's ID as a filter. The userId comes from the verified JWT, not from the frontend. There is no endpoint that accepts a userId parameter.

**Q: Why MongoDB?**
A: MongoDB's flexible schema is ideal for chat messages and memory facts. Its text search indexes enable relevance-based memory retrieval. Mongoose provides schema validation and convenient query methods.

**Q: What happens if Socket.IO disconnects?**
A: Socket.IO automatically attempts to reconnect. The frontend shows a "Reconnecting..." indicator. No data is lost because messages are persisted in MongoDB. When the connection is restored, the user can continue chatting.

**Q: What happens if AI generation fails?**
A: The backend catches the error, stops the typing indicator, and emits a `chat:error` event with a user-friendly message. The frontend displays the error and re-enables the input. The user's message is still saved in the database.
