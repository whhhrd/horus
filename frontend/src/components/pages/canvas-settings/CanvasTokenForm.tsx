import React, { Component } from "react";
import { Action } from "redux";
import { connect } from "react-redux";

import {
    Form,
    Spinner,
    FormGroup,
    Label,
    Input,
    Button,
    Row,
    Col,
} from "reactstrap";

import {
    tokenSubmitAction,
    checkTokenAndRedirectImportAction,
    TokenSubmittedAction,
} from "../../../state/canvas-settings/actions";

import { buildContent, setPageTitle } from "../../pagebuilder";
import { Formik, Field } from "formik";

interface CanvasTokenFormProps {
    submitToken: (token: string) => TokenSubmittedAction;
    checkTokenAndRedirect: () => Action;
}

interface CanvasTokenFormState {
    submitted: boolean;
}

interface CanvasTokenValues {
    token: string;
}

/**
 * A simple page where a user can submit their Canvas token.
 * When the submitted token is valid, the page will redirect
 * the user to CanvasCourseImport.
 */
class CanvasTokenForm extends Component<
    CanvasTokenFormProps,
    CanvasTokenFormState
> {
    constructor(props: CanvasTokenFormProps) {
        super(props);
        this.state = {
            submitted: false,
        };
    }

    componentWillMount() {
        this.props.checkTokenAndRedirect();
        setPageTitle("Canvas Token Import");
    }

    render() {
        return buildContent("Canvas Token Import", this.buildContent());
    }

    isValid(values: CanvasTokenValues) {
        return values.token.trim().length > 0;
    }

    private onSubmit = (token: CanvasTokenValues) => {
        this.props.submitToken(token.token);
        this.setState({ submitted: true });
    }

    private buildContent = () => {
        if (this.state.submitted) {
            return <Spinner color="primary" type="grow" />;
        } else {
            return (
                <Row>
                    <Col xs="12" md="6" className="mx-auto">
                        <h3>Token import</h3>
                        In order to import a token, you should visit{" "}
                        <a
                            href="https://canvas.utwente.nl/profile/settings"
                            target="_blank"
                        >
                            the canvas settings page
                        </a>
                        , generate a token and copy the generated token in the
                        box below.
                        <Formik
                            initialValues={{ token: "" }}
                            onSubmit={this.onSubmit}
                        >
                            {({ handleSubmit, values }) => (
                                <Form className="mt-2">
                                    <FormGroup>
                                        <Label>Token</Label>
                                        <Input
                                            tag={Field}
                                            valid={this.isValid(values)}
                                            id="token"
                                            name="token"
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey
                                                ) {
                                                    event.preventDefault();
                                                    if (this.isValid(values)) {
                                                        handleSubmit();
                                                    }
                                                }
                                            }}
                                        />
                                    </FormGroup>
                                    <Button
                                        color="primary"
                                        disabled={!this.isValid(values)}
                                        onClick={() => handleSubmit()}
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
    () => ({}),
    {
        submitToken: tokenSubmitAction,
        checkTokenAndRedirect: checkTokenAndRedirectImportAction,
    },
)(CanvasTokenForm);
