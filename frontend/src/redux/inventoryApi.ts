import { apiSlice } from './apiSlice';

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<any, { page: number; size: number }>({
      query: ({ page, size }) => `/inventory/materials?page=${page}&size=${size}`,
      providesTags: ['Inventory'],
    }),
    getLowStock: builder.query<any[], void>({
      query: () => '/inventory/materials/low-stock',
      providesTags: ['Inventory'],
    }),
    createMaterial: builder.mutation<any, any>({
      query: (material) => ({
        url: '/inventory/materials',
        method: 'POST',
        body: material,
      }),
      invalidatesTags: ['Inventory'],
    }),
    updateMaterial: builder.mutation<any, { id: number; material: any }>({
      query: ({ id, material }) => ({
        url: `/inventory/materials/${id}`,
        method: 'PUT',
        body: material,
      }),
      invalidatesTags: ['Inventory'],
    }),
    deleteMaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/inventory/materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetLowStockQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = inventoryApi;
