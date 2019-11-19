import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Action } from "redux";

import { CourseDtoSummary } from "../../../api/types";
import { ApplicationState } from "../../../state/state";
import { getCourses } from "../../../state/courses/selectors";
import {
    coursesRequestedAction,
    CoursesRequestedAction,
} from "../../../state/courses/action";
import {
    COURSE_LIST_TA,
    API_STUDENT_ROLE,
    COURSE_LIST_ANY,
    COURSE_LIST_TEACHER,
    API_TA_ROLE,
    API_TEACHER_ROLE,
    COURSE_LIST_STUDENT,
} from "../../../state/courses/constants";
import { authoritiesUpdateRequestAction } from "../../../state/auth/actions";

import CourseList from "./CourseList";
import { buildContent } from "../../pagebuilder";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

interface CourseSelectionProps {
    courses: CourseDtoSummary[] | null;
    requestCourses: (includeHidden: boolean) => CoursesRequestedAction;
    requestPermissions: () => Action<string>;
}

/**
 * A page where the user can select the course.
 * Courses to which the user is linked are displayed.
 */
class CourseSelection extends Component<CourseSelectionProps> {
    componentDidMount() {
        this.props.requestCourses(false);
        this.props.requestPermissions();
    }

    buildContent() {
        const { courses } = this.props;
        if (courses == null) {
            return null;
        }

        const roles = courses.map(
            (course: CourseDtoSummary) => course.role.name,
        );

        const isStudentOnly = roles.every((r) => r === API_STUDENT_ROLE);

        return (
            <Fragment>
                {isStudentOnly && (
                    <CourseList
                        key={COURSE_LIST_ANY}
                        mode={COURSE_LIST_ANY}
                        courses={courses}
                    />
                )}
                {!isStudentOnly && (
                    <Fragment>
                        <CourseList
                            mode={COURSE_LIST_TEACHER}
                            key={COURSE_LIST_TEACHER}
                            courses={courses.filter(
                                (course: CourseDtoSummary) =>
                                    course.role.name === API_TEACHER_ROLE,
                            )}
                        />
                        <CourseList
                            mode={COURSE_LIST_TA}
                            key={COURSE_LIST_TA}
                            courses={courses.filter(
                                (course: CourseDtoSummary) =>
                                    course.role.name === API_TA_ROLE,
                            )}
                        />
                        <CourseList
                            mode={COURSE_LIST_STUDENT}
                            key={COURSE_LIST_STUDENT}
                            courses={courses.filter(
                                (course: CourseDtoSummary) =>
                                    course.role.name === API_STUDENT_ROLE,
                            )}
                        />
                    </Fragment>
                )}
                <Link to={`/courses/options`}>
                    <FontAwesomeIcon
                        icon={faCog}
                        className="mr-"
                        size="sm"
                        style={{ width: "30px" }}
                    />
                    Course visibility options
                </Link>
            </Fragment>
        );
    }

    render() {
        return buildContent("Courses", this.buildContent());
    }
}

export default connect(
    (state: ApplicationState) => ({
        courses: getCourses(state),
    }),
    {
        requestCourses: (includeHidden: boolean) =>
            coursesRequestedAction(includeHidden),
        requestPermissions: authoritiesUpdateRequestAction,
    },
)(CourseSelection);
