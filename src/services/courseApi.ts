import type { CurriculumType } from "../components/pages/CourseManagement/Course/createCourse/CourseSubFields/Curriculum";
import type { CategoryFilterParams, QueryParams } from "../types";
import type { AnalyticsProps, courseClonePropertyProps, CourseList, CourseProps, courseTabType, CurriculumList, CurriculumProps } from "../types/course";
import type { MediaList, PlaylistDetail, PlaylistListing } from "../types/media";
import type { TestList } from "../types/question";
import type { TransactionList } from "../types/transaction";
import type { GlobalResponse } from "../types/user";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export const courseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCourse: builder.mutation<{ data: CourseProps, message: string }, { body: FormData }>({
            query: ({ body }) => ({
                url: "/admin/course",
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "Course", id: "LIST" }]
        }),
        changeCourseStatus: builder.mutation<GlobalResponse, { body: number[] }>({
            query: ({ body }) => ({
                url: `/admin/course/status`,
                method: "POST",
                body: { ids: body }
            }),
            invalidatesTags: [{ type: "Course", id: "LIST" }]
        }),
        getAllCourse: builder.query<CourseList, QueryParams & { categoryFilter?: CategoryFilterParams; status?: "all" | "published" | "draft" }>({
            query: ({ pageIndex, pageSize, search, categoryFilter, status }) => {
                const queryString = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    mega_categories: categoryFilter?.mega_category,
                    categories: categoryFilter?.category,
                    sub_categories: categoryFilter?.sub_category,
                    positions: categoryFilter?.positions,
                    teachers: categoryFilter?.teachers,
                    payment: categoryFilter?.course_type,
                    status: status === "all" ? null : status
                })
                return {
                    url: `/course?${queryString}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((course) => ({ type: "Course" as const, id: course.id })),
                        { type: "Course", id: "LIST" },
                    ]
                    : [{ type: "Course", id: "LIST" }],
        }),
        editCourse: builder.mutation<{ data: CourseProps, message: string }, { body: FormData, id: number }>({
            query: ({ body, id }) => ({
                url: `/admin/course/${id}`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Course", id: "LIST" },
                { type: "Course", id }
            ]
        }),
        getCourseById: builder.query<{ data: CourseProps }, { id: string }>({
            query: ({ id }) => ({
                url: `/admin/course/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Course", id }],
        }),
        deleteCourse: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/course/`,
                method: "DELETE",
                body: { courses: body }
            }),
            invalidatesTags: (_result, _error,) => [
                { type: "Course", id: "LIST" }
            ],
        }),
        cloneCourse: builder.mutation<GlobalResponse, { id: number, properties: courseClonePropertyProps[] }>({
            query: ({ id, properties }) => ({
                url: `/admin/course/${id}/clone`,
                method: "POST",
                body: { properties: properties }
            }),
            invalidatesTags: (_result, _error,) => [
                { type: "Course", id: "LIST" }
            ],
        }),
        addCurriculum: builder.mutation<GlobalResponse, { body: CurriculumProps, id: number, type: CurriculumType }>({
            query: ({ body, id, type }) => ({
                url: `/admin/course/curriculum/${id}?type=${type}`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "Curriculum", id: "LIST" }]
        }),
        getAllCurriculum: builder.query<CurriculumList, QueryParams & { id: number }>({
            query: ({ pageIndex, pageSize, search, id }) => {
                const params = new URLSearchParams();

                if (pageIndex) {
                    params.append('page', (pageIndex).toString());
                }
                if (pageSize) {
                    params.append('page_size', pageSize.toString());
                }
                if (search) {
                    params.append('search', search.toString());
                }

                return {
                    url: `/admin/course/curriculum/${id}?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((curriculum) => ({ type: "Curriculum" as const, id: curriculum.id })),
                        { type: "Curriculum", id: "LIST" },
                        { type: "Media", id: "LIST" }
                    ]
                    : [{ type: "Curriculum", id: "LIST" },
                    { type: "Media", id: "LIST" }
                    ],
        }),
        getCourseCurriculumById: builder.query<{ data: CurriculumProps }, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/course/curriculum/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Curriculum", id }],
        }),
        deleteCourseCurriculum: builder.mutation<GlobalResponse, { id: number, type: CurriculumType, idToDelete: number }>({
            query: ({ id, type, idToDelete }) => {

                return {
                    url: `/admin/course/curriculum/${id}?type=${type}&ids=${idToDelete}`,
                    method: "DELETE",
                }
            },
            invalidatesTags: (_result, _error,) => [
                { type: "Curriculum", id: "LIST" },
                { type: "Media", id: "LIST" }
            ],
        }),
        getCourseMediaByType: builder.query<MediaList, { id: string | null; type: courseTabType, qp: QueryParams, search: string }>({
            query: ({ id, type, qp, search }) => {
                const queryString = buildQueryParams({ type, page: qp.pageIndex, page_size: qp.pageSize, search: search });

                return {
                    url: `/admin/course/${id}/media?${queryString}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((curriculum) => ({ type: "Media" as const, id: curriculum.id })),
                        { type: "Media", id: "LIST" },
                    ]
                    : [{ type: "Media", id: "LIST" }],
        }),
        addCourseMediaByType: builder.mutation<GlobalResponse, { id: string | null; type: courseTabType, body: number[] }>({
            query: ({ id, type, body }) => {
                const queryString = buildQueryParams({ type });
                return {
                    url: `/admin/course/${id}/media?${queryString}`,
                    method: "POST",
                    body: {
                        media_ids: body
                    }
                };
            },
            invalidatesTags: (_result, _error,) => [
                { type: "Media", id: "LIST" }
            ],
        }),
        removeCourseMediaByType: builder.mutation<GlobalResponse, { id: string | null; type: courseTabType, body: number[] }>({
            query: ({ id, type, body }) => {
                const queryString = buildQueryParams({ type });
                return {
                    url: `/admin/course/${id}/media?${queryString}`,
                    method: "DELETE",
                    body: {
                        ids: body
                    }
                };
            },
            invalidatesTags: (_result, _error,) => [
                { type: "Media", id: "LIST" }
            ],
        }),
        getCourseMediaPlaylist: builder.query<PlaylistListing, { id: number | null; type: courseTabType; qp: QueryParams }>({
            query: ({ id, type, qp }) => {
                return ({
                    url: `/course/${id}/playlist?${buildQueryParams({
                        type,
                        page: qp.pageIndex,
                        page_size: qp.pageSize,
                    })}`,
                    method: "GET",
                })
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((media) => ({ type: "Media" as const, id: media.chapter_id })),
                        { type: "Media" as const, id: "LIST" },
                    ]
                    : [{ type: "Media" as const, id: "LIST" }],
        }),
        getSinglePlaylist: builder.query<PlaylistDetail, QueryParams & { id: number, playlistId?: number, type: courseTabType }>({
            query: ({ id, playlistId, type, pageIndex, pageSize, search }) => ({
                url: `/course/${id}/playlist/${playlistId}?${buildQueryParams({
                    type: type,
                    search: search,
                    page_size: pageSize,
                    page: pageIndex
                })}`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Media" as const, id }],
        }),
        assignMediaToCourse: builder.mutation<GlobalResponse, { course_ids: number[]; type: courseTabType, media_ids: number[] }>({
            query: ({ course_ids, type, media_ids }) => {
                return {
                    url: `/admin/course/media/${type}/assign`,
                    method: "POST",
                    body: {
                        course_ids: course_ids,
                        media_ids: media_ids
                    }
                };
            },
            invalidatesTags: (_result, _error,) => [
                { type: "Media", id: "LIST" }
            ],
        }),
        getCourseTest: builder.query<TestList, QueryParams & { id: number }>({
            query: ({ id, pageIndex, pageSize, search }) => {
                const queryString = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                })
                return ({
                    url: `/admin/course/${id}/test?${queryString}`,
                    method: "GET"
                })
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((curriculum) => ({ type: "Test" as const, id: curriculum.id })),
                        { type: "Test", id: "LIST" },
                    ]
                    : [{ type: "Test", id: "LIST" }],
        }),
        assignTestToCourse: builder.mutation<GlobalResponse, { id: number | null; body: number[] }>({
            query: ({ id, body }) => {
                return {
                    url: `/admin/course/${id}/test`,
                    method: "POST",
                    body: {
                        test_ids: body
                    }
                };
            },
            invalidatesTags: (_result, _error,) => [
                { type: "Test", id: "LIST" }
            ],

        }),
        removeTestToCourse: builder.mutation<GlobalResponse, { id: number | null; body: number[] }>({
            query: ({ id, body }) => {
                return {
                    url: `/admin/course/${id}/test`,
                    method: "DELETE",
                    body: {
                        ids: body
                    }
                };
            },
            invalidatesTags: (_result, _error,) => [
                { type: "Test", id: "LIST" }
            ],
        }),
        getCourseAnalytics: builder.query<{ data: AnalyticsProps[] }, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/course/${id}/analytics`,
                method: "GET"
            })
        }),
        getEnrollmentAnalytics: builder.query<{ data: AnalyticsProps[] }, void>({
            query: () => ({
                url: `/admin/enrollment/analytics`,
                method: "GET"
            })
        }),
        getEnrolledStudents: builder.query<TransactionList, QueryParams & { id: number; status?: "active" | "archived"; }>({
            query: ({ id, search, status, pageIndex, pageSize }) => ({
                url: `/admin/course/${id}/user?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    type: status,
                })}`,
                method: "GET"
            }),
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((course) => ({ type: "Archive" as const, id: course.id })),
                        { type: "Archive", id: "LIST" },
                    ]
                    : [{ type: "Archive", id: "LIST" }],
        }),
        enrolledStudents: builder.mutation<GlobalResponse, { id: number | null; user_id: number | null; }>({
            query: ({ id, user_id }) => ({
                url: `/admin/course/${id}/user`,
                method: "POST",
                body: { user_id }
            }),
            invalidatesTags: [{ type: "Archive", id: "LIST" }]
        }),
        archiveEnrolledStudent: builder.mutation<GlobalResponse, { id: number; transactionId: number }>({
            query: ({ id, transactionId }) => ({
                url: `/admin/course/${id}/user/archive/${transactionId}`,
                method: "POST"
            }),
            invalidatesTags: [{ type: "Archive", id: "LIST" }]
        }),
    })
})

export const {
    useCreateCourseMutation,
    useChangeCourseStatusMutation,
    useGetAllCourseQuery,
    useEditCourseMutation,
    useGetCourseByIdQuery,
    useDeleteCourseMutation,
    useCloneCourseMutation,
    useAddCurriculumMutation,
    useGetAllCurriculumQuery,
    useGetCourseCurriculumByIdQuery,
    useDeleteCourseCurriculumMutation,
    useGetCourseMediaByTypeQuery,
    useAddCourseMediaByTypeMutation,
    useAssignMediaToCourseMutation,
    useGetCourseTestQuery,
    useAssignTestToCourseMutation,
    useRemoveCourseMediaByTypeMutation,
    useRemoveTestToCourseMutation,
    useGetCourseAnalyticsQuery,
    useGetEnrollmentAnalyticsQuery,
    useGetEnrolledStudentsQuery,
    useEnrolledStudentsMutation,
    useArchiveEnrolledStudentMutation,
    useGetCourseMediaPlaylistQuery,
    useGetSinglePlaylistQuery,
} = courseApi;
