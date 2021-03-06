import { NotificationProps, NotificationKind } from "./types";
import { notificationAction } from "./actions";

export const NOTIFICATION_REQUESTED_ACTION: string =
    "notifications/NOTIFICATION_REQUESTED_ACTION";

export const NOTIFICATION_DISMISSED_ACTION: string =
    "notifications/NOTIFICATION_DISMISSED_ACTION";

export const NOTIFICATIONS_RESET_ACTION: string =
    "notifications/NOTIFICATIONS_RESET";

export const notifyError = (
    message: JSX.Element | string,
    fadeAway?: boolean,
) => notificationAction(message, NotificationKind.Error, fadeAway);

export const notifySuccess = (
    message: JSX.Element | string,
    fadeAway?: boolean,
) => notificationAction(message, NotificationKind.Success, fadeAway);

export const notifyWarning = (
    message: JSX.Element | string,
    fadeAway?: boolean,
) => notificationAction(message, NotificationKind.Warning, fadeAway);

export const notifyInfo = (message: JSX.Element | string, fadeAway?: boolean) =>
    notificationAction(message, NotificationKind.Info, fadeAway);

export const NOTIFICATION_ACTION_CONNECTOR: NotificationProps = {
    notifyError,
    notifySuccess,
    notifyWarning,
    notifyInfo,
};
