import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { ApplicationState } from "../../../state/state";
import { getCourseFull } from "../../../state/courses/selectors";
import { CourseDtoFull } from "../../../api/types";
import {
    courseRequestedAction,
    CourseRequestedAction,
} from "../../../state/courses/action";
import CoursePermissions from "../../../api/permissions";
import { getCoursePermissions } from "../../../state/auth/selectors";
import { API_STUDENT_ROLE } from "../../../state/courses/constants";

import CourseTATeacherDashboard from "./CourseTATeacherDashboard";
import CourseStudentDashboard from "./CourseStudentDashboard";
import { buildContent } from "../../pagebuilder";

interface CourseDashboardProps {
    coursePermissions: CoursePermissions | null;
    courseFull: (id: number) => CourseDtoFull | null;

    requestCourse: (id: number) => CourseRequestedAction;
}

/**
 * A component that redirects the user based on their
 * role within the course. Teaching staff will be redirected
 * to the CourseTATeacherDashboard, whereas students will be
 * redirected to CourseStudentDashboard.
 */
class CourseDashboard extends Component<
    CourseDashboardProps & RouteComponentProps<any>
> {
    componentDidMount() {
        this.props.requestCourse(Number(this.props.match.params.cid));
    }

    render() {
        const course = this.props.courseFull(
            Number(this.props.match.params.cid),
        );
        if (course == null) {
            return buildContent("Loading...", null);
        } else if (course.role.name === API_STUDENT_ROLE) {
            return <CourseStudentDashboard course={course} />;
        } else {
            return <CourseTATeacherDashboard course={course} />;
        }
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            courseFull: (id: number) => getCourseFull(state, id),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            requestCourse: courseRequestedAction,
        },
    )(CourseDashboard),
);
