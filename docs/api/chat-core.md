# Chat core API contract

The initial contract is intentionally small and transport-focused. IDs are opaque strings, timestamps are ISO 8601 strings, and the server owns message IDs and timestamps.

## Resources

### Conversation

```json
{
  "id": "conversation-id",
  "title": "Product team",
  "participantIds": ["you", "alex"],
  "messageCount": 1,
  "lastMessage": {
    "id": "message-id",
    "conversationId": "conversation-id",
    "senderId": "you",
    "body": "Hello",
    "createdAt": "2026-07-15T00:00:00.000Z"
  },
  "createdAt": "2026-07-15T00:00:00.000Z",
  "updatedAt": "2026-07-15T00:00:00.000Z"
}
```

### Message

```json
{
  "id": "message-id",
  "conversationId": "conversation-id",
  "senderId": "you",
  "body": "Hello",
  "createdAt": "2026-07-15T00:00:00.000Z"
}
```

## Event stream

`GET /api/events?conversationId=:id` returns `text/event-stream`. Each event has an event name and a JSON data envelope:

```text
event: message.created
data: {"type":"message.created","conversationId":"conversation-id","message":{...}}
```

The current implementation emits `conversation.created` as well. Authentication, authorization, persistence, pagination, and retry semantics are deliberately deferred to the next milestone.
