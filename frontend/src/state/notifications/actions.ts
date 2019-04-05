import { Action } from "redux";

import { NotificationKind } from "./types";
import {
    NOTIFICATION_DISMISSED_ACTION,
    NOTIFICATION_REQUESTED_ACTION,
    NOTIFICATIONS_RESET_ACTION,
} from "./constants";

// NOTIFICATION ACTION
export interface NotificationAction extends Action<string> {
    readonly message: JSX.Element | string;
    readonly fadeAway: boolean;
    readonly id: number;
    readonly kind: NotificationKind;
}

export const notificationAction = (
    message: JSX.Element | string,
    kind: NotificationKind,
    fadeAway: boolean = true,
) => ({ type: NOTIFICATION_REQUESTED_ACTION, message, kind, fadeAway });

// NOTIFICATION DISMISAL
export interface NotificationDismissedAction extends Action<string> {
    id: number;
}

export const notificationDismissedAction = (id: number) => ({
    type: NOTIFICATION_DISMISSED_ACTION,
    id,
});

// NOTIFICATION RESET
export const notificationsResetAction = () => ({
    type: NOTIFICATIONS_RESET_ACTION,
});
