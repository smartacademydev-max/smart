import type { Pagination } from "./roleAndPermission";
import type { GlobalResponse } from "./user";

export type NotifiableTypes = "general" | "test" | "live_class" | "offline";

export interface NotificationProps {
    id: number;
    title: string;
    description: string;
    external_link: string | null;
    image_url: string | null;
    has_seen: boolean;
    sent_at: string;
    notification_type: NotifiableTypes;
    notifiable_id: number | null;
}

export interface NotificationListResponse extends GlobalResponse {
    data: {
        data: NotificationProps[];
        pagination: Pagination;
    };
}

export type TargetStudentType = "purchased" | "not_purchased" | "free_trial";

export type NotificationType = "all_course" | "specific_course";

export type CompletionStatus = "completed" | "not_complete";

export type DeliveryMethodsType = "push_notification" | "email_notification" | "notice_board" | "sms_notification"

export interface NotificationPayload {
    id?: number;
    name: string;
    description: string;
    external_link?: string;
    image: File | null,
    image_url?: string;
    target_students: TargetStudentType[]
    notification_type: NotificationType
    megacategory_ids?: number[];
    category_ids?: number[];
    subcategory_ids?: number[];
    level_ids?: number[];
    course_ids?: number[];
    completion_status?: CompletionStatus[];
    delivery_methods?: DeliveryMethodsType[];
    scheduled_date?: string;
    scheduled_time?: string;
    updated_at?: string;
}

export const NotificationInitialState: NotificationPayload = {
    name: "",
    description: "",
    external_link: "",
    image: null,
    image_url: "",
    target_students: [],
    notification_type: "all_course",
    megacategory_ids: [],
    category_ids: [],
    subcategory_ids: [],
    level_ids: [],
    course_ids: [],
    completion_status: [],
    delivery_methods: [],
    scheduled_date: "",
    scheduled_time: ""
}

import * as yup from "yup";

export const NotificationValidationSchema = yup.object({
    name: yup
        .string()
        .required("Notification name is required")
        .min(3, "Name must be at least 3 characters")
        .max(150, "Name must not exceed 150 characters"),

    description: yup
        .string()
        .required("Description is required")
        .min(10, "Description must be at least 10 characters"),

    external_link: yup
        .string()
        .nullable()
    ,

    image: yup
        .mixed<File>()
        .nullable()
        .test("fileSize", "Image size must be under 5MB", (value) => {
            if (!value) return true;
            return value.size <= 5 * 1024 * 1024;
        })
    ,

    image_url: yup.string().nullable(),

    target_students: yup
        .array()
        .of(yup.mixed<TargetStudentType>().oneOf(["purchased", "not_purchased", "free_trial"]))
        .min(1, "Select at least one target student")
        .required("Target students is required"),

    notification_type: yup
        .mixed<"all_course" | "specific_course">()
        .oneOf(["all_course", "specific_course"])
        .required("Notification type is required"),

    megacategory_ids: yup.array().of(yup.number()),

    category_ids: yup.array().of(yup.number()),

    subcategory_ids: yup.array().of(yup.number()),

    level_ids: yup.array().of(yup.number()),

    course_ids: yup.array().of(yup.number()),

    completion_status: yup
        .array()
        .of(yup.mixed<"completed" | "not_complete">().oneOf(["completed", "not_complete"]))
    ,

    delivery_methods: yup
        .array()
        .of(
            yup
                .mixed<
                    "push_notification" |
                    "email_notification" |
                    "notice_board" |
                    "sms_notification"
                >()
                .oneOf([
                    "push_notification",
                    "email_notification",
                    "notice_board",
                    "sms_notification",
                ])
        )
    ,

    scheduled_date: yup.string().nullable(),

    schedule_time: yup.string().nullable(),
});

export interface NotificationList {
    data: {
        data: NotificationPayload[];
        pagination: Pagination;
    }
}

export type NotificationStatus =
    | "draft"
    | "scheduled"
    | "sending"
    | "sent"
    | "partial"
    | "failed";

export type NotificationEventAction =
    | "sent"
    | "delivered"
    | "read"
    | "clicked"
    | "failed";

export type NotificationChannel = DeliveryMethodsType;

export interface NotificationChannelStats {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
}

export interface NotificationStats {
    id: number;
    status: NotificationStatus;
    send_started_at?: string | null;
    send_finished_at?: string | null;
    sent_at?: string | null;
    target_count: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    clicked_count: number;
    failed_count: number;
    per_channel: Partial<Record<NotificationChannel, NotificationChannelStats>>;
    timeline?: { bucket: string; sent: number; delivered: number; failed: number }[];
}

export interface NotificationStatsResponse extends GlobalResponse {
    data: NotificationStats;
}

export interface NotificationEvent {
    id: number;
    user_id: number | null;
    user_name?: string | null;
    user_email?: string | null;
    channel: NotificationChannel;
    action: NotificationEventAction;
    reason?: string | null;
    via?: "card" | "external_link" | "deeplink" | null;
    created_at: string;
}

export interface NotificationEventListResponse extends GlobalResponse {
    data: {
        data: NotificationEvent[];
        pagination: Pagination;
    };
}

export interface NotificationStatsSocketEvent {
    notification_id: number;
    status?: NotificationStatus;
    stats?: NotificationStats;
    event?: NotificationEvent;
}