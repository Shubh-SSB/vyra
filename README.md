# VYRA chat core

The first runnable milestone of VYRA is a small, dependency-free chat core:

- Node.js HTTP API with an in-memory conversation store
- REST endpoints for conversations and messages
- Server-Sent Events for live `message.created` updates
- A responsive browser client in `web/`

## Run it

Requires Node.js 20 or newer.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000), create a conversation, and send a message. Data currently lives in memory and resets when the server restarts.

For automatic server restarts while developing:

```bash
npm run dev
```

Run the core tests with:

```bash
npm test
```

## API

`GET /api/health` — health check

`GET /api/conversations` — list conversations

`POST /api/conversations` — create a conversation

```json
{
  "title": "Product team",
  "participantIds": ["you", "alex"]
}
```

`GET /api/conversations/:id` — get a conversation with messages

`GET /api/conversations/:id/messages` — list messages

`POST /api/conversations/:id/messages` — add a message

```json
{
  "senderId": "you",
  "body": "Hello"
}
```

`GET /api/events?conversationId=:id` — subscribe to conversation events over SSE. Omit `conversationId` to receive events for every conversation.

## Next core milestones

1. Replace the in-memory store with a database-backed repository.
2. Add authentication and authorization around participant membership.
3. Add delivery/read state, pagination, and durable event processing.
"# vyra" 
