import { apiSlice } from './apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<any[], string>({
      query: (conversationId) => `/chat/history/${conversationId}`,
      providesTags: (result, error, id) => [{ type: 'Chat' as const, id }],
    }),
    getConversations: builder.query<any[], string>({
      query: (userId) => `/chat/conversations/${userId}`,
      providesTags: ['Chat'],
    }),
    getUnreadCount: builder.query<number, string>({
      query: (userId) => `/chat/unread-count/${userId}`,
      providesTags: ['Chat'],
    }),
    markAsRead: builder.mutation<void, { conversationId: string; userId: string }>({
      query: ({ conversationId, userId }) => ({
        url: `/chat/read/${conversationId}/${userId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useGetConversationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
} = chatApi;
