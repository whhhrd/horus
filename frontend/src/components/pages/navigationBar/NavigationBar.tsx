import React, { Component } from "react";

import logoWhite from "../../../images/university_of_twente_logo_black.png";
import { Link, match } from "react-router-dom";
import ListGroup from "reactstrap/lib/ListGroup";
import { faTachometerAlt, faTasks, faBook, faSignOutAlt, faTools } from '@fortawesome/free-solid-svg-icons'
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import { ActiveTabEnum } from "../../../state/navigationBar/types";
import { getActiveTab, getMatch } from "../../../state/navigationBar/selectors";
import { NavigationBarItem } from "./NavigationBarItem";

interface NavigationBarProps {
    //userPermissions: boolean | null; // TODO
    activeTab: ActiveTabEnum | null;
    match: match<any> | null;
}

interface NavigationBarState { }

export class NavigationBar extends Component<NavigationBarProps, NavigationBarState> {

    buildContent() {
        const { activeTab, match } = this.props;

        if (match == null) {
            return null;
        }

        console.log("build", activeTab, match);

        const inCourse: boolean = match.params.cid != null;

        return (
            <div className="NavigationBar border-right">
                <div className="d-flex align-items-start flex-column h-100">
                    <div>

                        <Link className="NavigationBarLogo py-3"
                            to={inCourse ? `/courses/${match.params.cid}` : "/courses"}><img src={logoWhite} /></Link>
                    </div>
                    <div className="mb-auto w-100">
                        <ListGroup flush className="border-top">
                            {
                                inCourse ?
                                    <NavigationBarItem title="Dashboard" icon={faTachometerAlt}
                                        active={activeTab === ActiveTabEnum.DASHBOARD} url={`/courses/${match.params.cid}`} />
                                    : undefined
                            }
                            {
                                inCourse ?
                                    <NavigationBarItem title="Sign-off lists" icon={faTasks}
                                        active={activeTab === ActiveTabEnum.SIGNOFF} url={`/courses/${match.params.cid}/signoffs`} />
                                    : undefined
                            }
                            {
                                <NavigationBarItem title="Admin" icon={faTools}
                                    active={activeTab === ActiveTabEnum.ADMINISTRATION}
                                    url={inCourse ? `/courses/${match.params.cid}/administration` : "/administration"} />
                            }
                        </ListGroup>
                    </div>
                    <div className="w-100">
                        <ListGroup flush className="border-top">
                            <NavigationBarItem title="Courses" icon={faBook}
                                active={activeTab === ActiveTabEnum.COURSES} url="/courses" />
                            <NavigationBarItem title="Logout" icon={faSignOutAlt} active={false} url="/login" />
                        </ListGroup>
                    </div>
                </div>
            </div >
        );
    }

    render() {
        return this.buildContent();
    }
}

export default connect((state: ApplicationState) => ({
    activeTab: getActiveTab(state),
    match: getMatch(state),
    //userPermissions: getUserPermission(state),
}), {
    })(NavigationBar);