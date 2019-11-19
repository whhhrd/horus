import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Action } from "redux";

import { CourseDtoSummary, RoleDtoBrief, BooleanDto } from "../../../api/types";
import { ApplicationState } from "../../../state/state";
import { getCourses } from "../../../state/courses/selectors";
import {
    coursesRequestedAction,
    CoursesRequestedAction,
    courseHideCourseSetRequestedAction,
    CourseHideCourseSetRequestedAction,
} from "../../../state/courses/action";
import { authoritiesUpdateRequestAction } from "../../../state/auth/actions";

import { buildContent } from "../../pagebuilder";
import { Input, Row, Col, Table, Badge, Button } from "reactstrap";
import {
    API_TEACHER_ROLE,
    API_TA_ROLE,
    API_STUDENT_ROLE,
} from "../../../state/courses/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface CourseOptionsProps {
    courses: CourseDtoSummary[] | null;
    requestCourses: (includeHidden: boolean) => CoursesRequestedAction;
    requestCourseHideSet: (
        cid: number,
        newValue: BooleanDto,
    ) => CourseHideCourseSetRequestedAction;
    requestPermissions: () => Action<string>;
}

interface CourseOptionsState {
    searchQuery: string;
}

/**
 * A page where the user can (un)hide courses.
 * Courses to which the user is linked are displayed.
 */
class CourseOptions extends Component<CourseOptionsProps, CourseOptionsState> {
    constructor(props: CourseOptionsProps) {
        super(props);
        this.state = {
            searchQuery: "",
        };
    }

    componentDidMount() {
        this.props.requestCourses(true);
        this.props.requestPermissions();
    }

    buildContent() {
        const { courses } = this.props;

        if (courses == null) {
            return null;
        }

        return (
            <Row className="px-2 d-flex justify-content-center">
                <Col md="12" lg="6" className="pt-3">
                    <h4>Course options</h4>
                    {courses.length > 0 && (
                        <Fragment>
                            <Input
                                className="form-control-lg mb-3 mt-3"
                                placeholder="Course name..."
                                onInput={(e) => {
                                    // @ts-ignore
                                    this.onSearchQueryInput(e.target.value);
                                }}
                            />
                            <Table className="table-bordered mt-3">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Role</th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderCourseOptionsEntries(courses)}
                                </tbody>
                            </Table>
                        </Fragment>
                    )}
                    {courses.length === 0 && (
                        <span className="text-muted">
                            You are not participating in any course.
                        </span>
                    )}
                </Col>
            </Row>
        );
    }

    onSearchQueryInput(newValue: string) {
        this.setState(() => ({ searchQuery: newValue.toLowerCase() }));
    }

    applyFilter(courses: CourseDtoSummary[]) {
        const query = this.state.searchQuery;

        if (query === "") {
            return courses;
        } else {
            const result: CourseDtoSummary[] = [];
            courses.forEach((c) => {
                if (c.name.toLowerCase().includes(query)) {
                    result.push(c);
                }
            });
            return result;
        }
    }

    renderCourseOptionsEntries(courses: CourseDtoSummary[]) {
        const courseOptionList: JSX.Element[] = [];
        this.applyFilter(courses).forEach((c: CourseDtoSummary) =>
            courseOptionList.push(
                <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{this.renderRole(c.role)}</td>
                    <td>{this.renderOptions(c.id)}</td>
                </tr>,
            ),
        );

        return courseOptionList;
    }

    renderRole(role: RoleDtoBrief) {
        let color = null;
        switch (role.name) {
            case API_TEACHER_ROLE:
                color = "primary";
                break;
            case API_TA_ROLE:
                color = "success";
                break;
            case API_STUDENT_ROLE:
                color = "info";
                break;
            default:
                color = "danger";
        }

        return <Badge color={color}>{role.name}</Badge>; // TODO
    }

    renderOptions(cid: number) {
        const { courses } = this.props;
        const course =
            courses != null ? courses.find((c) => c.id === cid) : null;
        const hiddenCourse = course != null ? course.hidden : true;

        if (course != null) {
            return (
                <Fragment>
                    <Button
                        outline
                        color="primary"
                        size="sm"
                        title={`${
                            hiddenCourse ? "Unhide" : "Hide"
                        } course in course dashboard`}
                        onClick={() => this.props.requestCourseHideSet(cid, {value: !hiddenCourse})}
                    >
                        <FontAwesomeIcon
                            icon={hiddenCourse ? faEyeSlash : faEye}
                        />
                    </Button>
                </Fragment>
            );
        } else {
            return null;
        }
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
        requestCourseHideSet: (cid: number, newValue: BooleanDto) =>
            courseHideCourseSetRequestedAction(cid, newValue),
        requestPermissions: authoritiesUpdateRequestAction,
    },
)(CourseOptions);
