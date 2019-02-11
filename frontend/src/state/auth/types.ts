export interface LoginForm {
    username: string;
    password: string;
}

export interface AuthState {
    loggedIn: boolean;
    error?: Error;
}
