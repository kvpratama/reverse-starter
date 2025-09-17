import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClientMessages from "./Messages";
import { Conversation, Message } from "@/app/types/types";

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock the fetch function
global.fetch = jest.fn();

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Test User 1",
    title: "Job Title 1",
    avatar: "avatar1.jpg",
    lastMessage: "Hello",
    timestamp: new Date().toISOString(),
    isRead: false,
    profileId: "profile1",
    jobPostId: "jobpost1",
  },
  {
    id: "2",
    name: "Test User 2",
    title: "Job Title 2",
    avatar: "avatar2.jpg",
    lastMessage: "Hi there",
    timestamp: new Date().toISOString(),
    isRead: true,
    profileId: "profile2",
    jobPostId: "jobpost2",
  },
];

const mockMessages: Message[] = [
  {
    id: "msg1",
    sender: "Test User 1",
    content: "Hello",
    timestamp: new Date().toISOString(),
    type: "text",
    jobPostId: "jobpost1",
  },
];

describe("ClientMessages", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("should mark a conversation as read when clicked", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ messages: mockMessages }),
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(
      <ClientMessages
        initialConversations={mockConversations}
        initialSelectedConversationId={null}
        initialMessages={[]}
      />
    );

    const conversationList = screen.getByTestId("conversation-list");

    // Find the unread conversation button
    const unreadConversationButton = within(conversationList).getByText("Test User 1");
    expect(unreadConversationButton).toBeInTheDocument();

    // The conversation should not have the "read" style initially
    // The parent button has the class that controls the color
    const buttonElement = unreadConversationButton.closest('button');
    expect(buttonElement).toHaveClass("text-black");
    expect(buttonElement).not.toHaveClass("text-gray-300");


    // Click the conversation
    fireEvent.click(unreadConversationButton);

    // Wait for the fetch calls to complete
    await waitFor(() => {
      // First fetch for messages
      expect(global.fetch).toHaveBeenCalledWith("/api/conversations/1/messages", {
        cache: "no-store",
      });
      // Second fetch to mark as read
      expect(global.fetch).toHaveBeenCalledWith("/api/conversations/1/read", {
        method: "POST",
      });
    });

    // After clicking, the conversation should be marked as read in the UI
    // The text color class should be updated
    await waitFor(() => {
        const updatedButtonElement = within(conversationList).getByText("Test User 1").closest('button');
        expect(updatedButtonElement).toHaveClass("text-gray-300");
        expect(updatedButtonElement).not.toHaveClass("text-black");
    });
  });
});