import { match } from "react-router";

export interface NavigationBarState {
    currentActiveTab: ActiveTabEnum | null;
    match: match | null;
}

export enum ActiveTabEnum {
    DASHBOARD,
    COURSES,
    SIGNOFF,
    ADMINISTRATION,
    ROOMS,
    NONE,
}
