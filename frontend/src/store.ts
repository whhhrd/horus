// `react-router-redux` is deprecated, so we use `connected-react-router`.
// This provides a Redux middleware which connects to our `react-router` instance.
import { routerMiddleware } from "connected-react-router";
import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";

// If you use react-router, don't forget to pass in your history type.
import { createBrowserHistory } from "history";

// Import the state interface and our combined reducers/sagas.
import { rootReducer } from "./state/reducer";
import rootSaga from "./state/sagas";
import { ApplicationState } from "./state/state";

// Import the API auth saga
import { authenticationFlow } from "./api";

export const history = createBrowserHistory();

const initialState: ApplicationState = {
};

const configureStore = (state: ApplicationState) => {

    // create the redux-saga middleware
    const sagaMiddleware = createSagaMiddleware();

    // We'll create our store with the combined reducers/sagas, and the initial Redux state that
    // we'll be passing from our entry point.

    const store = createStore(
        rootReducer(history),
        state,
        compose(applyMiddleware(routerMiddleware(history), sagaMiddleware)),
        );

        // Don't forget to run the root saga, and return the store object.
    sagaMiddleware.run(function*() {
            yield* authenticationFlow();
            yield* rootSaga();
        });
    return store;
    };

const appStore = configureStore(initialState);

export default appStore;
