import { apiSlice } from './apiSlice';

export const servicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceItems: builder.query<any, void>({
      query: () => '/services/items',
      providesTags: (result) =>
        result
          ? [
              ...(result.content || result).map(({ id }: { id: number }) => ({ type: 'Service' as const, id })),
              { type: 'Service', id: 'LIST' },
            ]
          : [{ type: 'Service', id: 'LIST' }],
    }),
  }),
});

export const { useGetServiceItemsQuery } = servicesApi;
