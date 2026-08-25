import type { CategoryFilterParams, QueryParams } from "../types";

import type { OmrFormatList, OmrFormatProps, OmrList, OMRType, QuestionLabelDetailResponse, QuestionLabelFormProps, QuestionLabelList, QuestionList, QuestionProps, QuestionTypeProps, SetList, SetProps, StudentSubmitTestList, StudentSubmitTestProps, TestCategory, TestCategoryListing, TestList, TestOverviewResponse, TestProps, TestTypeProps } from "../types/question";
import type { TransactionList } from "../types/transaction";
import type { GlobalResponse } from "../types/user";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export const questionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadQuestionPaper: builder.mutation<GlobalResponse & {
            data: QuestionProps[]
        }, { body: FormData }>({
            query: ({ body }) => ({
                url: `admin/questions/file`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "Questions", id: "LIST" }]
        }),
        saveUploadedQuestions: builder.mutation<GlobalResponse, { title: string; question: any[] }>({
            query: (body) => ({
                url: `admin/questions/import`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "Questions", id: "LIST" }, { type: "Test", id: "LIST" }]
        }),
        EditOrCreateQuestion: builder.mutation<GlobalResponse, { body: QuestionProps }>({
            query: ({ body }) => ({
                url: `admin/questions`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { body }) => [
                { type: "Questions", id: "LIST" },
                { type: "OMR", id: "LIST" },
                ...(body.id ? [{ type: "Questions" as const, id: body.id }] : [])
            ]
        }),
        getAllQuestion: builder.query<QuestionList, QueryParams & {
            /**
             * A single format, "all", or a comma-separated list — the API
             * filters with whereIn, so a test picker can ask for every
             * objective format at once.
             */
            type?: QuestionTypeProps | "all" | (string & {});
            days?: number | null;
            set_ids?: number[];
        }>({
            query: ({ type, pageIndex, pageSize, search, days, startDate, endDate, set_ids }) => {
                const queryString = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    type: type,
                    start_date: startDate,
                    end_date: endDate,
                    days: days,
                    set_ids: set_ids?.length ? set_ids : undefined,
                });
                return {
                    url: `admin/questions?${queryString}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Questions", id: "LIST" }]
        }),
        getQuestionById: builder.query<{ data: QuestionProps }, number>({
            query: (id) => ({
                url: `admin/questions/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Questions", id }]
        }),
        deleteQuestion: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `admin/questions`,
                method: "DELETE",
                body: {
                    questions: body
                }
            }),
            invalidatesTags: [{ type: "Questions", id: "LIST" }]
        }),
        editOrCreateTest: builder.mutation<GlobalResponse, { body: TestProps }>({
            query: ({ body }) => ({
                url: `/admin/test`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { body }) => [
                { type: "Test", id: "LIST" },
                { type: "Set", id: "LIST" },
                ...(body.id ? [{ type: "Test" as const, id: body.id }] : [])
            ]
        }),
        changeTestStatus: builder.mutation<GlobalResponse, { body: number[] }>({
            query: ({ body }) => ({
                url: `/admin/test/status`,
                method: "POST",
                body: { tests: body }
            }),
            invalidatesTags: [{ type: "Test", id: "LIST" }, { type: "Set", id: "LIST" }]
        }),
        getAllTest: builder.query<TestList, QueryParams & { type?: TestTypeProps; days?: number | null; categoryFilter?: CategoryFilterParams; course_id?: number; test_category_id?: number }>({
            query: ({ pageIndex, pageSize, search, type, days, startDate, endDate, categoryFilter, course_id, test_category_id }) => {
                const queryString = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    type: type,
                    start_date: startDate,
                    end_date: endDate,
                    days: days,
                    mega_categories: categoryFilter?.mega_category,
                    categories: categoryFilter?.category,
                    sub_categories: categoryFilter?.sub_category,
                    positions: categoryFilter?.positions,
                    course_id,
                    test_category_id
                });
                return {
                    url: `/admin/test?${queryString}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Test", id: "LIST" }]
        }),
        getTestById: builder.query<{ data: TestProps }, { id?: number }>({
            query: ({ id }) => ({
                url: `/admin/test/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }, { type: "Test", id: "LIST" }]
        }),
        deleteTest: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/test`,
                method: "DELETE",
                body: {
                    tests: body
                }
            }),
            invalidatesTags: [{ type: "Test", id: "LIST" }]
        }),
        getTestOverview: builder.query<TestOverviewResponse, { id?: number }>({
            query: ({ id }) => ({
                url: `/admin/test/${id}/overview`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getTestQuestions: builder.query<QuestionList, { id?: number }>({
            query: ({ id }) => ({
                url: `/admin/test/${id}/questions`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getListOfStudentSubmittedTest: builder.query<StudentSubmitTestList, { id?: number, qp: QueryParams, search: string }>({
            query: ({ id, qp, search }) => ({
                url: `/admin/test/${id}/result?${buildQueryParams({
                    page: qp.pageIndex,
                    page_size: qp.pageSize,
                    search: search
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getSingleStudentResult: builder.query<{ data: StudentSubmitTestProps }, { id?: number, resultId?: number }>({
            query: ({ id, resultId }) => ({
                url: `/admin/test/${id}/result/${resultId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        downloadResult: builder.mutation<Blob & GlobalResponse, { testId: number; resultId: number }>({
            query: ({ testId, resultId }) => ({
                url: `/admin/test/${testId}/result/${resultId}/download`,
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
        }),
        submitTestFeedback: builder.mutation<GlobalResponse, { id?: number, resultId?: number, body: { feedback: string } }>({
            query: ({ id, resultId, body }) => ({
                url: `/admin/test/${id}/result/${resultId}/feedback`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getTestFeedback: builder.query<GlobalResponse & {
            data: {
                feedback: string;
                video_url: string;
            }
        }, { id?: number, resultId?: number }>({
            query: ({ id, resultId }) => ({
                url: `/admin/test/${id}/result/${resultId}/feedback`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        submitTestSample: builder.mutation<GlobalResponse, { id?: number, body: FormData }>({
            query: ({ id, body }) => ({
                url: `/admin/test/${id}/sample`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getTestSample: builder.query<GlobalResponse & {
            data: {
                sample: File | null;
                sample_url: string;
                video_url: string;
            }
        }, { id?: number, resultId?: number }>({
            query: ({ id }) => ({
                url: `/test/${id}/sample`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getQuestionsListInTest: builder.query<QuestionList, { id?: number, resultId?: number }>({
            query: ({ id, resultId }) => ({
                url: `/admin/test/${id}/result/${resultId}/question`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getSingleQuestionInTest: builder.query<{ data: QuestionProps }, { id?: number, resultId?: number, questionId?: number }>({
            query: ({ id, resultId, questionId }) => ({
                url: `/admin/test/${id}/result/${resultId}/question/${questionId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        markSubjectiveQuestion: builder.mutation<GlobalResponse,
            {
                id?: number,
                resultId?: number,
                questionId?: number,
                body: {
                    grade: number,
                    feedback: string,
                    checked_answer_media: Array<{
                        media_id: number,
                        media: string
                    }>
                }
            }
        >({
            query: ({ id, resultId, questionId, body }) => ({
                url: `/admin/test/${id}/result/${resultId}/feedback/question/${questionId}`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        getMarkedSubjectiveQuestion: builder.query<GlobalResponse & {
            data: {
                grade: number,
                feedback: string,
                checked_answer_media: Array<{
                    media_id: number,
                    media: string
                }>
            }
        },
            {
                id?: number,
                resultId?: number,
                questionId?: number
            }
        >({
            query: ({ id, resultId, questionId }) => ({
                url: `/admin/test/${id}/result/${resultId}/feedback/question/${questionId}`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test", id }]
        }),
        publishTestResults: builder.mutation<GlobalResponse, { id?: number }>({
            query: ({ id }) => ({
                url: `/admin/test/${id}/publish`,
                method: "POST"
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "Test", id }, { type: "Test", id: "LIST" }]
        }),
        getAllIndividualTest: builder.query<TestList, QueryParams & { type?: TestTypeProps; days?: number | null; categoryFilter?: CategoryFilterParams; }>({
            query: ({ pageIndex, pageSize, search }) => ({
                url: `/test?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search
                })}`
            }),
            providesTags: [{ type: "Test", id: "LIST" }]
        }),
        createBundle: builder.mutation<SetList, { body: FormData }>({
            query: ({ body }) => ({
                url: `/admin/bundle`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "Set", id: "LIST" }]
        }),
        getAllBundle: builder.query<SetList, QueryParams & { type?: TestTypeProps; days?: number | null; categoryFilter?: CategoryFilterParams; }>({
            query: ({ pageIndex, pageSize, search }) => ({
                url: `/bundle?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search
                })}`,
                method: "GET",
            }),
            providesTags: [{ type: "Set", id: "LIST" }]
        }),
        getBundleById: builder.query<{ data: SetProps }, { id: number }>({
            query: ({ id }) => ({
                url: `/bundle/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Set", id }]
        }),
        updateBundle: builder.mutation<GlobalResponse & { data: SetProps }, { id: number; body: FormData }>({
            query: ({ id, body }) => ({
                url: `/admin/bundle/${id}`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Set", id },
                { type: "Set", id: "LIST" }
            ]
        }),
        deleteBundle: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/bundle`,
                method: "DELETE",
                body: { bundle_ids: body }
            }),
            invalidatesTags: (_result, _error) => [
                { type: "Set", id: "LIST" }
            ]
        }),
        changeBundleStatus: builder.mutation<GlobalResponse, { body: number[] }>({
            query: ({ body }) => ({
                url: `/admin/bundle/status`,
                method: "POST",
                body: { bundle_ids: body }
            }),
            invalidatesTags: [{ type: "Set", id: "LIST" }]
        }),
        getTestRelatedToBundle: builder.query<TestList, QueryParams & { id: number }>({
            query: ({ id, pageIndex, pageSize }) => ({
                url: `/bundle/${id}/selected-test?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Set", id }]
        }),
        createOmrSheet: builder.mutation<GlobalResponse, { body: FormData }>({
            query: ({ body }) => ({
                url: `/admin/omr-sheet`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "OMR", id: "LIST" }]
        }),
        getOmrById: builder.query<GlobalResponse, { id: number }>({
            query: ({ id }) => ({
                url: `/omr-sheet/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "OMR", id }]
        }),
        getAllOmr: builder.query<OmrList, QueryParams & { days?: number | null; }>({
            query: ({ pageIndex, pageSize, search, days }) => ({
                url: `/omr-sheet?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    days: days,
                    search: search
                })}`,
                method: "GET"
            }),
            providesTags: [{ type: "OMR", id: "LIST" }]

        }),
        getAllOmrType: builder.query<GlobalResponse & { data: OMRType[] }, void>({
            query: () => ({
                url: `/admin/omr`,
                method: "GET"
            })
        }),
        updateOmrSheet: builder.mutation<GlobalResponse, { id: number; body: FormData }>({
            query: ({ id, body }) => ({
                url: `/admin/omr-sheet/${id}`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "OMR", id },
                { type: "OMR", id: "LIST" }
            ]
        }),
        deleteOmrSheet: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/omr-sheet`,
                method: "DELETE",
                body: { omr_sheet_ids: body }
            }),
            invalidatesTags: [{ type: "OMR", id: "LIST" }]
        }),
        createOmrFormat: builder.mutation<GlobalResponse, { body: FormData }>({
            query: ({ body }) => ({
                url: `/admin/omr/format`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "OMR", id: "FORMAT_LIST" }]
        }),
        updateOmrFormat: builder.mutation<GlobalResponse, { id: number; body: FormData }>({
            query: ({ id, body }) => ({
                url: `/admin/omr/format/${id}`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "OMR", id: `FORMAT_${id}` },
                { type: "OMR", id: "FORMAT_LIST" }
            ]
        }),
        getOmrFormatById: builder.query<GlobalResponse & { data: OmrFormatProps }, { id: number }>({
            query: ({ id }) => ({
                url: `/omr/format/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "OMR", id: `FORMAT_${id}` }]
        }),
        getAllOmrFormat: builder.query<OmrFormatList, QueryParams>({
            query: ({ pageIndex, pageSize, search }) => ({
                url: `/omr/format?${buildQueryParams({ page: pageIndex, page_size: pageSize, search })}`,
                method: "GET"
            }),
            providesTags: [{ type: "OMR", id: "FORMAT_LIST" }]
        }),
        deleteOmrFormat: builder.mutation<GlobalResponse, { body: number[] }>({
            query: ({ body }) => ({
                url: `/admin/omr/format`,
                method: "DELETE",
                body: { omr_test_instruction_ids: body }
            }),
            invalidatesTags: [{ type: "OMR", id: "FORMAT_LIST" }]
        }),

        // ── Test Enrollment ──────────────────────────────────────────────────
        getEnrolledStudentsByTest: builder.query<TransactionList, QueryParams & { id: number; type?: "active" | "archived" }>({
            query: ({ id, pageIndex, pageSize, search, type }) => ({
                url: `/admin/test/${id}/user?${buildQueryParams({ page: pageIndex, page_size: pageSize, search, type })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "TestEnrollment", id }, { type: "TestEnrollment", id: "LIST" }]
        }),
        enrollStudentToTest: builder.mutation<GlobalResponse, { id: number; user_id: number }>({
            query: ({ id, user_id }) => ({
                url: `/admin/test/${id}/user`,
                method: "POST",
                body: { user_id }
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "TestEnrollment", id }, { type: "TestEnrollment", id: "LIST" }]
        }),
        archiveStudentFromTest: builder.mutation<GlobalResponse, { id: number; transactionId: number }>({
            query: ({ id, transactionId }) => ({
                url: `/admin/test/${id}/user/archive/${transactionId}`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "TestEnrollment", id }, { type: "TestEnrollment", id: "LIST" }]
        }),

        // ── Bundle Enrollment ────────────────────────────────────────────────
        getEnrolledStudentsByBundle: builder.query<TransactionList, QueryParams & { id: number; type?: "active" | "archived" }>({
            query: ({ id, pageIndex, pageSize, search, type }) => ({
                url: `/admin/bundle/${id}/user?${buildQueryParams({ page: pageIndex, page_size: pageSize, search, type })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "BundleEnrollment", id }, { type: "BundleEnrollment", id: "LIST" }]
        }),
        enrollStudentToBundle: builder.mutation<GlobalResponse, { id: number; user_id: number }>({
            query: ({ id, user_id }) => ({
                url: `/admin/bundle/${id}/user`,
                method: "POST",
                body: { user_id }
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "BundleEnrollment", id }, { type: "BundleEnrollment", id: "LIST" }]
        }),
        archiveStudentFromBundle: builder.mutation<GlobalResponse, { id: number; transactionId: number }>({
            query: ({ id, transactionId }) => ({
                url: `/admin/bundle/${id}/user/archive/${transactionId}`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "BundleEnrollment", id }, { type: "BundleEnrollment", id: "LIST" }]
        }),
        getAllQuestionSets: builder.query<QuestionLabelList, QueryParams>({
            query: ({ pageIndex, pageSize, search }) => ({
                url: `/admin/question-labels?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                })}`,
                method: "GET",
            }),
            providesTags: [{ type: "QuestionLabel", id: "LIST" }],
        }),
        createQuestionLabel: builder.mutation<GlobalResponse, { body: QuestionLabelFormProps }>({
            query: ({ body }) => ({
                url: `/admin/question-labels`,
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "QuestionLabel", id: "LIST" }],
        }),
        updateQuestionLabel: builder.mutation<GlobalResponse, { id: number; body: QuestionLabelFormProps }>({
            query: ({ id, body }) => ({
                url: `/admin/question-labels/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "QuestionLabel", id },
                { type: "QuestionLabel", id: "LIST" },
            ],
        }),
        deleteQuestionLabel: builder.mutation<GlobalResponse, { body: number[] }>({
            query: ({ body }) => ({
                url: `/admin/question-labels`,
                method: "DELETE",
                body: { label_ids: body },
            }),
            invalidatesTags: [{ type: "QuestionLabel", id: "LIST" }],
        }),
        getQuestionLabelById: builder.query<QuestionLabelDetailResponse, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/question-labels/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "QuestionLabel", id }],
        }),
        getQuestionsByLabel: builder.query<QuestionList, QueryParams & { id: number; type?: QuestionTypeProps }>({
            query: ({ id, pageIndex, pageSize, search, type }) => ({
                url: `/admin/question-labels/${id}/questions?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    type,
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "QuestionLabel", id }],
        }),
        addQuestionsToLabel: builder.mutation<GlobalResponse, { id: number; question_ids: number[] }>({
            query: ({ id, question_ids }) => ({
                url: `/admin/question-labels/${id}/questions`,
                method: "POST",
                body: { question_ids },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "QuestionLabel", id },
                { type: "QuestionLabel", id: "LIST" },
            ],
        }),
        removeQuestionsFromLabel: builder.mutation<GlobalResponse, { id: number; question_ids: number[] }>({
            query: ({ id, question_ids }) => ({
                url: `/admin/question-labels/${id}/questions`,
                method: "DELETE",
                body: { question_ids },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "QuestionLabel", id },
                { type: "QuestionLabel", id: "LIST" },
            ],
        }),
        bulkUpdateQuestionMarks: builder.mutation<GlobalResponse, { question_ids: number[]; points: number }>({
            query: (body) => ({
                url: `admin/questions/bulk-marks`,
                method: "PUT",
                body,
            }),
            invalidatesTags: [{ type: "Questions", id: "LIST" }],
        }),
        getAllTestCategory: builder.query<TestCategoryListing, QueryParams>({
            query: ({ pageIndex, pageSize, search }) => {
                const params = new URLSearchParams();

                if (pageIndex) params.append("page", pageIndex.toString());
                if (pageSize) params.append("page_size", pageSize.toString());
                if (search) params.append("search", search);

                return {
                    url: `/admin/test/category?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((pos) => ({
                            type: "TestCategory" as const,
                            id: pos.id,
                        })),
                        { type: "TestCategory", id: "LIST" },
                    ]
                    : [{ type: "TestCategory", id: "LIST" }],
        }),

        getTestCategoryById: builder.query<{ data: TestCategory }, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/test/category/${id}`,
                method: "GET",
            }),
            providesTags: (_res, _err, { id }) => [{ type: "TestCategory", id }],
        }),

        createTestCategory: builder.mutation<{ data: TestCategory; message: string }, FormData>({
            query: (body) => ({
                url: "/admin/test/category",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "TestCategory", id: "LIST" }],
        }),

        updateTestCategory: builder.mutation<
            { data: TestCategory; message: string },
            { id: string; body: FormData }
        >({
            query: ({ id, body }) => ({
                url: `/admin/test/category/${id}`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "TestCategory", id },
                { type: "TestCategory", id: "LIST" },
            ],
        }),

        deleteTestCategory: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/test/category`,
                method: "DELETE",
                body: { test_category_ids: body },
            }),
            invalidatesTags: [{ type: "TestCategory", id: "LIST" }],
        }),
        getCourseTest: builder.query<TestList, QueryParams & { id: number }>({
            query: ({ id, pageIndex, pageSize, search }) => ({
                url: `/course/${id}/test?${buildQueryParams({ page: pageIndex, page_size: pageSize, search })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Course" as const, id }],
        }),
    })
});

export const {
    useUploadQuestionPaperMutation,
    useSaveUploadedQuestionsMutation,
    useEditOrCreateQuestionMutation,
    useGetAllQuestionQuery,
    useGetQuestionByIdQuery,
    useDeleteQuestionMutation,
    useEditOrCreateTestMutation,
    useChangeTestStatusMutation,
    useGetAllTestQuery,
    useGetTestByIdQuery,
    useDeleteTestMutation,
    useGetTestOverviewQuery,
    useGetTestQuestionsQuery,
    useGetListOfStudentSubmittedTestQuery,
    useGetSingleStudentResultQuery,
    useSubmitTestFeedbackMutation,
    useGetTestFeedbackQuery,
    useGetQuestionsListInTestQuery,
    useGetSingleQuestionInTestQuery,
    useMarkSubjectiveQuestionMutation,
    useGetMarkedSubjectiveQuestionQuery,
    usePublishTestResultsMutation,
    useSubmitTestSampleMutation,
    useGetTestSampleQuery,
    useDownloadResultMutation,
    useGetAllIndividualTestQuery,
    useCreateBundleMutation,
    useUpdateBundleMutation,
    useGetBundleByIdQuery,
    useGetAllBundleQuery,
    useDeleteBundleMutation,
    useChangeBundleStatusMutation,
    useGetTestRelatedToBundleQuery,
    useCreateOmrSheetMutation,
    useGetAllOmrQuery,
    useGetOmrByIdQuery,
    useGetAllOmrTypeQuery,
    useUpdateOmrSheetMutation,
    useDeleteOmrSheetMutation,
    useCreateOmrFormatMutation,
    useUpdateOmrFormatMutation,
    useGetOmrFormatByIdQuery,
    useGetAllOmrFormatQuery,
    useDeleteOmrFormatMutation,
    useGetEnrolledStudentsByTestQuery,
    useEnrollStudentToTestMutation,
    useArchiveStudentFromTestMutation,
    useGetEnrolledStudentsByBundleQuery,
    useEnrollStudentToBundleMutation,
    useArchiveStudentFromBundleMutation,
    useGetAllQuestionSetsQuery,
    useCreateQuestionLabelMutation,
    useUpdateQuestionLabelMutation,
    useDeleteQuestionLabelMutation,
    useGetQuestionLabelByIdQuery,
    useGetQuestionsByLabelQuery,
    useAddQuestionsToLabelMutation,
    useRemoveQuestionsFromLabelMutation,
    useBulkUpdateQuestionMarksMutation,
    useGetAllTestCategoryQuery,
    useGetTestCategoryByIdQuery,
    useCreateTestCategoryMutation,
    useUpdateTestCategoryMutation,
    useDeleteTestCategoryMutation
} = questionApi;
