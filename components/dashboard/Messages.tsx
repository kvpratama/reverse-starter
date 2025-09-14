"use client";

import React, { useState, useRef, useEffect } from 'react';
import EarlyScreeningMessage from "./EarlyScreeningMessage";

// --- TYPESCRIPT INTERFACES ---
export interface Message {
  id: string;
  sender: 'me' | string; // 'me' or the name of the other person
  content: string;
  type?: string;
  jobPostId?: string;
  timestamp: string; // ISO string
}

interface Conversation {
  id: string;
  name: string;
  title: string;
  avatar: string;
  lastMessage: string;
  timestamp: string; // ISO string
  isRead: boolean;
}

// Data will be loaded from API

// --- ICONS (using SVG for self-containment) ---
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);


// --- MAIN COMPONENT ---
export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      const list: Conversation[] = data.conversations ?? [];
      setConversations(list);
      if (list.length > 0) {
        setSelectedConversationId(list[0].id);
        await fetchMessages(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectConversation = async (id: string) => {
    setSelectedConversationId(id);
    await fetchMessages(id);
  };
  
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    try {
      const res = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, type: 'text' }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setNewMessage('');
      await fetchMessages(selectedConversationId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Left Panel: Conversation List */}
      <div className="w-full max-w-xs border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => handleSelectConversation(convo.id)}
              className={`w-full text-left p-4 flex items-start gap-4 transition-colors duration-150 ${
                selectedConversationId === convo.id ? 'bg-orange-100' : 'hover:bg-orange-50'
              } ${convo.isRead ? 'text-black' : 'text-gray-300'}`}
            >
              <div className="relative shrink-0">
                  <img src={convo.avatar} alt={convo.name} className="h-12 w-12 rounded-full object-cover" />
                  {/* {convo.isRead && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>} */}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{convo.name}</p>
                <p className={`text-sm truncate ${convo.isRead ? 'text-black' : 'text-gray-300'}`} >{convo.lastMessage}</p>
              </div>
              <p className={`text-xs self-start ${convo.isRead ? 'text-black' : 'text-gray-300'}`}>{new Date(convo.timestamp).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-4">
              <div className="relative shrink-0">
                  <img src={selectedConversation.avatar} alt={selectedConversation.name} className="h-12 w-12 rounded-full object-cover" />
                  {/* {selectedConversation.online && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>} */}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedConversation.name}</h3>
                <p className="text-sm text-gray-500">{selectedConversation.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                    {msg.sender !== 'me' && (
                       <img src={selectedConversation.avatar} alt={selectedConversation.name} className="h-8 w-8 rounded-full object-cover" />
                    )}
                    {msg.type === 'early_screening' && msg.sender !== 'me' ? (
                      <div className="max-w-md p-3 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none">
                        <EarlyScreeningMessage msg={msg} />
                        <p className="text-xs mt-2 text-gray-500">{msg.timestamp}</p>
                      </div>
                    ) : (
                      <div className={`max-w-md p-3 rounded-xl ${
                        msg.sender === 'me' 
                        ? 'bg-orange-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          msg.sender === 'me' ? 'text-orange-50' : 'text-gray-500'
                        }`}>{new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button type="submit" className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-colors duration-150" aria-label="Send message">
                    <SendIcon className="h-5 w-5"/>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
