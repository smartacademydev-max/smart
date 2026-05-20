import { useEffect } from "react";
import { getEcho } from "../lib/echo";
import { notificationApi } from "../services/notificationApi";
import { useAppDispatch } from "../store/hook";
import type { NotificationStatsSocketEvent } from "../types/notification";

export function useNotificationStatsSocket(notificationId: number | undefined) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!notificationId) return;

        let echo: ReturnType<typeof getEcho>;
        try {
            echo = getEcho();
        } catch (err) {
            console.error("[useNotificationStatsSocket]", err);
            return;
        }

        const channelName = `admin.notification.${notificationId}`;
        const channel = echo.private(channelName);

        channel.error((err: unknown) => {
            console.error("[NotificationStatsSocket] channel error:", err);
        });

        channel.listen(".NotificationStatsUpdated", (payload: NotificationStatsSocketEvent) => {
            if (payload.stats) {
                dispatch(
                    notificationApi.util.updateQueryData(
                        "getNotificationStats",
                        { id: notificationId },
                        (draft) => {
                            draft.data = { ...draft.data, ...payload.stats };
                        }
                    )
                );
            } else if (payload.status) {
                dispatch(
                    notificationApi.util.updateQueryData(
                        "getNotificationStats",
                        { id: notificationId },
                        (draft) => {
                            draft.data = { ...draft.data, status: payload.status! };
                        }
                    )
                );
            } else {
                dispatch(
                    notificationApi.util.invalidateTags([
                        { type: "NotificationStats", id: notificationId },
                    ])
                );
            }

            dispatch(
                notificationApi.util.invalidateTags([
                    { type: "NotificationEvents", id: notificationId },
                ])
            );
        });

        return () => {
            echo.leave(channelName);
        };
    }, [notificationId, dispatch]);
}
