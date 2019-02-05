import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Form, Button, Input, Label, FormGroup, ButtonGroup } from 'reactstrap'
import { Formik, Field, FieldProps } from 'formik';

import { LoginForm } from '../../../state/auth/types';
import { isLoggedIn } from '../../../state/auth/selectors';
import { ApplicationState } from '../../../state/state';
import { loginAction } from '../../../state/auth/actions';
import FormFeedback from 'reactstrap/lib/FormFeedback';

export interface LoginProps {
    logIn: (form: LoginForm) => {
        type: string;
        form: LoginForm;
    }
}

export interface LoginState {
    loggedIn: boolean
}

interface LoginValues {
    username: string;
    password: string;
}

class Login extends Component<LoginProps, LoginState> {

    readonly state: LoginState = {loggedIn: false};

    onSubmit = (values: LoginValues) => {
        const { logIn } = this.props;
        console.log(values);
        logIn(values);
    }

    private validate(values: LoginValues) {
        if (values.username.length === 0 && values.password.length === 0) {
            return;
        }
        return;
    }

    public render() {
        return (
            <Container className="Login">
                <h2>
                    Horus - Log in
                </h2>
                <Formik
                    initialValues={{ username: '', password: ''}}
                    validate={this.validate}
                    onSubmit={this.onSubmit}
                >
                    {({ handleSubmit }) => (
                        <Form>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Label>Username</Label>
                                        <Input
                                            tag={Field}
                                            id="username"
                                            name="username"
                                            placeholder="s1234567/m1234567"   
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Label>Password</Label>
                                        <Input
                                            tag={Field}
                                            id="password"
                                            name="password"
                                            placeholder="*********"
                                            type="password"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ButtonGroup>
                                        <Button
                                            onClick={() => {handleSubmit()}}
                                        >
                                            Submit
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Formik>
            </Container>
        );
    }
}

export default connect( (state: ApplicationState) => ({
    loggedIn: isLoggedIn(state),
}), {
    logIn: loginAction,
})(Login);