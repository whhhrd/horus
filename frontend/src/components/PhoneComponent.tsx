import React, { Component } from "react";
import { ApplicationState } from "../state/state";
import { isOpen } from "../state/sidebar/selectors";
import { connect } from "react-redux";
import { toggleSidebarPhoneAction } from "../state/sidebar/actions";
import { Action } from "redux";
import { centerSpinner } from "./pagebuilder";
import SidebarPhone from "./SidebarPhone";
import NavigationBar from "./navigationBar/NavigationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface PhoneComponentProps {
    headerTitle: string;
    content: JSX.Element | null;
    sidebarContent: JSX.Element | null;

    toggleSidebarPhone: () => Action;
}

interface PhoneComponentState {
    navigationBarOpen: boolean;
    width: number;
}

class PhoneComponent extends Component<PhoneComponentProps, PhoneComponentState> {

    constructor(props: PhoneComponentProps) {
        super(props);
        this.state = {
            navigationBarOpen: false,
            width: window.innerWidth,
        };
        this.toggleNavigationBar = this.toggleNavigationBar.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
    }

    updateDimensions() {
        this.setState({width: window.innerWidth});
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

    toggleNavigationBar() {
        this.setState((state) => ({ navigationBarOpen: !state.navigationBarOpen }));
        this.forceUpdate();
    }

    render() {
        const { headerTitle, content, sidebarContent } = this.props;
        if (this.state.width >= 992) {
            return <div style={{display: "none"}}/>;
        }
        return (
            // A flexible wrapper column for the mobile content
            <div className="d-flex ContentWrapper d-lg-none flex-column">

                {/* <div className="NavigationBarSmOpen cursor-pointer p-3 ml-2 bg-light">
                        <span onClick={this.toggleNavBar}><FontAwesomeIcon icon={faBars} size="lg" /></span>
                    </div>; */}

                {/* The content header box diplaying the 'headerTitle' in the top of the screen */}
                <div className="d-flex flex-row
                    justify-content-between
                    align-content-middle
                    p-3 bg-light border-bottom">
                    <div className="flex-shrink-0 mr-2 cursor-pointer"
                        onClick={this.toggleNavigationBar}>
                        <span><FontAwesomeIcon icon={faBars} size="lg" /></span>
                    </div>
                    <div>
                    <h5 className="mb-0 text-center">{headerTitle}</h5>
                    </div>
                    <div className="flex-shrink-0 ml-2 cursor-pointer"
                        onClick={this.props.toggleSidebarPhone}>
                        {sidebarContent != null ?
                            <span>
                                <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                            </span> : null
                        }
                    </div>
                </div>

                {/* The main content box, displaying the elements from the 'content' argument or
                the center spinner if the content is Null. */}
                <div className="ContentMainSm p-3 flex-grow-1">
                    {content !== null ? content : centerSpinner()}
                </div>

                {/* If sidebar content has been passed, render it in the SidebarPhone component,
                a component that is open and closable with a button in the top right. of the screen. */}
                {sidebarContent !== null &&
                    <SidebarPhone content={sidebarContent} />
                }

                {/* Render the navigation bar with Phone Mode. What this means is that it is hidden until
                you click on the menu button in the top left of the screen. */}
                <NavigationBar onPhone={true} visibleOnPhone={this.state.navigationBarOpen} />
            </div>
        );
    }
}

export default connect((state: ApplicationState) => ({
    isOpen: isOpen(state),
}), {
        toggleSidebarPhone: toggleSidebarPhoneAction,
    })(PhoneComponent);
