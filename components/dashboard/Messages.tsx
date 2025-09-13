"use client";

import React, { useState, useRef, useEffect } from 'react';
import EarlyScreeningMessage from "./EarlyScreeningMessage";

// --- TYPESCRIPT INTERFACES ---
export interface Message {
  id: number;
  sender: 'me' | string; // 'me' or the name of the other person
  text: string;
  type?: string;
  jobPostId?: number;
  timestamp: string;
}

interface Conversation {
  id: number;
  name: string;
  title: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
}

// --- MOCK DATA ---
// In a real app, this would come from your API
const conversationsData: Conversation[] = [
  {
    id: 1,
    name: 'Sarah Lee',
    title: 'Recruiter at Tech Solutions',
    avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=SL',
    lastMessage: 'Great, I\'ve received your resume. I will review it and get back to you shortly.',
    timestamp: '10:40 AM',
    isRead: true,
  },
  {
    id: 2,
    name: 'John Doe',
    title: 'Hiring Manager at Innovate Inc.',
    avatar: 'https://placehold.co/100x100/CBD5E0/4A5568?text=JD',
    lastMessage: 'Can you tell me more about your experience with React?',
    timestamp: '9:15 AM',
    isRead: false,
  },
  {
    id: 3,
    name: 'Maria Garcia',
    title: 'HR Coordinator at FutureSoft',
    avatar: 'https://placehold.co/100x100/B2F5EA/4A5568?text=MG',
    lastMessage: 'We\'d like to schedule an interview for next Tuesday.',
    timestamp: 'Yesterday',
    isRead: true,
  },
  {
    id: 4,
    name: 'David Chen',
    title: 'Lead Engineer at Data Dynamics',
    avatar: 'https://placehold.co/100x100/FEEBC8/4A5568?text=DC',
    lastMessage: 'The technical assessment looked good. Let\'s chat.',
    timestamp: '2 days ago',
    isRead: false,
  },
  {
    id: 5,
    name: 'Emily Wang',
    title: 'Lead Designer at Creative Co.',
    avatar: 'https://placehold.co/100x100/FEEBC8/4A5568?text=EW',
    lastMessage: 'You are invited to enter an early screening.',
    timestamp: '3 days ago',
    isRead: false,
  },
];

const messagesData: { [key: number]: Message[] } = {
  1: [
    { id: 1, sender: 'Sarah Lee', text: 'Hi there! Thanks for your interest in the Senior Frontend Developer role at Tech Solutions.', timestamp: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Hello Sarah, thank you for reaching out. I\'m very interested in the opportunity.', timestamp: '10:32 AM' },
    { id: 3, sender: 'Sarah Lee', text: 'Excellent. Could you please send over your latest resume?', timestamp: '10:33 AM' },
    { id: 4, sender: 'me', text: 'Of course, I have just attached it to my application profile.', timestamp: '10:35 AM' },
    { id: 5, sender: 'Sarah Lee', text: 'Great, I\'ve received your resume. I will review it and get back to you shortly.', timestamp: '10:40 AM' },
    { id: 6, sender: 'Sarah Lee', text: 'Hi there! Thanks for your interest in the Senior Frontend Developer role at Tech Solutions.', timestamp: '10:30 AM' },
    { id: 7, sender: 'me', text: 'Hello Sarah, thank you for reaching out. I\'m very interested in the opportunity.', timestamp: '10:32 AM' },
    { id: 8, sender: 'Sarah Lee', text: 'Excellent. Could you please send over your latest resume?', timestamp: '10:33 AM' },
    { id: 9, sender: 'me', text: 'Of course, I have just attached it to my application profile.', timestamp: '10:35 AM' },
    { id: 10, sender: 'Sarah Lee', text: 'Great, I\'ve received your resume. I will review it and get back to you shortly.', timestamp: '10:40 AM' },
  ],
  2: [
    { id: 1, sender: 'John Doe', text: 'Thanks for applying. Your profile is impressive.', timestamp: '9:12 AM' },
    { id: 2, sender: 'me', text: 'Thank you, John. I appreciate that.', timestamp: '9:14 AM' },
    { id: 3, sender: 'John Doe', text: 'Can you tell me more about your experience with React?', timestamp: '9:15 AM' },
  ],
  3: [
    { id: 1, sender: 'Maria Garcia', text: 'Hi, we were impressed with your application and would like to move forward.', timestamp: 'Yesterday' },
    { id: 2, sender: 'Maria Garcia', text: 'We\'d like to schedule an interview for next Tuesday.', timestamp: 'Yesterday' },
  ],
  4: [
    { id: 1, sender: 'David Chen', text: 'The technical assessment looked good. Let\'s chat.', timestamp: '2 days ago' },
  ],
  5: [
    { id: 1, sender: 'Emily Wang', text: 'You are invited to enter an early screening process.', type: 'early_screening', jobPostId: 1, timestamp: '3 days ago' },
  ],
};

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
  const [selectedConversationId, setSelectedConversationId] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>(messagesData[1]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = conversationsData.find(c => c.id === selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setMessages(messagesData[id] || []);
  };
  
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
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
          {conversationsData.map((convo) => (
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
              <p className={`text-xs self-start ${convo.isRead ? 'text-black' : 'text-gray-300'}`}>{convo.timestamp}</p>
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
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          msg.sender === 'me' ? 'text-orange-50' : 'text-gray-500'
                        }`}>{msg.timestamp}</p>
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
