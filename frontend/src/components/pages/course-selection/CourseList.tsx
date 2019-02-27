import React, { Component } from 'react';
import { CourseDtoBrief } from '../../../state/types';
import {
    COURSE_LIST_STUDENT,
    COURSE_LIST_TEACHER,
    COURSE_LIST_TA,
    COURSE_LIST_ANY,
} from '../../../state/course-selection/constants' ;
import {Row} from 'reactstrap';
import CanvasCard from '../../CanvasCard';
interface CourseListProps {
    courses: CourseDtoBrief[];
    mode: string;
}
interface CourseListState {
    loading: boolean;
}

export default class CourseList extends Component<CourseListProps, CourseListState> {
    
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
    private content = () => {
        return Array.from(this.props.courses!, (course: CourseDtoBrief) => {
            return <CanvasCard cardTitle={course.name} key={course.id} url={`/courses/${course.id}`} />
        });
    }
}
