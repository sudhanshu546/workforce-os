import { apiSlice } from './apiSlice';

export const financeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<any, { page: number; size: number }>({
      query: ({ page, size }) => `/finance/invoices?page=${page}&size=${size}`,
      providesTags: ['Invoice'],
    }),
    getPayments: builder.query<any, { page: number; size: number; method?: string; status?: string }>({
      query: ({ page, size, method, status }) => {
        let url = `/finance/payments?page=${page}&size=${size}`;
        if (method) url += `&method=${method}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: ['Payment'],
    }),
    getWorkerPayments: builder.query<any, { workerId: number; page: number; size: number }>({
      query: ({ workerId, page, size }) => `/finance/payments/worker/${workerId}?page=${page}&size=${size}`,
      providesTags: ['Payment'],
    }),
    verifyCashDeposit: builder.mutation<any, number>({
      query: (paymentId) => ({
        url: `/finance/payments/${paymentId}/verify-cash`,
        method: 'POST',
      }),
      invalidatesTags: ['Payment', 'Invoice'],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetPaymentsQuery,
  useGetWorkerPaymentsQuery,
  useVerifyCashDepositMutation,
} = financeApi;
