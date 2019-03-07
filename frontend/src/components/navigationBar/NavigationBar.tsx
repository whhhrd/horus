import React, {Component} from "react";

import logoWhite from "../../images/university_of_twente_logo_black.png";
import {Link, match} from "react-router-dom";
import ListGroup from "reactstrap/lib/ListGroup";
import { faTachometerAlt, faTasks, faBook, faSignOutAlt, faTools } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { NavigationBarItem } from "./NavigationBarItem";
import { ActiveTabEnum } from "../../state/navigationBar/types";
import CoursePermissions from "../../api/permissions";
import { ApplicationState } from "../../state/state";
import { getActiveTab, getMatch } from "../../state/navigationBar/selectors";
import { getCoursePermissions } from "../../state/auth/selectors";
import { courseAdmin } from "../../state/auth/constants";

interface NavigationBarProps {
    // userPermissions: boolean | null; // TODO
    activeTab: ActiveTabEnum | null;
    computedMatch: match<any> | null;
    coursePermissions: CoursePermissions | null;
}

export class NavigationBar extends Component<NavigationBarProps> {

    buildContent() {
        const { activeTab, computedMatch } = this.props;

        if (computedMatch == null) {
            return null;
        }

        const courseId = Number(computedMatch.params.cid);
        const inCourse: boolean = courseId != null;
        const permissions = this.props.coursePermissions!;

        const hasAdmin = courseAdmin.check(courseId, permissions);

        return (
            <div className="NavigationBar bg-light border-right">
                <div className="d-flex align-items-start flex-column h-100">
                    <div>
                        <Link className="NavigationBarLogo py-3"
                            to={inCourse ? `/courses/${computedMatch.params.cid}` : "/courses"}>
                            <img src={logoWhite} />
                        </Link>
                    </div>
                    <div className="mb-auto w-100">
                        <ListGroup flush className="border-top">
                            {
                                inCourse ?
                                    <NavigationBarItem title="Dashboard" icon={faTachometerAlt}
                                        active={activeTab === ActiveTabEnum.DASHBOARD}
                                        url={`/courses/${computedMatch.params.cid}`} />
                                    : undefined
                            }
                            {
                                inCourse ?
                                    <NavigationBarItem title="Sign-off" icon={faTasks}
                                        active={activeTab === ActiveTabEnum.SIGNOFF}
                                        url={`/courses/${computedMatch.params.cid}/signoff`} />
                                    : undefined
                            }
                            { (!inCourse || hasAdmin) &&
                                <NavigationBarItem title="Admin" icon={faTools}
                                    active={activeTab === ActiveTabEnum.ADMINISTRATION}
                                    url={inCourse ?
                                        `/courses/${computedMatch.params.cid}/administration` : "/administration"} />
                            }
                        </ListGroup>
                    </div>
                    <div className="w-100">
                        <ListGroup flush className="border-top">
                            <NavigationBarItem title="Courses" icon={faBook}
                                               active={activeTab === ActiveTabEnum.COURSES} url="/courses"/>
                            <NavigationBarItem title="Logout" icon={faSignOutAlt} active={false} url="/login"/>
                        </ListGroup>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.buildContent();
    }
}

export default connect((state: ApplicationState) => ({
    activeTab: getActiveTab(state),
    computedMatch: getMatch(state),
    coursePermissions: getCoursePermissions(state),
}), {
    })(NavigationBar);
