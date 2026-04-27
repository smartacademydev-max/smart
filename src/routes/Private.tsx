import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNotificationToast from "../components/common/AdminNotificationToast";
import ResponsiveDrawer from "../components/pages/layout/sidebar";
import { AdminNotificationProvider, useAdminNotification } from "../context/AdminNotificationContext";
import { useAdminNotificationSocket } from "../hooks/useAdminNotificationSocket";
import { useThemeMeta } from "../hooks/useThemeMeta";
import { useAppSelector } from "../store/hook";
import { PATH } from "./PATH";

function SocketBridge() {
    const { addToast } = useAdminNotification();
    const user = useAppSelector((state) => state.auth.user);
    const userId = user?.id ? Number(user.id) : undefined;
    useAdminNotificationSocket(userId, { onNotification: addToast });
    return null;
}

function PrivateContent() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    useThemeMeta();

    React.useEffect(() => {
        if (!user) {
            navigate(PATH.AUTH.LOGIN.ROOT);
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="smart__root">
            <SocketBridge />
            <ResponsiveDrawer>
                <Outlet />
            </ResponsiveDrawer>
            <AdminNotificationToast />
        </div>
    );
}

export default function Private() {
    return (
        <AdminNotificationProvider>
            <PrivateContent />
        </AdminNotificationProvider>
    );
}
