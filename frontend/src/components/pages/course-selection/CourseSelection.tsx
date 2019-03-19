import React, { Component } from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import { getCourses } from "../../../state/courses/selectors";
import { coursesRequestedAction } from "../../../state/courses/action";
import { CourseDtoSummary } from "../../../api/types";
import CourseList from "./CourseList";
import {
    COURSE_LIST_TA,
    API_STUDENT_ROLE,
    COURSE_LIST_ANY,
    COURSE_LIST_TEACHER,
    API_TA_ROLE,
    API_TEACHER_ROLE,
    COURSE_LIST_STUDENT,
} from "../../../state/courses/constants";
import { buildContent } from "../../pagebuilder";

interface CourseSelectionProps {
    courses: CourseDtoSummary[] | null;
    requestCourses: () => {
        type: string,
    };
}

class CourseSelection extends Component<CourseSelectionProps> {

    componentDidMount() {
        this.props.requestCourses();
    }

    buildContent() {
        if (this.props.courses == null) {
            return null;
        }

        const roles = this.props.courses.map((course: CourseDtoSummary) => course.role.name);

        if (roles.every((r) => r === API_STUDENT_ROLE)) {
            return <CourseList key={COURSE_LIST_ANY} mode={COURSE_LIST_ANY} courses={this.props.courses} />;

        } else {
            return (
                <div><CourseList
                    mode={COURSE_LIST_TEACHER}
                    key={COURSE_LIST_TEACHER}
                    courses={this.props.courses.filter(
                        (course: CourseDtoSummary) => course.role.name === API_TEACHER_ROLE)
                    } />
                    <CourseList
                        mode={COURSE_LIST_TA}
                        key={COURSE_LIST_TA}
                        courses={this.props.courses.filter(
                            (course: CourseDtoSummary) => course.role.name === API_TA_ROLE)
                        } />
                    <CourseList
                        mode={COURSE_LIST_STUDENT}
                        key={COURSE_LIST_STUDENT}
                        courses={this.props.courses.filter(
                            (course: CourseDtoSummary) => course.role.name === API_STUDENT_ROLE)
                        } />
                </div>
            );
        }
    }

    render() {
        return buildContent("Courses", this.buildContent());
    }
}

export default connect((state: ApplicationState) => ({
    courses: getCourses(state),
}), {
        requestCourses: coursesRequestedAction,
    })(CourseSelection);
