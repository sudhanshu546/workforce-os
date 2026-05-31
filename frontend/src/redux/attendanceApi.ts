import { apiSlice } from './apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendance: builder.query<any, { page: number; size: number }>({
      query: ({ page, size }) => `/attendance?page=${page}&size=${size}`,
      providesTags: ['Attendance'],
    }),
    getWorkerAttendance: builder.query<any, { workerId: number; page: number; size: number }>({
      query: ({ workerId, page, size }) => `/attendance/worker/${workerId}?page=${page}&size=${size}`,
      providesTags: ['Attendance'],
    }),
    getAttendanceStatus: builder.query<boolean, number>({
      query: (workerId) => `/attendance/status?workerId=${workerId}`,
      providesTags: ['Attendance'],
    }),
    clockIn: builder.mutation<any, { workerId: number; workOrderId?: number; latitude?: number; longitude?: number; status: string }>({
      query: (body) => ({
        url: '/attendance/clock-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    clockOut: builder.mutation<any, { workerId: number; workOrderId?: number; latitude?: number; longitude?: number }>({
      query: (body) => ({
        url: '/attendance/clock-out',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetWorkerAttendanceQuery,
  useGetAttendanceStatusQuery,
  useClockInMutation,
  useClockOutMutation,
} = attendanceApi;
