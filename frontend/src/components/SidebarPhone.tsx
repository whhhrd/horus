import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ApplicationState } from "../state/state";
import { isOpen } from "../state/sidebar/selectors";
import { connect } from "react-redux";
import { toggleSidebarPhoneAction } from "../state/sidebar/actions";
import { Action } from "redux";

interface SidebarPhoneProps {
    content: JSX.Element;
    isOpen: boolean;
    toggleSidebarPhone: () => Action;
}

class SidebarPhone extends Component<SidebarPhoneProps> {

    render() {
        if (this.props.isOpen) {
            return (
                <div className="SidebarSm bg-light d-flex flex-column">
                    <div className="SidebarHeaderSm p-3 border-bottom w-100 d-flex flex-row">
                        <div className="flex-grow-1">
                            <h5 className="mb-0">Viewing more information</h5>
                        </div>
                        <div className="pr-2 cursor-pointer flex-shrink-0">
                            <span onClick={this.props.toggleSidebarPhone}>
                                <FontAwesomeIcon icon={faTimes} size="lg" /></span>
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
}

export default connect((state: ApplicationState) => ({
    isOpen: isOpen(state),
}), {
    toggleSidebarPhone: toggleSidebarPhoneAction,
    })(SidebarPhone);
