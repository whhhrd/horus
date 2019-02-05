import { combineReducers } from 'redux';
import { History } from 'history';

import authReducer from './auth/reducer';
import { ApplicationState } from './state';
import { connectRouter } from 'connected-react-router';

 // TODO: implement cleaning the state on log out.

export const rootReducer = (history: History) => combineReducers<ApplicationState>({
    router: connectRouter(history),
	auth: authReducer,
} as any);
