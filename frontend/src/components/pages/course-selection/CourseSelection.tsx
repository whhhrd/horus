import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../../state/state';
import { getCourses } from '../../../state/course-selection/selectors';
import { coursesRequestedAction, } from '../../../state/course-selection/action';
import Spinner from 'reactstrap/lib/Spinner';
import { CourseDtoSummary } from '../../../state/types';
import CourseList from './CourseList';
import { COURSE_LIST_TA, API_STUDENT_ROLE, COURSE_LIST_ANY, COURSE_LIST_TEACHER, API_TA_ROLE, API_TEACHER_ROLE, COURSE_LIST_STUDENT } from '../../../state/course-selection/constants';
import Container from 'reactstrap/lib/Container';

interface CourseSelectionProps {
    courses?: CourseDtoSummary[],
    requestCourses: () => {
        type: String
    }
}
interface CourseSelectionState {
    errorVisible: boolean,
}

class CourseSelection extends Component<CourseSelectionProps, CourseSelectionState> {
    public componentDidMount() {
        this.props.requestCourses();
    }
    public render() {
        if (this.props.courses == null) {
            return <Spinner color="success" size=""></Spinner>
        }
        if (this.props.courses.every((course: CourseDtoSummary) => course.role.name === API_STUDENT_ROLE)) {
            return (
                <Container>
                    <CourseList mode={COURSE_LIST_ANY} courses={this.props.courses} />
                </Container>
            );
        }
        return (
            <Container>
                <CourseList mode={COURSE_LIST_TEACHER} courses={this.props.courses.filter((course: CourseDtoSummary) => course.role.name === API_TEACHER_ROLE)} />
                <CourseList mode={COURSE_LIST_TA} courses={this.props.courses.filter((course: CourseDtoSummary) => course.role.name === API_TA_ROLE)} />
                <CourseList mode={COURSE_LIST_STUDENT} courses={this.props.courses.filter((course: CourseDtoSummary) => course.role.name === API_STUDENT_ROLE)} />
            </Container>
        );
    }
}

export default connect((state: ApplicationState) => ({
    courses: getCourses(state),
}), {
        requestCourses: coursesRequestedAction,
    })(CourseSelection);