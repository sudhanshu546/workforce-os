import { apiSlice } from './apiSlice';

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkerUtilization: builder.query<any[], void>({
      query: () => '/analytics/worker-utilization',
    }),
    getProfitability: builder.query<any[], void>({
      query: () => '/analytics/profitability',
    }),
    getOwnerAnalytics: builder.query<any, void>({
      query: () => '/analytics/owner',
    }),
    getPerformanceReport: builder.query<Blob, void>({
      query: () => ({
        url: '/analytics/report-pdf',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetWorkerUtilizationQuery,
  useGetProfitabilityQuery,
  useGetOwnerAnalyticsQuery,
  useLazyGetPerformanceReportQuery,
} = analyticsApi;
