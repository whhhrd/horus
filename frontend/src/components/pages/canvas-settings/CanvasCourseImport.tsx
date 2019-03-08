import React, { Component } from "react";
import { connect } from "react-redux";
import { importCanvasCourseAction, checkTokenAndRedirectTokenAction } from "../../../state/canvas-settings/actions";
import { ApplicationState } from "../../../state/state";
import { getCanvasCourses, isImporting } from "../../../state/canvas-settings/selectors";
import { CanvasCourseDto } from "../../../state/types";
import Container from "reactstrap/lib/Container";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Spinner from "reactstrap/lib/Spinner";
import { Formik, Field } from "formik";
import Form from "reactstrap/lib/Form";
import ButtonGroup from "reactstrap/lib/ButtonGroup";
import Button from "reactstrap/lib/Button";
import FormGroup from "reactstrap/lib/FormGroup";

interface CanvasCourseImportProps {
    courses: CanvasCourseDto[] | null;

    isImporting: (id: number) => boolean;

    importCourse: (id: number) => {
        type: string,
    };

    checkToken: () => {
        type: string,
    };
}
interface CanvasCourseValue {
    courseId: number;
}

class CanvasCourseImport extends Component<CanvasCourseImportProps> {
    componentDidMount() {
        this.props.checkToken();
    }
    render() {
        return (
            <div style={{ display: "flex" }}>
                <Container fluid={true} style={{ flex: "auto" }}>
                    <Row className="main-body-breadcrumbs px-2 pt-3">
                        <Col md="12">
                            Canvas Course Import {this.props.courses === undefined && <Spinner
                                color="primary" type="grow" />}
                            <hr />
                        </Col>
                    </Row>
                    <Row className="main-body-display px-2">
                        <Col style={{ padding: 0 }}>
                            {this.buildContent()}
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    private onSubmit = (course: CanvasCourseValue) => {
        this.props.importCourse(course.courseId);
    }
    private buildContent = () => {
        if (this.props.courses === null) {
            return null;
        } else if (this.props.courses.length === 0) {
            return <h4>You do not have any courses on Canvas that you can import</h4>;
        } else {
            return (
                <Formik
                    initialValues={{ courseId: this.props.courses![0].canvasId }}
                    onSubmit={this.onSubmit}
                >
                    {({ handleSubmit }) => (
                        <Form style={{
                            width: "50%",
                            marginLeft: "auto",
                            marginRight: "auto",
                            padding: "1rem",

                        }}>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Field className="custom-select"
                                            component="select"
                                            name="courseId"
                                            id="courseId"
                                            style={{ marginBottom: "1rem" }}>
                                            {this.props.courses!.filter((course: CanvasCourseDto) =>
                                                !this.props.isImporting(course.canvasId)).map(
                                                    (course: CanvasCourseDto) =>
                                                        <option
                                                            value={course.canvasId}
                                                            key={course.canvasId}>{course.name}
                                                        </option>,
                                                )}
                                        </Field>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ButtonGroup>
                                        <Button
                                            onClick={() => { handleSubmit(); }}
                                        >
                                            Submit
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Formik>
            );
        }
    }
}
export default connect((state: ApplicationState) => ({
    courses: getCanvasCourses(state),
    isImporting: (id: number) => isImporting(state, id),
}), {
        importCourse: importCanvasCourseAction,
        checkToken: checkTokenAndRedirectTokenAction,
    })(CanvasCourseImport);
