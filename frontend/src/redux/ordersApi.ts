import { apiSlice } from './apiSlice';

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkOrders: builder.query<any, { page: number; size: number }>({
      query: ({ page, size }) => `/work-orders?page=${page}&size=${size}`,
      providesTags: (result) =>
        result && result.content
          ? [
              ...result.content.map(({ id }: { id: number }) => ({ type: 'WorkOrder' as const, id })),
              { type: 'WorkOrder', id: 'LIST' },
            ]
          : [{ type: 'WorkOrder', id: 'LIST' }],
    }),
    assignWorker: builder.mutation<void, { workOrderId: number; workerId: number }>({
      query: ({ workOrderId, workerId }) => ({
        url: `/work-orders/${workOrderId}/assign`,
        method: 'PATCH',
        body: { workerId },
      }),
      invalidatesTags: (result, error, { workOrderId }) => [{ type: 'WorkOrder', id: workOrderId }],
    }),
    getRecommendations: builder.query<any[], number>({
      query: (woId) => `/work-orders/${woId}/recommendations`,
    }),
    autoDispatch: builder.mutation<any, number>({
      query: (woId) => ({
        url: `/work-orders/${woId}/auto-dispatch`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'WorkOrder', id },
        { type: 'WorkOrder', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetWorkOrdersQuery,
  useAssignWorkerMutation,
  useGetRecommendationsQuery,
  useLazyGetRecommendationsQuery,
  useAutoDispatchMutation,
} = ordersApi;
