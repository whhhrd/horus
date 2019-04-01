import React, { Component } from "react";
import { connect } from "react-redux";
import { centerSpinner } from "./pagebuilder";
import SidebarPhone from "./SidebarPhone";
import NavigationBar from "./navigationBar/NavigationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { withRouter, RouteComponentProps } from "react-router";

interface PhoneComponentProps {
    headerTitle: string;
    content: JSX.Element | null;
    sidebarContent: JSX.Element | null;
    hasPaddingX: boolean;
    hasPaddingY: boolean;
}

interface PhoneComponentState {
    navigationBarOpen: boolean;
    width: number;
}

class PhoneComponent extends Component<
    PhoneComponentProps & RouteComponentProps<any>,
    PhoneComponentState
> {
    constructor(props: PhoneComponentProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            navigationBarOpen: false,
            width: window.innerWidth,
        };
        this.toggleNavigationBar = this.toggleNavigationBar.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.closeNavigationBar = this.closeNavigationBar.bind(this);
    }

    updateDimensions() {
        this.setState({ width: window.innerWidth });
    }

    componentWillMount() {
        this.updateDimensions();
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
        window.addEventListener("mouseup", this.closeNavigationBar);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        window.removeEventListener("mouseup", this.closeNavigationBar);
    }

    toggleNavigationBar() {
        this.setState((state) => ({
            navigationBarOpen: !state.navigationBarOpen,
        }));
        this.forceUpdate();
    }

    /**
     * Is called upon a 'mouseup' event (only when the PhoneComponent is mounted).
     * Checks if the mouse is over the NavigationBar element and if so, it closes the
     * navigation bar. Otherwise, it does nothing.
     * @param e The MouseEvent, which has the properties that are necessary for checking
     *     whether the mouse is above the NavigationBar element.
     */
    closeNavigationBar(e: MouseEvent) {
        if (
            this.state.navigationBarOpen &&
            !e.composedPath().find(
                (eventTarget: EventTarget) =>
                    // @ts-ignore
                    eventTarget.id === "NavigationBar" ||
                    // @ts-ignore
                    eventTarget.id === "NavigationBarToggle",
            )
        ) {
            this.setState(() => ({ navigationBarOpen: false }));
        }
    }

    render() {
        const {
            headerTitle,
            content,
            sidebarContent,
            hasPaddingX,
            hasPaddingY,
        } = this.props;
        if (this.state.width >= 992) {
            return <div style={{ display: "none" }} />;
        }
        return (
            // A flexible wrapper column for the mobile content
            <div className="d-flex ContentWrapper d-lg-none flex-column">
                {/* The content header box diplaying the 'headerTitle' in the top of the screen */}
                <div
                    className="d-flex flex-row
                    justify-content-between
                    align-content-middle
                    p-0 bg-light border-bottom"
                >
                    <div
                        id="NavigationBarToggle"
                        className={`flex-shrink-0 p-3 pr-4 cursor-pointer`}
                        onClick={this.toggleNavigationBar}
                    >
                        <div
                            className={`navigation-bar-hamburger ${
                                this.state.navigationBarOpen
                                    ? " navigation-bar-hamburger-open"
                                    : ""
                            }`}
                        >
                            <FontAwesomeIcon icon={faBars} size="lg" />
                        </div>
                    </div>
                    <div>
                        <h5 className="mb-0 text-center py-3">{headerTitle}</h5>
                    </div>
                    <div
                        className="flex-shrink-0 p-3 pl-4 cursor-pointer"
                        onClick={
                            sidebarContent != null
                                ? () => this.openSidebar()
                                : () => null
                        }
                    >
                        {sidebarContent != null ? (
                            <span>
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    size="lg"
                                />
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* The main content box, displaying the elements from the 'content' argument or
                the center spinner if the content is Null. */}
                <div
                    className={`ContentMainSm flex-grow-1 ${
                        hasPaddingX ? "px-3" : ""
                    } ${hasPaddingY ? "py-3" : ""}`}
                >
                    {content !== null ? content : centerSpinner()}
                </div>

                {/* If sidebar content has been passed, render it in the SidebarPhone component,
                a component that is open and closable with a button in the top right. of the screen. */}
                {sidebarContent !== null && (
                    <SidebarPhone content={sidebarContent} />
                )}

                {/* Render the navigation bar with Phone Mode. What this means is that it is hidden until
                you click on the menu button in the top left of the screen. */}
                <NavigationBar
                    onPhone={true}
                    visibleOnPhone={this.state.navigationBarOpen}
                />
            </div>
        );
    }

    openSidebar() {
        const { history } = this.props;
        history.push({
            ...history.location,
            hash: "sidebar",
        });
    }
}

export default withRouter(
    connect(
        () => ({}),
        {},
    )(PhoneComponent),
);
