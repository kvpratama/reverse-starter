"use client";

import { useRef, useState } from "react";
import EarlyScreeningMessage from "@/components/dashboard/EarlyScreeningMessage";
import InterviewInvitationMessage from "@/components/dashboard/InterviewInvitationMessage";
import type { Message, Conversation } from "@/app/types/types";

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

const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export default function ClientMessages({
  initialConversations,
  initialSelectedConversationId,
  initialMessages,
}: {
  initialConversations: Conversation[];
  initialSelectedConversationId: string | null;
  initialMessages: Message[];
}) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    initialSelectedConversationId ?? "",
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoadingConversation, setIsLoadingConversation] =
    useState<boolean>(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  const fetchMessages = async (
    conversationId: string,
    options?: { withLoading?: boolean },
  ) => {
    const { withLoading = false } = options ?? {};

    if (withLoading) {
      setIsLoadingConversation(true);
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      if (withLoading) {
        setIsLoadingConversation(false);
      }
    }
  };

  const handleSelectConversation = async (id: string) => {
    if (id === selectedConversationId) return;

    setSelectedConversationId(id);
    setMessages([]);

    // On mobile, show chat view when conversation is selected
    setShowChatOnMobile(true);

    await fetchMessages(id, { withLoading: true });

    // Mark conversation as read
    try {
      await fetch(`/api/conversations/${id}/read`, {
        method: "POST",
      });
      setConversations((prev) =>
        prev.map((convo) =>
          convo.id === id ? { ...convo, isRead: true } : convo,
        ),
      );
    } catch (e) {
      console.error("Failed to mark conversation as read", e);
    }
  };

  const handleBackToConversations = () => {
    setShowChatOnMobile(false);
    setSelectedConversationId("");
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    if (!selectedConversationId) return;
    try {
      const res = await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage, type: "text" }),
        },
      );
      if (!res.ok) throw new Error("Failed to send message");
      setNewMessage("");
      await fetchMessages(selectedConversationId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* Desktop Layout: Side-by-side */}
      <div className="hidden md:flex md:flex-row h-full w-full">
        {/* Left Panel: Conversation List */}
        <div className="flex w-full flex-col border-b border-gray-200 md:h-full md:max-w-xs md:border-b-0 md:border-r">
          <div className="shrink-0 border-b border-gray-200 p-4">
            <h2 className="text-xl font-bold tracking-tight">Messages</h2>
            <div className="relative mt-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 sm:text-base"
              />
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto"
            data-testid="conversation-list"
          >
            {conversations.length === 0 ? (
              <p className="text-gray-600 text-sm mt-6 p-4">
                Your inbox is where employers connect with you. Want to stand
                out? Create your profile now and open the door to new
                opportunities
              </p>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => handleSelectConversation(convo.id)}
                  className={`flex w-full items-start gap-4 rounded-none p-4 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 md:rounded-md ${
                    selectedConversationId === convo.id
                      ? "bg-orange-100"
                      : "hover:bg-orange-50"
                  } ${convo.isRead ? "text-gray-400" : "text-black"}`}
                  aria-pressed={selectedConversationId === convo.id}
                >
                  <div
                    className={`flex min-h-14 w-full items-start gap-4 ${
                      convo.isRead ? "text-gray-400" : "text-inherit"
                    }`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold sm:text-base">
                        {convo.name}
                      </p>
                      <p
                        className={`truncate text-xs sm:text-sm ${
                          convo.isRead ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {convo.lastMessage}
                      </p>
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${
                        convo.isRead ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(convo.timestamp).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="flex flex-1 flex-col md:h-full">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 flex items-center gap-4 border-b border-gray-200 p-4 sm:p-6">
                <div className="relative shrink-0">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold sm:text-xl">
                    {selectedConversation.name}
                  </h3>
                  <p className="text-sm text-gray-500 sm:text-base">
                    Job Title: {selectedConversation.title}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="relative flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6"
                aria-busy={isLoadingConversation}
              >
                {isLoadingConversation && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex flex-col items-center gap-3"
                    >
                      <span className="sr-only">Loading conversation</span>
                      <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                      <p className="text-sm font-medium text-gray-700">
                        Loading conversation…
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3 ${
                        msg.sender === "me" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {msg.sender !== "me" && (
                        <img
                          src={selectedConversation.avatar}
                          alt={selectedConversation.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      {msg.sender !== "me" &&
                      (msg.type === "early_screening" ||
                        msg.type === "interview_invitation") ? (
                        <div className="max-w-md p-3 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none">
                          {msg.type === "early_screening" && (
                            <EarlyScreeningMessage
                              msg={msg}
                              profileId={selectedConversation.profileId}
                              onParticipated={async () => {
                                if (selectedConversationId) {
                                  await fetchMessages(selectedConversationId);
                                }
                              }}
                            />
                          )}
                          {msg.type === "interview_invitation" && (
                            <InterviewInvitationMessage msg={msg} />
                          )}
                          <p className="text-xs mt-2 text-gray-500">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`max-w-md p-3 rounded-xl ${
                            msg.sender === "me"
                              ? "bg-orange-500 text-white rounded-br-none"
                              : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 opacity-70 ${
                              msg.sender === "me"
                                ? "text-orange-50"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-gray-50/50 p-6 text-center text-sm text-gray-500 sm:text-base">
              {conversations.length === 0 ? (
                <p className="text-sm">
                  Start building your profile now and open the door to new
                  opportunities
                </p>
              ) : (
                <p>Select a conversation</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout: Conditional rendering */}
      <div className="flex flex-col h-full w-full md:hidden">
        {/* Conversation List View (Mobile) */}
        {!showChatOnMobile && (
          <div className="flex flex-col h-full">
            <div className="shrink-0 border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold tracking-tight">Messages</h2>
              <div className="relative mt-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 sm:text-base"
                />
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto"
              data-testid="conversation-list"
            >
              {conversations.length === 0 ? (
                <p className="text-gray-600 text-sm mt-6 p-4">
                  Your inbox is where employers connect with you. Want to stand
                  out? Create your profile now and open the door to new
                  opportunities
                </p>
              ) : (
                conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConversation(convo.id)}
                    className={`flex w-full items-start gap-4 rounded-none p-4 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                      selectedConversationId === convo.id
                        ? "bg-orange-100"
                        : "hover:bg-orange-50"
                    } ${convo.isRead ? "text-gray-400" : "text-black"}`}
                    aria-pressed={selectedConversationId === convo.id}
                  >
                    <div
                      className={`flex min-h-14 w-full items-start gap-4 ${
                        convo.isRead ? "text-gray-400" : "text-inherit"
                      }`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold">
                          {convo.name}
                        </p>
                        <p
                          className={`truncate text-xs ${
                            convo.isRead ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {convo.lastMessage}
                        </p>
                      </div>
                      <p
                        className={`text-xs ${
                          convo.isRead ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(convo.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat View (Mobile) */}
        {showChatOnMobile && selectedConversation && (
          <div className="flex flex-col h-full">
            {/* Mobile Chat Header with Back Button */}
            <div className="shrink-0 flex items-center gap-4 border-b border-gray-200 p-4">
              <button
                onClick={handleBackToConversations}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Back to conversations"
              >
                <BackIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className="relative shrink-0">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">
                  {selectedConversation.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  Job Title: {selectedConversation.title}
                </p>
              </div>
            </div>

            {/* Mobile Messages */}
            <div
              className="relative flex-1 overflow-y-auto bg-gray-50/50 p-4"
              aria-busy={isLoadingConversation}
            >
              {isLoadingConversation && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col items-center gap-3"
                  >
                    <span className="sr-only">Loading conversation</span>
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                    <p className="text-sm font-medium text-gray-700">
                      Loading conversation…
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-3 ${
                      msg.sender === "me" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {msg.sender !== "me" && (
                      <img
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    {msg.sender !== "me" &&
                    (msg.type === "early_screening" ||
                      msg.type === "interview_invitation") ? (
                      <div className="max-w-sm p-3 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none">
                        {msg.type === "early_screening" && (
                          <EarlyScreeningMessage
                            msg={msg}
                            profileId={selectedConversation.profileId}
                            onParticipated={async () => {
                              if (selectedConversationId) {
                                await fetchMessages(selectedConversationId);
                              }
                            }}
                          />
                        )}
                        {msg.type === "interview_invitation" && (
                          <InterviewInvitationMessage msg={msg} />
                        )}
                        <p className="text-xs mt-2 text-gray-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`max-w-sm p-3 rounded-xl ${
                          msg.sender === "me"
                            ? "bg-orange-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 opacity-70 ${
                            msg.sender === "me"
                              ? "text-orange-50"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
