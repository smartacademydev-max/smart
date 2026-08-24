import type { Pagination } from "./roleAndPermission";

export interface ChangePasswordProps {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface LinkedDeviceProps {
    id: number,
    os: string | null,
    browser: string | null,
    location: string | null,
    ip: string | null;
    created_at: string,
    updated_at: string
}

export interface LinkedDeviceList {
    data: {
        data: LinkedDeviceProps[],
        pagination: Pagination
    }
}

export interface ThemeSettingProps {
    company_name: string;
    brand_name: string;
    tagline: string;
    meta_description: string;
    /** Issuer's tax PIN, printed on the tax invoice masthead. Per-deployment, so it lives in settings. */
    tpin?: string;
    logo_url?: string;
    logo_dark_url?: string;
    favicon_url?: string;
}

export interface ThemeSettingFormProps extends ThemeSettingProps {
    logo: File | null;
    logo_dark: File | null;
    favicon: File | null;
}

export interface PhoneItem {
    label: string;
    value: string;
    icon_url?: string;
}

export interface EmailItem {
    label: string;
    value: string;
    icon_url?: string;
}

export interface SocialItem {
    label: string;
    value: string;
    link: string;
    icon_url?: string;
}

export interface AppSettingProps {
    phones: PhoneItem[];
    emails: EmailItem[];
    socials: SocialItem[];
    map: string;
}

export interface PhoneFormItem extends PhoneItem {
    icon: File | null;
}

export interface EmailFormItem extends EmailItem {
    icon: File | null;
}

export interface SocialFormItem extends SocialItem {
    icon: File | null;
}

export type SmtpHealthCheckUnit = "hour" | "day" | "week";

export interface SmtpSettingProps {
    mailer: "smtp";
    host: string;
    port: number | string;
    encryption: "tls" | "ssl" | "none";
    username: string;
    password: string;
    from_name: string;
    from_email: string;
    test_email?: string;
    health_check_enabled?: boolean;
    health_check_interval_value?: number;
    health_check_interval_unit?: SmtpHealthCheckUnit;
}

export interface SmtpSettingResponse extends SmtpSettingProps {
    is_working?: boolean | null;
    last_tested_at?: string | null;
}

export interface TestConnectionResult {
    provider_status_code: number;
    provider_response_body: string;
    sent_at: string;
}

export interface TestSmtpConnectionPayload {
    target_email: string;
    subject?: string;
    body?: string;
}

export type GlobalDiscountApplicableTo = "expiry" | "subscription" | "both";

export interface CourseSettingProps {
    free_trial_days: number | string;
    free_trial_items: number | string;
    global_discount_enabled: boolean;
    global_discount_value: number | string;
    global_discount_applicable_to: GlobalDiscountApplicableTo;
}

export type LoginType = "otp" | "password" | "both";
export interface LoginTypeSettingProps {
    login_type: LoginType;
}

export type EmailTemplateMethod = "email" | "sms";
export type EmailTemplateActor = "user";

export const TEMPLATE_VARIABLES: Record<string, string[]> = {
    transaction: ["user_name", "amount", "transaction_id", "date"],
    password_reset: ["user_name", "reset_link", "expiry_time"],
    otp: ["user_name", "otp", "expiry_time"],
    welcome_email: ["user_name", "login_url"],
    device_reset_request: ["user_name", "device_name"],
    inactive_state: ["user_name"],
};

export interface EmailTemplateProps {
    actor: EmailTemplateActor;
    method: EmailTemplateMethod;
    template_key: string;
    subject?: string;
body: string;
    is_enabled?: boolean;
    variables?: string[];
}

export interface ZoomAccount {
    id: number;
    name: string;
    is_active: boolean;
    email: string;
    account_id: string;
    client_id: string;
    client_secret: string;
    sdk_key: string;
    sdk_secret: string;
}

export interface ZoomAccountCreateProps {
    name: string;
    email: string;
    account_id: string;
    client_id: string;
    client_secret: string;
    sdk_key: string;
    sdk_secret: string;
}

export interface ZoomAccountUpdateProps {
    id: number;
    name?: string;
    email?: string;
    account_id?: string;
    client_id?: string;
    client_secret?: string;
    sdk_key?: string;
    sdk_secret?: string;
}

export type PaymentMode = "test" | "live";

export interface EsewaSettingProps {
    merchant_id: string | null;
    product_code: string | null;
    secret_key: string | null;
    merchant_secret: string | null;
    mode: PaymentMode;
    is_active: boolean;
    urls?: {
        payment_check_url: string;
        checkurl_mobile: string;
    };
}

export interface KhaltiSettingProps {
    public_key: string | null;
    secret_key: string | null;
    mode: PaymentMode;
    is_active: boolean;
    urls?: {
        api_url: string;
    };
}

export type SmsGatewayProvider = "samaya" | "aakash" | "custom";

export interface SmsGatewaySettingProps {
    provider: SmsGatewayProvider;
    api_key: string;
    sender_id: string;
}