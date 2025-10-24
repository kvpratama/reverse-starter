"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import EarlyScreeningMessage from "@/components/dashboard/EarlyScreeningMessage";
import InterviewInvitationMessage from "@/components/dashboard/InterviewInvitationMessage";
import type { Message, Conversation } from "@/app/types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- ICONS ---
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

// --- UTILITY FUNCTIONS ---
function safeJSONContent(message: string): string {
  try {
    const parsed = JSON.parse(message);
    return parsed.content ?? message;
  } catch {
    return message;
  }
}

// --- SKELETON COMPONENTS ---
const ConversationListSkeleton = () => (
  <div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="relative overflow-hidden p-4 flex items-start gap-4"
      >
        <div className="relative shrink-0 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
        </div>
        <div className="flex-1 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
          <div className="h-5 w-3/4 rounded bg-gray-200 mb-2" />
          <div className="h-4 w-full rounded bg-gray-200" />
        </div>
        <div className="text-xs self-start relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

const ChatHeaderSkeleton = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div
    className={`relative overflow-hidden ${isMobile ? "p-4" : "p-4 sm:p-6"} border-b border-gray-200 flex items-center gap-4`}
  >
    <div className="relative shrink-0 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
      <div
        className={`${isMobile ? "h-10 w-10" : "h-12 w-12"} rounded-full bg-gray-200`}
      />
    </div>
    <div className="flex-1 relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
      <div
        className={`h-6 ${isMobile ? "w-36" : "w-40"} rounded bg-gray-200 mb-2`}
      />
      <div
        className={`h-4 ${isMobile ? "w-40" : "w-48"} rounded bg-gray-200`}
      />
    </div>
  </div>
);

const MessagesAreaSkeleton = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div
    className={`flex-1 ${isMobile ? "p-4" : "p-6"} overflow-y-auto bg-gray-50/50`}
  >
    <div className={isMobile ? "space-y-4" : "space-y-6"}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="relative shrink-0 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          </div>
          <div
            className={`relative overflow-hidden ${isMobile ? "max-w-sm" : "max-w-md"} p-3 rounded-xl bg-gray-200 rounded-bl-none before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent`}
          >
            <div className="space-y-2">
              <div
                className={`h-4 ${isMobile ? "w-40" : "w-48"} rounded bg-gray-300`}
              />
              <div
                className={`h-3 ${isMobile ? "w-28" : "w-32"} rounded bg-gray-300`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FullPageLoadingSkeleton = ({
  isMobile = false,
}: {
  isMobile?: boolean;
}) => (
  <div className="absolute inset-0 z-10 flex flex-col bg-white/80 backdrop-blur-sm">
    <ChatHeaderSkeleton isMobile={isMobile} />
    <MessagesAreaSkeleton isMobile={isMobile} />
  </div>
);

const LoadingOverlay = () => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3"
    >
      <span className="sr-only">Loading conversation</span>
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      <p className="text-sm font-medium text-gray-700">Loading conversation…</p>
    </div>
  </div>
);

const AvatarInitials = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  // Determine the size classes
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 sm:w-10 sm:h-10 text-md",
    lg: "w-10 h-10 text-lg",
  };

  // Get initials
  const getInitials = (fullName: string): string => {
    if (!fullName) return "";
    const words = fullName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center ${sizeClasses[size]}`}
    >
      <span className="text-orange-600 font-medium">
        {getInitials(name)}
      </span>
    </div>
  );
};

const formatRelativeTime = (timestamp: number | string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";
  // Fallback to a simple date format
  return date.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  });
};

// --- MAIN COMPONENTS ---
export const ConversationListItem = ({
  convo,
  isSelected,
  onSelect,
}: {
  convo: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  let badgeColor = "bg-gray-100 text-gray-600";
  let badgeColorRead = "bg-gray-100 text-gray-600";
  if (convo.lastMessageType === "early_screening") {
    badgeColor = "bg-green-100 text-green-600";
    badgeColorRead = "bg-green-50 text-green-300";
  } else if (convo.lastMessageType === "thank_you") {
    badgeColor = "bg-purple-100 text-purple-500";
    badgeColorRead = "bg-purple-50 text-purple-300";
  } else if (convo.lastMessageType === "interview_invitation") {
    badgeColor = "bg-blue-100 text-blue-600";
    badgeColorRead = "bg-blue-50 text-blue-300";
  }

  return (
    <button
      onClick={() => onSelect(convo.id)}
      className={`group relative flex w-full items-start gap-3 rounded-lg p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 ${
        isSelected
          ? "bg-orange-50 shadow-sm"
          : "hover:bg-orange-50 hover:shadow-sm"
      }`}
      aria-pressed={isSelected}
    >
      {/* 1. Visual Anchor (Avatar/Initials) */}
      <AvatarInitials name={convo.name} size="md" />

      {/* 2. Main Content (Name & Message) */}
      <div className="flex-1 overflow-hidden">
        <p
          className={`truncate text-sm font-semibold sm:text-base ${
            convo.isRead ? "text-gray-300" : "text-gray-900"
          }`}
        >
          {convo.name}
        </p>
        <p
          className={`truncate text-xs sm:text-sm ${
            convo.isRead ? "text-gray-500" : "text-gray-800 font-medium" // Unread message is darker and bolder
          }`}
        >
          {convo.lastMessageType && (
            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-sm ${convo.isRead ? badgeColorRead : badgeColor}`}
            >
              {convo.lastMessageType === "early_screening"
                ? "Early Screening"
                : convo.lastMessageType === "thank_you"
                  ? "Thank you for your application"
                  : convo.lastMessageType === "interview_invitation"
                    ? "Interview Invitation"
                    : ""}
            </span>
          )}
        </p>
      </div>

      {/* 3. Metadata (Timestamp & Unread Dot) */}
      <div className="flex flex-col items-end flex-shrink-0 w-16">
        <p
          className={`text-xs whitespace-nowrap ${convo.isRead ? "text-gray-300" : "text-gray-500"}`}
        >
          {formatRelativeTime(convo.timestamp)}
        </p>
        {!convo.isRead && (
          <div
            className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-1.5"
            aria-label="Unread message"
          />
        )}
      </div>
    </button>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onNavigate,
  isPending,
  isMobile = false,
}: {
  currentPage: number;
  totalPages: number;
  onNavigate: (page: number) => void;
  isPending: boolean;
  isMobile?: boolean;
}) => (
  <div className="shrink-0 border-t border-gray-200 p-3 flex items-center justify-center gap-2">
    <button
      onClick={() => onNavigate(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1 || isPending}
      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
    >
      <ChevronLeft className="h-4 w-4" />
      Prev
    </button>
    {!isMobile && (
      <div className="hidden sm:flex items-center gap-1">
        <span className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
          {currentPage} of {totalPages}
        </span>
      </div>
    )}
    <div
      className={
        isMobile
          ? "px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md"
          : "sm:hidden px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md"
      }
    >
      {currentPage} of {totalPages}
    </div>
    <button
      onClick={() => onNavigate(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages || isPending}
      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
    >
      Next
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
);

const ChatHeader = ({
  conversation,
  onBack,
  isMobile = false,
}: {
  conversation: Conversation;
  onBack?: () => void;
  isMobile?: boolean;
}) => (
  <div
    className={`shrink-0 flex items-center gap-4 border-b border-gray-200 ${isMobile ? "p-4" : "p-4 sm:p-6"}`}
  >
    {isMobile && onBack && (
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Back to conversations"
      >
        <BackIcon className="h-5 w-5 text-gray-600" />
      </button>
    )}
    <div className="relative shrink-0">
      <AvatarInitials name={conversation.name} size="md" />
    </div>
    <div className={isMobile ? "flex-1 min-w-0" : ""}>
      <h3
        className={`${isMobile ? "text-lg truncate" : "text-lg sm:text-xl"} font-bold`}
      >
        {conversation.name}
      </h3>
      <p
        className={`text-sm ${isMobile ? "truncate" : "sm:text-base"} text-gray-500`}
      >
        Job Title: {conversation.title}
      </p>
    </div>
  </div>
);

const MessagesList = ({
  messages,
  conversation,
  selectedConversationId,
  onMessagesRefresh,
  isMobile = false,
}: {
  messages: Message[];
  conversation: Conversation;
  selectedConversationId: string;
  onMessagesRefresh: (conversationId: string) => Promise<void>;
  isMobile?: boolean;
}) => (
  <div className={isMobile ? "space-y-4" : "space-y-6"}>
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`flex items-end gap-3 ${msg.sender === "me" ? "flex-row-reverse" : ""}`}
      >
        {msg.sender !== "me" && (
          <AvatarInitials name={conversation.name} size="sm" />
        )}
        {msg.sender !== "me" &&
        (msg.type === "early_screening" ||
          msg.type === "interview_invitation") ? (
          <div
            className={`${isMobile ? "max-w-sm" : "max-w-md"} p-3 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none`}
          >
            {msg.type === "early_screening" && (
              <EarlyScreeningMessage
                msg={msg}
                profileId={conversation.profileId}
                onParticipated={async () => {
                  if (selectedConversationId) {
                    await onMessagesRefresh(selectedConversationId);
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
            className={`${isMobile ? "max-w-sm" : "max-w-md"} p-3 rounded-xl ${
              msg.sender === "me"
                ? "bg-orange-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            <p
              className={`text-xs mt-1 opacity-70 ${
                msg.sender === "me" ? "text-orange-50" : "text-gray-500"
              }`}
            >
              {new Date(msg.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
);

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isPending,
  currentPage,
  totalPages,
  onNavigate,
  isMobile = false,
}: {
  conversations: Conversation[];
  selectedConversationId: string;
  onSelectConversation: (id: string) => void;
  isPending: boolean;
  currentPage: number;
  totalPages: number;
  onNavigate: (page: number) => void;
  isMobile?: boolean;
}) => (
  <div className="flex flex-col h-full">
    <div className="shrink-0 border-b border-gray-200 p-4">
      <h2 className="text-xl font-bold tracking-tight">Messages</h2>
    </div>
    <div className="flex-1 overflow-y-auto" data-testid="conversation-list">
      {isPending ? (
        <ConversationListSkeleton />
      ) : conversations.length === 0 ? (
        <p className="text-gray-600 text-sm mt-6 p-4">
          Your inbox is where employers connect with you. Want to stand out?
          Create your profile now and open the door to new opportunities
        </p>
      ) : (
        conversations.map((convo) => (
          <ConversationListItem
            key={convo.id}
            convo={convo}
            isSelected={selectedConversationId === convo.id}
            onSelect={onSelectConversation}
          />
        ))
      )}
    </div>
    <PaginationControls
      currentPage={currentPage}
      totalPages={totalPages}
      onNavigate={onNavigate}
      isPending={isPending}
      isMobile={isMobile}
    />
  </div>
);

const ChatWindow = ({
  conversation,
  messages,
  selectedConversationId,
  isLoadingConversation,
  isPending,
  onMessagesRefresh,
  onBack,
  isMobile = false,
  conversations,
}: {
  conversation: Conversation | undefined;
  messages: Message[];
  selectedConversationId: string;
  isLoadingConversation: boolean;
  isPending: boolean;
  onMessagesRefresh: (conversationId: string) => Promise<void>;
  onBack?: () => void;
  isMobile?: boolean;
  conversations: Conversation[];
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-1 flex-col md:h-full relative">
      {isPending && <FullPageLoadingSkeleton isMobile={isMobile} />}
      {conversation ? (
        <>
          <ChatHeader
            conversation={conversation}
            onBack={onBack}
            isMobile={isMobile}
          />
          <div
            className={`relative flex-1 overflow-y-auto bg-gray-50/50 ${isMobile ? "p-4" : "p-4 sm:p-6"}`}
            aria-busy={isLoadingConversation}
          >
            {isLoadingConversation && <LoadingOverlay />}
            <MessagesList
              messages={messages}
              conversation={conversation}
              selectedConversationId={selectedConversationId}
              onMessagesRefresh={onMessagesRefresh}
              isMobile={isMobile}
            />
            <div ref={messagesEndRef} />
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
  );
};

// --- MAIN COMPONENT ---
export default function ClientMessages({
  initialConversations,
  initialSelectedConversationId,
  initialMessages,
  currentPage,
  totalPages,
}: {
  initialConversations: Conversation[];
  initialSelectedConversationId: string | null;
  initialMessages: Message[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    initialSelectedConversationId ?? ""
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoadingConversation, setIsLoadingConversation] =
    useState<boolean>(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const navigateToPage = (page: number) => {
    const p = new URLSearchParams(params.toString());
    p.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${p.toString()}` as Route);
    });
  };

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const fetchMessages = async (
    conversationId: string,
    options?: { withLoading?: boolean }
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
    setShowChatOnMobile(true);

    await fetchMessages(id, { withLoading: true });

    try {
      await fetch(`/api/conversations/${id}/read`, {
        method: "POST",
      });
      setConversations((prev) =>
        prev.map((convo) =>
          convo.id === id ? { ...convo, isRead: true } : convo
        )
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

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-row h-full w-full">
        <div className="flex w-full flex-col border-b border-gray-200 md:h-full md:max-w-xs md:border-b-0 md:border-r">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            isPending={isPending}
            currentPage={currentPage}
            totalPages={totalPages}
            onNavigate={navigateToPage}
          />
        </div>
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          selectedConversationId={selectedConversationId}
          isLoadingConversation={isLoadingConversation}
          isPending={isPending}
          onMessagesRefresh={fetchMessages}
          conversations={conversations}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col h-full w-full md:hidden">
        {!showChatOnMobile ? (
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            isPending={isPending}
            currentPage={currentPage}
            totalPages={totalPages}
            onNavigate={navigateToPage}
            isMobile
          />
        ) : (
          selectedConversation && (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              selectedConversationId={selectedConversationId}
              isLoadingConversation={isLoadingConversation}
              isPending={isPending}
              onMessagesRefresh={fetchMessages}
              onBack={handleBackToConversations}
              isMobile
              conversations={conversations}
            />
          )
        )}
      </div>
    </div>
  );
}
