import type { QueryParams } from "../types";
import type {
    AppSettingProps,
    ChangePasswordProps,
    CourseSettingProps,
    EmailTemplateActor,
    EmailTemplateMethod,
    EmailTemplateProps,
    EsewaSettingProps,
    KhaltiSettingProps,
    LinkedDeviceList,
    LoginTypeSettingProps,
    SmsGatewaySettingProps,
    SmtpSettingProps,
    SmtpSettingResponse,
    TestConnectionResult,
    TestSmtpConnectionPayload,
    ThemeSettingProps,
    ZoomAccount,
    ZoomAccountCreateProps,
    ZoomAccountUpdateProps,
} from "../types/setting";
import type { GlobalResponse, User } from "../types/user";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export const settingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        changePassword: builder.mutation<GlobalResponse, ChangePasswordProps>({
            query: (body) => ({
                url: "/admin/settings/password",
                method: "POST",
                body,
            }),
        }),

        getAllLinkedDevices: builder.query<LinkedDeviceList, QueryParams>({
            query: ({ pageIndex, pageSize }) => ({
                url: `/admin/settings/linked-device?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize
                })}`,
                method: "GET",
            }),
            providesTags: ["LinkedDevice"],
        }),

        logoutFromLinkedDevice: builder.mutation<
            GlobalResponse,
            { id: number }
        >({
            query: ({ id }) => ({
                url: `/admin/settings/linked-device/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["LinkedDevice"],
        }),
        updateAppSetting: builder.mutation<GlobalResponse, FormData>({
            query: (body) => ({
                url: `/admin/settings/app-settings`,
                method: "POST",
                body
            }),
        }),
        getAppSettings: builder.query<GlobalResponse & { data: AppSettingProps }, void>({
            query: () => ({
                url: `/settings`,
                method: "GET",
            }),
        }),
        updatedProfile: builder.mutation<GlobalResponse, FormData>({
            query: (body) => ({
                url: `/admin/settings/profile`,
                method: "POST",
                body
            })
        }),
        getProfile: builder.query<GlobalResponse & { data: User }, void>({
            query: () => ({
                url: `/admin/settings/profile`,
                method: "GET",
            })
        }),
        getThemeSettings: builder.query<GlobalResponse & { data: ThemeSettingProps }, void>({
            query: () => ({
                url: `/settings/theme`,
                method: "GET",
            }),
            providesTags: ["Theme"],
        }),
        updateThemeSetting: builder.mutation<GlobalResponse, FormData>({
            query: (body) => ({
                url: `/admin/settings/theme`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Theme"],
        }),
        getSmtpSettings: builder.query<GlobalResponse & { data: SmtpSettingResponse }, void>({
            query: () => ({ url: `/admin/settings/smtp`, method: "GET" }),
            providesTags: ["SmtpSetting"],
        }),
        updateSmtpSettings: builder.mutation<GlobalResponse, SmtpSettingProps>({
            query: (body) => ({ url: `/admin/settings/smtp`, method: "POST", body }),
            invalidatesTags: ["SmtpSetting"],
        }),
        testSmtpConnection: builder.mutation<
            GlobalResponse & { data: TestConnectionResult },
            TestSmtpConnectionPayload
        >({
            query: (body) => ({
                url: `/admin/settings/api/smtp/test`,
                method: "POST",
                body,
            }),
        }),
        getCourseSettings: builder.query<GlobalResponse & { data: CourseSettingProps }, void>({
            query: () => ({ url: `/admin/settings/course`, method: "GET" }),
            providesTags: ["CourseSetting"],
        }),
        updateCourseSettings: builder.mutation<GlobalResponse, CourseSettingProps>({
            query: (body) => ({ url: `/admin/settings/course`, method: "POST", body }),
            invalidatesTags: ["CourseSetting"],
        }),
        getLoginTypeSetting: builder.query<GlobalResponse & { data: LoginTypeSettingProps }, void>({
            query: () => ({ url: `/admin/settings/login-type`, method: "GET" }),
            providesTags: ["LoginType"],
        }),
        updateLoginTypeSetting: builder.mutation<GlobalResponse, LoginTypeSettingProps>({
            query: (body) => ({ url: `/admin/settings/login-type`, method: "POST", body }),
            invalidatesTags: ["LoginType"],
        }),
        getEmailTemplates: builder.query<
            GlobalResponse & { data: EmailTemplateProps[] },
            { actor: EmailTemplateActor; method: EmailTemplateMethod }
        >({
            query: ({ actor, method }) => ({
                url: `/admin/settings/email-templates?actor=${actor}&method=${method}`,
                method: "GET",
            }),
            providesTags: ["EmailTemplate"],
        }),
        // getEmailTemplate: builder.query<
        //     GlobalResponse & { data: EmailTemplateProps },
        //     { actor: EmailTemplateActor; method: EmailTemplateMethod; template_key: string }
        // >({
        //     query: ({ actor, method, template_key }) => ({
        //         url: `/admin/settings/email-templates/${template_key}?actor=${actor}&method=${method}`,
        //         method: "GET",
        //     }),
        //     providesTags: ["EmailTemplate"],
        // }),
        updateEmailTemplate: builder.mutation<GlobalResponse, EmailTemplateProps>({
            query: ({ actor, method, template_key, ...body }) => ({
                url: `/admin/settings/email-templates/${template_key}?actor=${actor}&method=${method}`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["EmailTemplate"],
        }),
        getZoomAccounts: builder.query<GlobalResponse & { data: ZoomAccount[] }, void>({
            query: () => ({ url: `/admin/settings/api/zoom`, method: "GET" }),
            providesTags: ["ZoomAccount"],
        }),
        createZoomAccount: builder.mutation<GlobalResponse, ZoomAccountCreateProps>({
            query: (body) => ({ url: `/admin/settings/api/zoom`, method: "POST", body }),
            invalidatesTags: ["ZoomAccount"],
        }),
        updateZoomAccount: builder.mutation<GlobalResponse, ZoomAccountUpdateProps>({
            query: ({ id, ...body }) => ({ url: `/admin/settings/api/zoom/${id}`, method: "PUT", body }),
            invalidatesTags: ["ZoomAccount"],
        }),
        toggleZoomAccount: builder.mutation<GlobalResponse, number>({
            query: (id) => ({ url: `/admin/settings/api/zoom/${id}/toggle`, method: "PATCH" }),
            invalidatesTags: ["ZoomAccount"],
        }),
        deleteZoomAccount: builder.mutation<GlobalResponse, number>({
            query: (id) => ({ url: `/admin/settings/api/zoom/${id}`, method: "DELETE" }),
            invalidatesTags: ["ZoomAccount"],
        }),
        getEsewaSettings: builder.query<GlobalResponse & { data: EsewaSettingProps }, void>({
            query: () => ({ url: `/admin/settings/api/esewa`, method: "GET" }),
            providesTags: ["ApiSetting"],
        }),
        updateEsewaSettings: builder.mutation<GlobalResponse, Partial<EsewaSettingProps>>({
            query: (body) => ({ url: `/admin/settings/api/esewa`, method: "POST", body }),
            invalidatesTags: ["ApiSetting"],
        }),
        toggleEsewaActive: builder.mutation<GlobalResponse, void>({
            query: () => ({ url: `/admin/settings/api/esewa/toggle`, method: "PATCH" }),
            invalidatesTags: ["ApiSetting"],
        }),
        getKhaltiSettings: builder.query<GlobalResponse & { data: KhaltiSettingProps }, void>({
            query: () => ({ url: `/admin/settings/api/khalti`, method: "GET" }),
            providesTags: ["ApiSetting"],
        }),
        updateKhaltiSettings: builder.mutation<GlobalResponse, Partial<KhaltiSettingProps>>({
            query: (body) => ({ url: `/admin/settings/api/khalti`, method: "POST", body }),
            invalidatesTags: ["ApiSetting"],
        }),
        toggleKhaltiActive: builder.mutation<GlobalResponse, void>({
            query: () => ({ url: `/admin/settings/api/khalti/toggle`, method: "PATCH" }),
            invalidatesTags: ["ApiSetting"],
        }),
        getSmsGatewaySettings: builder.query<GlobalResponse & { data: SmsGatewaySettingProps }, void>({
            query: () => ({ url: `/admin/settings/api/sms-gateway`, method: "GET" }),
            providesTags: ["ApiSetting"],
        }),
        updateSmsGatewaySettings: builder.mutation<GlobalResponse, Partial<SmsGatewaySettingProps>>({
            query: (body) => ({ url: `/admin/settings/api/sms-gateway`, method: "POST", body }),
            invalidatesTags: ["ApiSetting"],
        }),
        clearServerCache: builder.mutation<GlobalResponse, void>({
            query: () => ({ url: `/admin/settings/cache-refresh`, method: "POST" }),
        }),
    }),
});

export const {
    useChangePasswordMutation,
    useGetAllLinkedDevicesQuery,
    useLogoutFromLinkedDeviceMutation,
    useUpdateAppSettingMutation,
    useGetAppSettingsQuery,
    useUpdatedProfileMutation,
    useGetProfileQuery,
    useGetThemeSettingsQuery,
    useUpdateThemeSettingMutation,
    useGetSmtpSettingsQuery,
    useUpdateSmtpSettingsMutation,
    useGetCourseSettingsQuery,
    useUpdateCourseSettingsMutation,
    useGetLoginTypeSettingQuery,
    useUpdateLoginTypeSettingMutation,
    useGetEmailTemplatesQuery,
    useUpdateEmailTemplateMutation,
    useGetZoomAccountsQuery,
    useCreateZoomAccountMutation,
    useUpdateZoomAccountMutation,
    useToggleZoomAccountMutation,
    useDeleteZoomAccountMutation,
    useGetEsewaSettingsQuery,
    useUpdateEsewaSettingsMutation,
    useToggleEsewaActiveMutation,
    useGetKhaltiSettingsQuery,
    useUpdateKhaltiSettingsMutation,
    useToggleKhaltiActiveMutation,
    useGetSmsGatewaySettingsQuery,
    useUpdateSmsGatewaySettingsMutation,
    useTestSmtpConnectionMutation,
    useClearServerCacheMutation,
} = settingApi;
