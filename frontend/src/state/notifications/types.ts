export interface NotificationState {
    content: JSX.Element | string;
    id: number;
    kind: NotificationKind;
    fadeAway: boolean;
}

export interface NotificationsState {
    notifications: NotificationState[];
    nextId: number;
}

export interface NotificationProps {
    notifyError: (message: JSX.Element, fadeAway?: boolean) => { type: string };
    notifySuccess: (message: JSX.Element, fadeAway?: boolean) => { type: string };
    notifyWarning: (message: JSX.Element, fadeAway?: boolean) => { type: string };
    notifyInfo: (message: JSX.Element, fadeAway?: boolean) => { type: string };
}
export enum NotificationKind {
    Error = "danger",
    Warning = "warning",
    Info = "info",
    Success = "success",
}
