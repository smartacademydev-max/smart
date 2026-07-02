import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import PageHeader from "../../../organism/PageHeader";
import TabController from "../../../molecules/TabController";

type ApiTab = "zoom" | "esewa" | "khalti" | "sms-gateway" | "cache";

const tabs: { label: string; value: ApiTab; redirect_url: string }[] = [
    { label: "Zoom Account", value: "zoom", redirect_url: PATH.SETTINGS.API.ZOOM.ROOT },
    { label: "eSewa Payment", value: "esewa", redirect_url: PATH.SETTINGS.API.ESEWA.ROOT },
    { label: "Khalti Payment", value: "khalti", redirect_url: PATH.SETTINGS.API.KHALTI.ROOT },
    { label: "SMS Gateway", value: "sms-gateway", redirect_url: PATH.SETTINGS.API.SMS_GATEWAY.ROOT },
    { label: "Server Cache", value: "cache", redirect_url: PATH.SETTINGS.API.CACHE.ROOT },
];

export default function ApiSettingRoot() {
    const location = useLocation();
    const navigate = useNavigate();

    const activeTab =
        tabs.find((t) => location.pathname.startsWith(t.redirect_url))?.value ?? "zoom";

    return (
        <>
            <PageHeader
                breadcrumb={[
                    {
                        title: "API Setting",
                        icon: (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" stroke="#1D82F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ),
                    },
                ]}
            />
            <TabController<ApiTab>
                options={tabs}
                currentActive={activeTab}
                setActiveTab={(val) => {
                    const tab = tabs.find((t) => t.value === val);
                    if (tab) navigate(tab.redirect_url);
                }}
            />
            <Outlet />
        </>
    );
}
