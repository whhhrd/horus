import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";

interface SidebarPhoneProps {
    content: JSX.Element;
}

class SidebarPhone extends Component<
    SidebarPhoneProps & RouteComponentProps<any>
> {
    render() {
        const sidebarOpen = this.props.location.hash === "#sidebar";

        if (sidebarOpen) {
            return (
                <div className="SidebarSm bg-light d-flex flex-column">
                    <div className="SidebarHeaderSm p-0 border-bottom w-100 d-flex flex-row">
                        <div className="flex-grow-1 p-3">
                            <h5 className="mb-0">Viewing more information</h5>
                        </div>
                        <div
                            className="p-3 pl-5 cursor-pointer flex-shrink-0"
                            onClick={() => this.closeSidebar()}
                        >
                            <span>
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                            </span>
                        </div>
                    </div>
                    <div className="SidebarContentSm p-3 pt-0 w-100">
                        {this.props.content}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    closeSidebar() {
        const { history } = this.props;
        history.push({
            ...history.location,
            hash: "",
        });
    }
}

export default withRouter(
    connect(
        () => ({}),
        {
        },
    )(SidebarPhone),
);
