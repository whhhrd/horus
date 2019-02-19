import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../../state/state';
import { getCourses } from '../../../state/course-selection/selectors';
import { coursesRequestedAction, } from '../../../state/course-selection/action';
import Spinner from 'reactstrap/lib/Spinner';
import { CourseDtoSummary } from '../../../state/types';
import CourseList from './CourseList';
import {
    COURSE_LIST_TA,
    API_STUDENT_ROLE,
    COURSE_LIST_ANY,
    COURSE_LIST_TEACHER,
    API_TA_ROLE,
    API_TEACHER_ROLE,
    COURSE_LIST_STUDENT,
} from '../../../state/course-selection/constants';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';

interface CourseSelectionProps {
    courses?: CourseDtoSummary[];
    requestCourses: () => {
        type: string,
    };
}
interface CourseSelectionState {}

class CourseSelection extends Component<CourseSelectionProps, CourseSelectionState> {

    componentDidMount() {
        this.props.requestCourses();
    }

    buildContent = () => {
        if (this.props.courses == null) {
            return <div />;
        }
        let lists = [];
        const roles = this.props.courses.map((course: CourseDtoSummary) => course.role.name);

        if (roles.every((r) => r === API_STUDENT_ROLE)) {
            lists = [
                <CourseList key={COURSE_LIST_ANY} mode={COURSE_LIST_ANY} courses={this.props.courses} />,
            ];
        } else {
            lists = [
                    (<CourseList
                        mode={COURSE_LIST_TEACHER}
                        key={COURSE_LIST_TEACHER}
                        courses={this.props.courses.filter(
                            (course: CourseDtoSummary) => course.role.name === API_TEACHER_ROLE)
                        } />),
                    (<CourseList
                        mode={COURSE_LIST_TA}
                        key={COURSE_LIST_TA}
                        courses={this.props.courses.filter(
                            (course: CourseDtoSummary) => course.role.name === API_TA_ROLE)
                        } />),
                    (<CourseList
                        mode={COURSE_LIST_STUDENT}
                        key={COURSE_LIST_STUDENT}
                        courses={this.props.courses.filter(
                            (course: CourseDtoSummary) => course.role.name === API_STUDENT_ROLE)
                        } />),
                ];
        }

        return lists;
    }

    render() {
        return (
            <Container fluid={true}>
                <Row className="main-body-breadcrumbs px-2 pt-3">
                    <Col md="12">
                        <h3>Courses
                        { this.props.courses == null &&
                            <Spinner color="primary" type="grow"></Spinner>
                        }
                        </h3>
                        <hr />
                    </Col>
                </Row>
                <Row className="main-body-display px-2">
                    <Col>
                    {this.buildContent()}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect((state: ApplicationState) => ({
    courses: getCourses(state),
}), {
        requestCourses: coursesRequestedAction,
    })(CourseSelection);
