import { apiSlice } from './apiSlice';

export const workforceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkers: builder.query<any, { page: number; size: number }>({
      query: ({ page, size }) => `/workers?page=${page}&size=${size}`,
      providesTags: (result) =>
        result && result.content
          ? [
              ...result.content.map(({ id }: { id: number }) => ({ type: 'Worker' as const, id })),
              { type: 'Worker', id: 'LIST' },
            ]
          : [{ type: 'Worker', id: 'LIST' }],
    }),
    getAllWorkers: builder.query<any[], void>({
      query: () => '/workers/all',
      providesTags: [{ type: 'Worker', id: 'LIST' }],
    }),
    onboardWorker: builder.mutation<any, any>({
      query: (body) => ({
        url: '/workers/onboard',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Worker', id: 'LIST' }],
    }),
    updateWorker: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => ({
        url: `/workers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Worker', id }],
    }),
    deleteWorker: builder.mutation<void, number>({
      query: (id) => ({
        url: `/workers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Worker', id: 'LIST' }],
    }),
    assignServiceToWorker: builder.mutation<void, { workerId: number; serviceId: number }>({
      query: ({ workerId, serviceId }) => ({
        url: `/workers/${workerId}/services/${serviceId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { workerId }) => [{ type: 'Worker', id: workerId }],
    }),
    removeServiceFromWorker: builder.mutation<void, { workerId: number; serviceId: number }>({
      query: ({ workerId, serviceId }) => ({
        url: `/workers/${workerId}/services/${serviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workerId }) => [{ type: 'Worker', id: workerId }],
    }),
  }),
});

export const {
  useGetWorkersQuery,
  useGetAllWorkersQuery,
  useOnboardWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
  useAssignServiceToWorkerMutation,
  useRemoveServiceFromWorkerMutation,
} = workforceApi;
