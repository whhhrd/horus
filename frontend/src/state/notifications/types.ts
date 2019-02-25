export interface NotificationState {
    message: string;
    id: number;
    kind: NotificationKind;
    fadeAway: boolean;
}

export interface NotificationsState {
    notifications: NotificationState[];
    nextId: number;
}

export interface NotificationProps {
    notifyError: (message: string, fadeAway?: boolean) => { type: string };
    notifySuccess: (message: string, fadeAway?: boolean) => { type: string };
    notifyWarning: (message: string, fadeAway?: boolean) => { type: string };
    notifyInfo: (message: string, fadeAway?: boolean) => { type: string };
}
export enum NotificationKind {
    Error = "danger",
    Warning = "warning",
    Info = "info",
    Success = "success",
}
