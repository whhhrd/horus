import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Container, Row, Col, Form, Button, Input, Label, FormGroup, ButtonGroup } from 'reactstrap'
import { Formik, Field } from 'formik';

import { LoginForm } from '../../../state/auth/types';
import { isLoggedIn } from '../../../state/auth/selectors';
import { ApplicationState } from '../../../state/state';
import { loginAction } from '../../../state/auth/actions';
import Spinner from 'reactstrap/lib/Spinner';

export interface LoginProps {
    logIn: (form: LoginForm | null, code: string | null) => {
        type: string;
        form: LoginForm | null;
        code: string | null
    }
}

export interface LoginState {
    loggedIn: boolean;
    loginCode: string | null;
}

interface LoginValues {
    username: string;
    password: string;
}

class Login extends Component<LoginProps & RouteComponentProps, LoginState> {

    readonly state: LoginState = {loggedIn: false, loginCode: null};

    onSubmit = (values: LoginValues) => {
        const { logIn } = this.props;
        logIn(values, null);
    }

    getLoginCode = () => {
        const query = this.props.history.location.search;
        const code = queryString.parse(query).code;
        if (code != null && code.length > 0) {
            return code;
        }
        return null;
    }

    componentDidMount() {
        const { logIn } = this.props;
        const code = this.getLoginCode();
        if (code != null) {
            logIn(null, code as string);
        }
    }

    validate(values: LoginValues) {
        if (values.username.length === 0 && values.password.length === 0) {
            return;
        }
        return;
    }

    render() {
        const code = this.getLoginCode();
        return (
            <Container className="Login">
                <h2>
                    Horus - Log in
                </h2>
                { code != null &&
                  <Spinner />
                }
                { code == null &&
                 <Formik
                    initialValues={{ username: "", password: ""}}
                    validate={this.validate}
                    onSubmit={this.onSubmit} >
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
                                            onClick={() => {handleSubmit();}}
                                        >
                                            Submit
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Formik>
                }
                <a href="/api/auth/saml/request">SAML Login</a>
            </Container>
        );
    }
}

export default withRouter(connect( (state: ApplicationState) => ({ loggedIn: isLoggedIn(state),}), {
    logIn: loginAction,
})(Login));