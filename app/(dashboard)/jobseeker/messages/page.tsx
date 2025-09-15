import Messages from "@/components/dashboard/Messages";
import {
  getConversationsForCurrentJobseeker,
  getMessagesForConversation,
} from "@/lib/db/queries";

export default async function MessagesPage() {
  const conversations = await getConversationsForCurrentJobseeker();
  const selectedConversationId = null;
  const initialMessages = selectedConversationId
    ? await getMessagesForConversation(selectedConversationId)
    : [];

  return (
    <Messages
      initialConversations={conversations}
      initialSelectedConversationId={selectedConversationId}
      initialMessages={initialMessages as any}
    />
  );
}
