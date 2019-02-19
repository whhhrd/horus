import React, { Component } from 'react';
import { connect} from 'react-redux';
import { CourseDtoBrief } from '../../../state/types';
import {
    COURSE_LIST_STUDENT,
    COURSE_LIST_TEACHER,
    COURSE_LIST_TA,
    COURSE_LIST_ANY,
} from '../../../state/course-selection/constants' ;
import {Row, Card} from 'reactstrap';
import CardTitle from 'reactstrap/lib/CardTitle';
import {push} from 'connected-react-router';
import CardBody from 'reactstrap/lib/CardBody';
import CardHeader from 'reactstrap/lib/CardHeader';
interface CourseListProps {
    courses: CourseDtoBrief[];
    mode: string;
    selectCourse: (id: number) => {
        type: string,
    };
}
interface CourseListState {
    loading: boolean;
}

class CourseList extends Component<CourseListProps, CourseListState> {

    static palette: string[] = [
        "#D32F2F", "#C2185B", "#7B1FA2", "#512DA8", "#303F9F",
        "#1976D2", "#0097A7", "#00796B", "#388E3C", "#AFB42B",
        "#FBC02D", "#FFA000", "#F57C00", "#E64A19",
    ];

    render() {
        if (this.props.courses.length === 0) {
            return <Row />;
        }
        return (
        <Row>
            <div style={{maxWidth: "100%"}}>
                { this.props.mode !== COURSE_LIST_ANY &&
                    <div>
                        <h5 className="course-role-heading">
                            {this.header()}
                        </h5>
                    </div>
                }
                <div style={{display: "flex", flexWrap: "wrap"}}>
                    {this.content()}
                </div>
            </div>
        </Row>
        );
    }

    private header = () => {
        switch (this.props.mode) {
            case COURSE_LIST_STUDENT:
            return "Courses where you are a student";
            case COURSE_LIST_TEACHER:
            return "Courses where you are a teacher";
            case COURSE_LIST_TA:
            return "Courses where you are a teaching assitant";
            default:
            return "";
        }
    }
    private randomColor = (courseName: string) => {
        let hash = 0;
        const len = courseName.length;
        for (let i = 0; i < len; i++) {
          hash  = ((hash << 5) - hash) + courseName.charCodeAt(i);
          hash |= 0;
        }
        return CourseList.palette[Math.abs(hash) % CourseList.palette.length];
    }
    private content = () => {
        return Array.from(this.props.courses!, (course: CourseDtoBrief) => {
            return(
                <Card className="card-clickable" key={course.id} onClick={() => this.props.selectCourse(course.id)}>
                    <CardHeader
                        className="card-header-colored"
                        style={{backgroundColor: this.randomColor(course.name)}}>
                    </CardHeader>
                    <CardBody>
                        <CardTitle>
                                {course.name}
                        </CardTitle>
                    </CardBody>
                </Card>
            );
        });
    }

}
export default connect( () => ({}), {
    selectCourse: (id: number) => push(`/courses/${id}`),
})(CourseList);
