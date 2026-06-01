import { apiSlice } from './apiSlice';

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSentimentInsights: builder.query<any, void>({
      query: () => '/reviews/insights',
      providesTags: ['Worker'], // Reuse Worker tag for leaderboard/stats updates
    }),
  }),
});

export const {
  useGetSentimentInsightsQuery,
} = reviewsApi;
