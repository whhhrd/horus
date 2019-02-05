import { Store, createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
// `react-router-redux` is deprecated, so we use `connected-react-router`.
// This provides a Redux middleware which connects to our `react-router` instance.
import { routerMiddleware } from 'connected-react-router';

// If you use react-router, don't forget to pass in your history type.
import { createBrowserHistory } from 'history';

// Import the state interface and our combined reducers/sagas.
import { ApplicationState } from './state/state';
import rootSaga from './state/sagas';
import { rootReducer } from './state/reducer';

export const history = createBrowserHistory()

const initialState: ApplicationState = {
  router: undefined,
  auth: undefined
};

const configureStore = function(initialState: ApplicationState): Store<ApplicationState> {

  // create the redux-saga middleware
  const sagaMiddleware = createSagaMiddleware()

  // We'll create our store with the combined reducers/sagas, and the initial Redux state that
  // we'll be passing from our entry point.

  const store = createStore(
    rootReducer(history),
    initialState,
    compose(applyMiddleware(routerMiddleware(history), sagaMiddleware))
  )

  // Don't forget to run the root saga, and return the store object.
  sagaMiddleware.run(rootSaga)
  return store
};

const store = configureStore(initialState);

export default store;