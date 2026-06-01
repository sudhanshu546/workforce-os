import { apiSlice } from './apiSlice';

export const routeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    optimizeRoute: builder.query<any, { workerId: number, date: string }>({
      query: ({ workerId, date }) => `/operations/route/optimize/${workerId}?date=${date}`,
    }),
  }),
});

export const {
  useLazyOptimizeRouteQuery,
} = routeApi;
