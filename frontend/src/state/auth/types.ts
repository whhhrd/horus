export interface LoginForm {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AuthState extends LoginResponse {
    loggedIn: boolean;
    accessToken: string;
    refreshToken: string;
    error?: Error;
}
