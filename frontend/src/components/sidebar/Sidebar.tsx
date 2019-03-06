import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const SIDEBAR_APPEAR_THRESHOLD_WIDTH = 1100;

interface SidebarProps {
    openOnMobile: boolean;
}
interface SidebarState {
    windowWidth: number;
    sidebarOpen: boolean;
}
export default class Sidebar extends Component<SidebarProps, SidebarState> {
    static defaultProps = {
        openOnMobile: false,
    };
    constructor(props: SidebarProps) {
        super(props);
        this.state = {
            windowWidth: window.innerWidth,
            sidebarOpen: this.props.openOnMobile,
        };
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }
    close() {
        this.setState((_) => ({ sidebarOpen: false }));
    }
    render() {

        const sidebarToggleButton =
            <div className="position-fixed p-3 cursor-pointer"
                style={{ top: 0, right: 0 }}
                onClick={() => this.setState((state) => ({ sidebarOpen: !state.sidebarOpen }))}>
                <span><FontAwesomeIcon icon={this.state.sidebarOpen ? faTimes : faBars} size="2x" /></span>
            </div>;

        if (this.state.windowWidth > SIDEBAR_APPEAR_THRESHOLD_WIDTH) {
            return (
                <div className="dashboard-sidebar bg-light px-3 border-left dashboard-sidebar-desktop">
                    {this.props.children}
                </div>
            );
        } else if (this.state.sidebarOpen) {
            return (
                <div className="dashboard-sidebar bg-light px-3 border-left dashboard-sidebar-mobile">
                    {sidebarToggleButton}
                    {this.props.children}
                </div>
            );
        } else {
            return sidebarToggleButton;
        }
    }

    private handleResize = () => {
        this.setState((state) => ({
            windowWidth: window.innerWidth,
            sidebarOpen: state.sidebarOpen && window.innerWidth < SIDEBAR_APPEAR_THRESHOLD_WIDTH,
        }));
    }
}
