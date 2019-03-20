import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ApplicationState } from "../../../state/state";
import { connect } from "react-redux";
import { getCourseFull } from "../../../state/courses/selectors";
import { CourseDtoFull } from "../../../api/types";
import { courseRequestedAction } from "../../../state/courses/action";
import { buildContent } from "../../pagebuilder";
import CoursePermissions from "../../../api/permissions";
import {getCoursePermissions} from "../../../state/auth/selectors";
import { API_STUDENT_ROLE } from "../../../state/courses/constants";
import CourseTATeacherDashboard from "./CourseTATeacherDashboard";
import CourseStudentDashboard from "./CourseStudentDashboard";

interface CourseDashboardProps {
    courseFull: (id: number) => CourseDtoFull | null;
    coursePermissions: CoursePermissions | null;

    requestCourse: (id: number) => {
        type: string,
    };
}

class CourseDashboard extends Component<CourseDashboardProps & RouteComponentProps<any>> {

    componentDidMount() {
        this.props.requestCourse(Number(this.props.match.params.cid));
    }

    render() {
        const course = this.props.courseFull(Number(this.props.match.params.cid));
        if (course == null) {
            return buildContent("Loading...", null);
        } else if (course.role.name === API_STUDENT_ROLE) {
            return <CourseStudentDashboard course={course} />;
        } else {
            return <CourseTATeacherDashboard course={course} />;
        }
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    courseFull: (id: number) => getCourseFull(state, id),
    coursePermissions: getCoursePermissions(state),
}), {
        requestCourse: (id: number) => courseRequestedAction(id),
    })(CourseDashboard));
