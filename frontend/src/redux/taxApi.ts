import { apiSlice } from './apiSlice';

export const taxApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTaxConfigs: builder.query<any[], void>({
      query: () => '/finance/taxes',
      providesTags: ['Invoice'],
    }),
    saveTaxConfig: builder.mutation<any, any>({
      query: (config) => ({
        url: '/finance/taxes',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['Invoice'],
    }),
  }),
});

export const {
  useGetTaxConfigsQuery,
  useSaveTaxConfigMutation,
} = taxApi;
