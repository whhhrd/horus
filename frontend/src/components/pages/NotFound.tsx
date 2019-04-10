import { PureComponent } from "react";
import React from "react";

export default class NotFound extends PureComponent {
    render() {
        return (
            <div style={{ height: "100vh" }}>
                <div className="d-flex justify-content-center h-100 flex-wrap">
                    <div className="my-auto w-100 text-center">
                        <h1 className="display-1">404</h1>
                        <h1>Page not found</h1>
                    </div>
                </div>
            </div>
        );
    }
}
