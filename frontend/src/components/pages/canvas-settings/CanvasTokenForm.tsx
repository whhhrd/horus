import React, { Component } from "react";
import { Formik, Field } from "formik";
import { connect } from "react-redux";
import {
    tokenSubmitAction,
    checkTokenAndRedirectImportAction,
} from "../../../state/canvas-settings/actions";
import { buildContent, setPageTitle } from "../../pagebuilder";
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

interface CanvasTokenFormProps {
    submitToken: (
        token: string,
    ) => {
        type: string;
    };

    checkTokenAndRedirect: () => {
        type: string;
    };
}

interface CanvasTokenFormState {
    submitted: boolean;
}

interface CanvasTokenValues {
    token: string;
}

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
                            {({ handleSubmit }) => (
                                <Form className="mt-2">
                                    <FormGroup>
                                        <Label>Token</Label>
                                        <Input
                                            tag={Field}
                                            id="token"
                                            name="token"
                                        />
                                    </FormGroup>
                                    <Button
                                        color="primary"
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
