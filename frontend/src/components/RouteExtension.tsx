import { Route, RouteProps } from "react-router-dom";
import { connect } from "react-redux";
import { ActiveTabEnum } from "../state/navigationBar/types";
import {
    navigationBarSetTabAction,
    SetActiveNavigationTabAction,
} from "../state/navigationBar/actions";
import { SwitchProps } from "react-router";

interface RouteExtensionProps {
    setActiveTab: ActiveTabEnum;

    setActiveNavigationBarTabAction: (
        tab: ActiveTabEnum,
    ) => SetActiveNavigationTabAction;
}

/**
 * This is an extension on the Route component from the react-router-dom. It is used to
 * retrieve the 'match' from the router and store it in the global state for later use.
 * Furthermore, when using this RouteExtension, you have to supply a path (just as before),
 * but you also have to supply an ActiveTabEnum, which represents the tab/button in the navigation-
 * bar that should appear active on that path.
 */
class RouteExtension extends Route<
    RouteExtensionProps & RouteProps & SwitchProps
> {
    componentDidUpdate() {
        this.props.setActiveNavigationBarTabAction(this.props.setActiveTab);
    }
}

export default connect(
    () => ({}),
    {
        setActiveNavigationBarTabAction: navigationBarSetTabAction,
    },
)(RouteExtension);
