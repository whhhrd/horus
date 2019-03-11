import React, { Component } from "react";
import { CourseDtoBrief } from "../../../state/types";
import {
    COURSE_LIST_STUDENT,
    COURSE_LIST_TEACHER,
    COURSE_LIST_TA,
    COURSE_LIST_ANY,
} from "../../../state/course-selection/constants";
import { Row, Col } from "reactstrap";
import CanvasCard from "../../CanvasCard";
import { faBook } from "@fortawesome/free-solid-svg-icons";
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
            return null;
        }
        return (
            <Row>
                <Col>
                    {this.props.mode !== COURSE_LIST_ANY &&
                        <h5 className="d-block w-100 text-center text-lg-left">
                            {this.header()}
                        </h5>
                    }
                    <Row className="px-2 d-flex justify-content-center justify-content-lg-start">
                        {this.content()}
                    </Row>
                </Col>
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
                return "Courses where you are a teaching assistant";
            default:
                return "";
        }
    }
    private content = () => {
        return Array.from(this.props.courses!, (course: CourseDtoBrief) => {
            return (
                <CanvasCard watermarkIcon={faBook}
                    cardTitle={course.name}
                    key={course.id}
                    url={`/courses/${course.id}`} />
            );
        });
    }
}
