import React, { Component } from 'react';
import { connect} from 'react-redux';
import {Container} from 'reactstrap';
import { CourseDtoBrief } from '../../../state/types';
import { COURSE_LIST_STUDENT, COURSE_LIST_TEACHER, COURSE_LIST_TA } from '../../../state/course-selection/constants' ;
import {Row, Card} from 'reactstrap';
import CardTitle from 'reactstrap/lib/CardTitle';
import CardImg from 'reactstrap/lib/CardImg';
import {push} from 'connected-react-router';
interface CourseListProps {
    courses: CourseDtoBrief[],
    mode: String;
    selectCourse: (id: number) => {
        type: String
    }
}
interface CourseListState {
    error?: Error,
    loading: boolean
}

class CourseList extends Component<CourseListProps, CourseListState> {
    private header = () => {
        switch(this.props.mode) {
            case COURSE_LIST_STUDENT:
            return "Courses where you are a student";
            case COURSE_LIST_TEACHER:
            return "Courses where you are a teacher";
            case COURSE_LIST_TA:
            return "Courses where you are a teaching assitant";
            default:
            return "Courses:";
        }
    }
    private randomColor = (courseName: String) => {
        var hash = 0, len = courseName.length;
        for (var i = 0; i < len; i++) {
          hash  = ((hash << 5) - hash) + courseName.charCodeAt(i);
          hash |= 0;
        }
        return hash % 360;
    }
    private content = () => {
        return Array.from(this.props.courses!, (course: CourseDtoBrief) => {
            return(
                <Card body className="course-selection-card" key={course.id} onClick={() => this.props.selectCourse(course.id)}>
                    <CardImg style={{backgroundColor: "hsl(" + this.randomColor(course.name) +", 90%, 50%)", border: "0px"}} height="100%" width="100%"></CardImg>
                    <CardTitle>
                        {course.name}
                    </CardTitle>
                </Card>
            );
        }
        );
    }
    public render() {
        console.log(this.props.courses);
        if (this.props.courses.length === 0) {
            return null;
        }
        return (
        <Container className="CourseList">
        <h3>
            {this.header()}
        </h3>
        <Row>
            {this.content()}
        </Row>
        </Container>
        )
    }
}
export default connect( () => ({}), {
    selectCourse: (id: number) => push("courses/"+id),
})(CourseList);