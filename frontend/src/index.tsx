// Import polyfills
import "babel-polyfill";

// React and ReactDOM dependencies
import React from "react";
import ReactDOM from "react-dom";

// Redux dependencies
import store, { history } from "./store";
import { Provider } from "react-redux";

// React Router and React Router Redux dependencies
import { ConnectedRouter } from "connected-react-router";

import App from "./components/App";

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App/>
        </ConnectedRouter>
    </Provider>,
    document.getElementById("root"),
);
