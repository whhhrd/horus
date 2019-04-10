export interface NavigationBarState {
    currentActiveTab: ActiveTabEnum | null;
}

export enum ActiveTabEnum {
    DASHBOARD,
    COURSES,
    SIGNOFF,
    ADMINISTRATION,
    ROOMS,
    JOBS,
    NONE,
}
