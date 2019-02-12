import { RouterState } from "connected-react-router";
import { AuthState } from "./auth/types";

export interface ApplicationState {
    router?: RouterState;
    auth?: AuthState;
}
