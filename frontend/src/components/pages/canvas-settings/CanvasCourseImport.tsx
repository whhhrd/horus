import React, { Component } from "react";
import { Action } from "redux";
import { connect } from "react-redux";

import { Row, Col, Form, FormGroup, Button, Alert } from "reactstrap";

import {
    importCanvasCourseAction,
    checkTokenAndRedirectTokenAction,
    CanvasImportAction,
} from "../../../state/canvas-settings/actions";
import { ApplicationState } from "../../../state/state";
import {
    getCanvasCourses,
    isImporting,
} from "../../../state/canvas-settings/selectors";
import { CanvasCourseDto } from "../../../api/types";

import { Formik, Field } from "formik";
import { buildContent, setPageTitle } from "../../pagebuilder";

interface CanvasCourseImportProps {
    courses: CanvasCourseDto[] | null;
    isImporting: (id: number) => boolean;

    importCourse: (id: number) => CanvasImportAction;
    checkToken: () => Action;
}

interface CanvasCourseValue {
    courseId: number;
}

/**
 * A simple page with a form for importing a Canvas course to which
 * the permitted users is linked as a certain kind of teaching staff.
 */
class CanvasCourseImport extends Component<CanvasCourseImportProps> {
    componentDidMount() {
        this.props.checkToken();
        setPageTitle("Canvas Course Import");
    }

    render() {
        return buildContent("Canvas Course Import", this.buildContent());
    }

    private onSubmit = (course: CanvasCourseValue) => {
        this.props.importCourse(course.courseId);
    }

    private buildContent = () => {
        if (this.props.courses == null) {
            return null;
        } else if (this.props.courses.length === 0) {
            return (
                <Row>
                    <Col xs="12" md="3">
                        <Alert color="warning">
                            You do not have any courses on Canvas that you can
                            import
                        </Alert>
                    </Col>
                </Row>
            );
        } else {
            return (
                <Row>
                    <Col xs="12" md="6" className="mx-auto">
                        <Formik
                            initialValues={{
                                courseId: this.props.courses[0].canvasId,
                            }}
                            onSubmit={this.onSubmit}
                        >
                            {({ handleSubmit }) => (
                                <Form>
                                    <FormGroup>
                                        <Field
                                            className="custom-select"
                                            component="select"
                                            name="courseId"
                                            id="courseId"
                                            style={{ marginBottom: "1rem" }}
                                        >
                                            {this.props
                                                .courses!.filter(
                                                    (course: CanvasCourseDto) =>
                                                        !this.props.isImporting(
                                                            course.canvasId,
                                                        ),
                                                )
                                                .map(
                                                    (
                                                        course: CanvasCourseDto,
                                                    ) => (
                                                        <option
                                                            value={
                                                                course.canvasId
                                                            }
                                                            key={
                                                                course.canvasId
                                                            }
                                                        >
                                                            {course.name}
                                                        </option>
                                                    ),
                                                )}
                                        </Field>
                                    </FormGroup>
                                    <Button
                                        block
                                        color="primary"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        Submit
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </Col>
                </Row>
            );
        }
    }
}

export default connect(
    (state: ApplicationState) => ({
        courses: getCanvasCourses(state),
        isImporting: (id: number) => isImporting(state, id),
    }),
    {
        importCourse: importCanvasCourseAction,
        checkToken: checkTokenAndRedirectTokenAction,
    },
)(CanvasCourseImport);
