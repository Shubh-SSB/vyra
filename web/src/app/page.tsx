'use client'

import { useEffect, useState } from "react";
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

interface Message {
  id: string;
  content: string;
  username: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [username] = useState(() => `User_${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {

    socket.on('recieveMessage', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });
    
    return () => {
      socket.off('recieveMessage');
    }
  },[])

  const send = () => {
    if (!text.trim()) return;

    socket.emit('sendMessage', { content: text, username });
    setText('')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Simple Real-Time Chat</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>You are: <strong>{username}</strong></p>
      
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', padding: '10px', borderRadius: '4px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#0070f3' }}>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Type a message..."
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={send} style={{ padding: '8px 15px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  );
}