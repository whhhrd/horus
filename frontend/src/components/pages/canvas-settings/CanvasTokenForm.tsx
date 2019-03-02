import React, { Component } from 'react';
import { Container } from 'reactstrap';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Formik, Field, } from 'formik';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Label from 'reactstrap/lib/Label';
import Input from 'reactstrap/lib/Input';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import Button from 'reactstrap/lib/Button';
import { connect } from 'react-redux';
import { tokenSubmitAction, checkTokenAndRedirectImportAction, } from '../../../state/canvas-settings/actions';
import Spinner from 'reactstrap/lib/Spinner';

interface CanvasTokenFormProps {
    submitToken: (token: string) => {
        type: string;
    };
    checkTokenAndRedirect: () => {
        type: string;
    }
}

interface CanvasTokenFormState {
    submitted: boolean;
}

interface CanvasTokenValues {
    token: string;
}

class CanvasTokenForm extends Component<CanvasTokenFormProps, CanvasTokenFormState> {
    constructor(props: CanvasTokenFormProps) {
        super(props)
        this.state = {
            submitted: false
        }
    }
    public componentWillMount() {
        this.props.checkTokenAndRedirect()
    }
    private onSubmit = (token: CanvasTokenValues) => {
        this.setState({ submitted: true });
        this.props.submitToken(token.token);
    }
    private buildContent = () => {
        if (this.state.submitted) {
            return <Spinner color="primary" type="grow" />
        } else {
            return (
                <Formik
                    initialValues={{ token: '' }}
                    onSubmit={this.onSubmit}
                >
                    {({ handleSubmit }) => (
                        <Form
                            style={{
                                width: "50%",
                                marginLeft: "auto",
                                marginRight: "auto",
                                padding: "1rem"
                            }}>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Label>Token</Label>
                                        <Input
                                            tag={Field}
                                            id="token"
                                            name="token"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ButtonGroup>
                                        <Button
                                            onClick={() => { handleSubmit() }}
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
    public render() {
        return (
            <div style={{ display: "flex" }}>
                <Container fluid={true} style={{ flex: "auto" }}>
                    <Row className="main-body-breadcrumbs px-2 pt-3">
                        <Col md="12">
                            Canvas Token Import
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
}
export default connect(() => ({
}), {
        submitToken: tokenSubmitAction,
        checkTokenAndRedirect: checkTokenAndRedirectImportAction,
    })(CanvasTokenForm);