import { AuthState } from './auth/types';
import { RouterState } from 'connected-react-router';

export interface ApplicationState {
    router?: RouterState;
    auth?: AuthState;
}