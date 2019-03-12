import React, { Component } from "react";
import { ApplicationState } from "../state/state";
import { isOpen } from "../state/sidebar/selectors";
import { connect } from "react-redux";
import { toggleSidebarPhoneAction } from "../state/sidebar/actions";
import { centerSpinner } from "./pagebuilder";
import NavigationBar from "./navigationBar/NavigationBar";

interface DesktopComponentProps {
    headerTitle: string;
    content: JSX.Element | null;
    sidebarContent: JSX.Element | null;
}

class DesktopComponent extends Component<DesktopComponentProps> {

    render() {
        const { headerTitle, content, sidebarContent } = this.props;
        return (
            // A flexible body for the navigation bar, content (including sidebar)
            <div className="d-none d-lg-flex">
                {/* Render the navigation bar with Desktop Mode */}
                <NavigationBar onPhone={false} visibleOnPhone={false}/>

                {/* Fills the remaining horizontal space (next to the navbar) */}
                <div className="flex-fill">

                    {/* A wrapper for the content, a flexible row that contains the content ans possibly the sidebar */}
                    <div className="ContentWrapper d-flex flex-row">

                        {/* The body for the actual content, a flex column that contanis the title and body content */}
                        <div className="ContentBody d-flex flex-column flex-fill">

                            {/* The content header box displaying the 'headerTitle' argument */}
                            <div className="ContentHeader px-3 pt-3 w-100">
                                <h2>{headerTitle}</h2>
                                <hr className="mb-0"/>
                            </div>

                            {/* The main content box, displaying the elements from the 'content' argument or
                                the center spinner if the content is Null. */}
                            <div className="ContentMain px-3 pt-3 pb-3 w-100">
                                {content != null ? content : centerSpinner()}
                            </div>
                        </div>

                        {/* If sidebar content has been passed, render it in a sidebar like box */}
                        {sidebarContent != null &&
                            <div className="Sidebar p-3 bg-light border-left">
                                {sidebarContent}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state: ApplicationState) => ({
    isOpen: isOpen(state),
}), {
        toggleSidebarPhone: toggleSidebarPhoneAction,
    })(DesktopComponent);
