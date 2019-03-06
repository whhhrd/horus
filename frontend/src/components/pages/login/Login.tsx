import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import queryString from "query-string";
import { Row, Col, Form, Button, Input, Label, FormGroup, Jumbotron, Modal } from "reactstrap";
import { Formik, Field } from "formik";

import { LoginForm } from "../../../state/auth/types";
import { isLoggedIn } from "../../../state/auth/selectors";
import { ApplicationState } from "../../../state/state";
import { loginAction } from "../../../state/auth/actions";
import Spinner from "reactstrap/lib/Spinner";

export interface LoginProps {
    logIn: (form: LoginForm | null, code: string | null) => {
        type: string;
        form: LoginForm | null;
        code: string | null
    };
}

export interface LoginState {
    loggedIn: boolean;
    loginCode: string | null;
    showExternalLogin: boolean;
}

interface LoginValues {
    username: string;
    password: string;
}

class Login extends Component<LoginProps & RouteComponentProps, LoginState> {

    constructor(props: LoginProps & RouteComponentProps) {
        super(props);
        this.state = {
            loggedIn: false,
            loginCode: null,
            showExternalLogin: false,
        };
        this.toggleExternalLoginCollapse = this.toggleExternalLoginCollapse.bind(this);
    }

    toggleExternalLoginCollapse() {
        this.setState((state) => ({ showExternalLogin: !state.showExternalLogin }));
    }

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
            <Row className="login-wrapper d-flex align-items-center">
                <Col className="mx-auto" lg="5" sm="12">
                    <svg className="LoginBackground">
                        <circle cx="1%" cy="50%" r="60%" fill="#e7e7e7" fillOpacity="0.5" />
                        <circle cx="70%" cy="10%" r="70%" fill="#e7e7e7" fillOpacity="0.5" />
                        <circle cx="20%" cy="20%" r="60%" fill="#e7e7e7" fillOpacity="0.5" />
                        <circle cx="80%" cy="70%" r="50%" fill="#e7e7e7" fillOpacity="0.5" />
                    </svg>
                    <Jumbotron className="Login mx-auto">
                        <h1 className="display-5">Horus, TA administration system</h1>
                        <p className="lead">Description of the system here</p>
                        <p className="lead mt-5 mb-0">
                            <a className="no-decoration mb-4" href="/api/auth/saml/request">
                                <Button size="lg" color="primary">Log in with UT</Button>
                            </a>

                            {code != null &&
                                <Spinner />
                            }

                            {code == null &&
                                <Modal isOpen={this.state.showExternalLogin}
                                    toggle={() => this.toggleExternalLoginCollapse()}>
                                    <Formik
                                        initialValues={{ username: "", password: "" }}
                                        validate={this.validate}
                                        onSubmit={this.onSubmit} >
                                        {({ handleSubmit }) => (
                                            <Form className="p-3">
                                            <h4>External login</h4>
                                                <FormGroup>
                                                    <Label>Username</Label>
                                                    <Input
                                                        tag={Field}
                                                        id="username"
                                                        name="username"
                                                        placeholder="s1234567/m1234567"
                                                    />
                                                </FormGroup>
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
                                                <Button block color="primary"
                                                    outline onClick={() => { handleSubmit(); }}>
                                                    Log in
                                                </Button>
                                            </Form>
                                        )}
                                    </Formik>
                                </Modal>
                            }
                        </p>
                    </Jumbotron>
                    <a className="ExternalLoginToggle"
                        onClick={() => this.toggleExternalLoginCollapse()}><small>External login</small>
                    </a>
                </Col>
            </Row >
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({ loggedIn: isLoggedIn(state) }), {
    logIn: loginAction,
})(Login));
