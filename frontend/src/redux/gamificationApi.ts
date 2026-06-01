import { apiSlice } from './apiSlice';

export const gamificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaderboard: builder.query<any[], void>({
      query: () => '/workforce/leaderboard',
      providesTags: ['Worker'],
    }),
    getWorkerStats: builder.query<any, number>({
      query: (workerId) => `/workforce/leaderboard/stats/${workerId}`,
      providesTags: (result, error, id) => [{ type: 'Worker', id }],
    }),
  }),
});

export const {
  useGetLeaderboardQuery,
  useGetWorkerStatsQuery,
} = gamificationApi;
