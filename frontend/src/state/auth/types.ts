import CoursePermissions from "../../api/permissions";

export interface LoginForm {
    username: string;
    password: string;
}

export interface AuthState {
    loggedIn: boolean;
    coursePermissions: CoursePermissions;
    error?: Error;
}
