import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const PAGE_SIZE = 20;

// Fetches every message for a session (bounded, reasonable for a single
// chat history) but only reveals a growing window client-side, so opening a
// long-running session doesn't render/re-render everything at once. Call
// `loadMore()` when the user scrolls near the top of the message list.
export function useChatMessages(sessionId) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => setVisibleCount(PAGE_SIZE), [sessionId]);

  const query = useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      const messages = await base44.entities.ChatMessage.filter({ session_id: sessionId });
      return [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!sessionId,
  });

  const allMessages = query.data || [];
  const visibleMessages = useMemo(
    () => allMessages.slice(Math.max(0, allMessages.length - visibleCount)),
    [allMessages, visibleCount]
  );

  return {
    ...query,
    messages: visibleMessages,
    hasMore: visibleCount < allMessages.length,
    loadMore: () => setVisibleCount((c) => c + PAGE_SIZE),
  };
}

export function useCreateChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", variables.session_id] });
    },
  });
}

export function useUpdateChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChatMessage.update(id, data),
    onSuccess: (_, variables) => {
      if (variables?.data?.session_id) {
        queryClient.invalidateQueries({ queryKey: ["chatMessages", variables.data.session_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      }
    },
  });
}
