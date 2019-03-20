import { Action } from "redux";
import { NOTIFICATION_DISMISSED_ACTION, NOTIFICATION_REQUESTED_ACTION, NOTIFICATIONS_RESET_ACTION } from "./constants";
import { NotificationKind } from "./types";

export interface NotificationAction extends Action<string> {
    readonly message: string;
    readonly fadeAway: boolean;
    readonly id: number;
    readonly kind: NotificationKind;
}

export const notificationAction = (message: string, kind: NotificationKind, fadeAway: boolean = true) =>
    ({ type: NOTIFICATION_REQUESTED_ACTION, message, kind, fadeAway });
export const notificationDismissedAction = (id: number) => ({ type: NOTIFICATION_DISMISSED_ACTION, id });
export const notificationsResetAction = () => (
    { type: NOTIFICATIONS_RESET_ACTION }
);
