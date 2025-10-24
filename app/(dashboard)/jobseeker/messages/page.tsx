import Messages from "@/components/dashboard/Messages";
import {
  getConversationsForCurrentJobseekerPaginated,
  getMessagesForConversation,
} from "@/lib/db/queries";

const PAGE_SIZE = 10;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams)?.page) || 1);
  const { conversations, totalCount } =
    await getConversationsForCurrentJobseekerPaginated(page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const selectedConversationId = null;
  const initialMessages = selectedConversationId
    ? await getMessagesForConversation(selectedConversationId)
    : [];

  return (
    <Messages
      initialConversations={conversations}
      initialSelectedConversationId={selectedConversationId}
      initialMessages={initialMessages}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
