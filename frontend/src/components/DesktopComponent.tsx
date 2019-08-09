import React, { Component } from "react";
import { connect } from "react-redux";
import { centerSpinner } from "./pagebuilder";
import NavigationBar from "./navigationBar/NavigationBar";
import { withRouter, RouteComponentProps } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface DesktopComponentProps {
    headerTitle: string;
    content: JSX.Element | null;
    sidebarContent: JSX.Element | null;
}

interface DesktopComponentState {
    width: number;
}

/**
 * Renders a desktop compatible user interface. Displays the Navigationbar
 * on the left hand side, the content header in the top-middle, the main content
 * in the middle and, when specified, the sidebar content on the right hand side.
 *
 * This component is only rendered when the screen width is over a certain threshold:
 * DesktopComponent.WIDTH_THRESHOLD.
 */
class DesktopComponent extends Component<
    DesktopComponentProps & RouteComponentProps<any>,
    DesktopComponentState
> {
    static WIDTH_THRESHOLD = 992;

    constructor(props: DesktopComponentProps & RouteComponentProps<any>) {
        super(props);
        this.state = { width: window.innerWidth };
        this.updateDimensions = this.updateDimensions.bind(this);
        this.closeSidebar = this.closeSidebar.bind(this);
    }

    updateDimensions() {
        this.setState({ width: window.innerWidth });
    }

    componentWillMount() {
        this.updateDimensions();
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    render() {
        const { headerTitle, content, sidebarContent } = this.props;

        // Hide this component when width is below the threshold
        if (this.state.width < DesktopComponent.WIDTH_THRESHOLD) {
            return null;
        }

        return (
            // A flexible body for the navigation bar, content (including sidebar)
            <div className="d-none d-lg-flex">
                {/* Render the navigation bar with Desktop Mode */}
                <NavigationBar onPhone={false} visibleOnPhone={false} />

                {/* Fills the remaining horizontal space (next to the navbar) */}
                <div className="flex-fill">
                    {/* A wrapper for the content, a flexible row that contains the content ans possibly the sidebar */}
                    <div className="ContentWrapper d-flex flex-row">
                        {/* The body for the actual content, a flex column that contanis the title and body content */}
                        <div className="ContentBody d-flex flex-column flex-fill">
                            {/* The content header box displaying the 'headerTitle' argument */}
                            {headerTitle.trim().length > 0 && (
                                <div className="ContentHeader px-3 pt-3 w-100">
                                    <h2>{headerTitle}</h2>
                                    <hr className="mb-0" />
                                </div>
                            )}

                            {/* The main content box, displaying the elements from the 'content' argument or
                                the center spinner if the content is Null. */}
                            <div className="ContentMain px-3 pt-3 pb-3 w-100">
                                {content != null ? content : centerSpinner()}
                            </div>
                        </div>

                        {/* If sidebar content has been passed, render it in a sidebar like box */}
                        {sidebarContent != null && this.isSidebarOpen() && (
                            <div className="Sidebar p-3 bg-light border-left">
                                <div title="Close sidebar"
                                    className="SidebarHideButton cursor-pointer p-2 m-2 bg-light"
                                    onClick={this.closeSidebar}
                                >
                                    <FontAwesomeIcon icon={faTimes} size="lg" />
                                </div>
                                {sidebarContent}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    closeSidebar() {
        const { history } = this.props;
        history.push({
            ...history.location,
            hash: "",
        });
    }

    isSidebarOpen() {
        const { history } = this.props;
        return history.location.hash === "#sidebar";
    }
}
export default withRouter(
    connect(
        () => ({}),
        {},
    )(DesktopComponent),
);
