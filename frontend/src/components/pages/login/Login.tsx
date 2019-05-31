import React, { Component, KeyboardEvent } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import queryString from "query-string";
import {
    Row,
    Form,
    Button,
    Input,
    FormGroup,
    Jumbotron,
    Modal,
    ModalBody,
    ModalFooter,
    Label,
    ModalHeader,
} from "reactstrap";
import { Formik, Field } from "formik";

import { LoginForm } from "../../../state/auth/types";
import { isLoggedIn, getLoginError } from "../../../state/auth/selectors";
import { ApplicationState } from "../../../state/state";
import { loginAction } from "../../../state/auth/actions";
import Spinner from "reactstrap/lib/Spinner";
import groupPicture from "../../../images/horus_group_picture_compressed.jpg";
import { setPageTitle } from "../../pagebuilder";
import { PATH_PROJECTOR_PROMPT, PATH_MANUAL } from "../../../routes";

import horus from "../../../images/horus.png";

export interface LoginProps {
    logIn: (
        form: LoginForm | null,
        code: string | null,
    ) => {
        type: string;
        form: LoginForm | null;
        code: string | null;
    };
    error: Error | null;
    loggedIn: boolean;
}

export interface LoginState {
    loginCode: string | null;
    showExternalLogin: boolean;
    showAboutPage: boolean;
}

interface LoginValues {
    username: string;
    password: string;
}

/**
 * The login page of the application. The user also
 * has the ability to enter 'beamer' mode. Furthermore,
 * this page contains the 'about' details.
 */
class Login extends Component<LoginProps & RouteComponentProps, LoginState> {
    constructor(props: LoginProps & RouteComponentProps) {
        super(props);
        this.state = {
            loginCode: null,
            showExternalLogin: false,
            showAboutPage: false,
        };
        this.toggleExternalLoginCollapse = this.toggleExternalLoginCollapse.bind(
            this,
        );
    }

    toggleExternalLoginCollapse() {
        this.setState((state) => ({
            showExternalLogin: !state.showExternalLogin,
        }));
    }

    toggleAboutPageCollapse() {
        this.setState((state) => ({
            showAboutPage: !state.showAboutPage,
        }));
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
        setPageTitle("Login");
    }

    validate(values: LoginValues) {
        if (values.username.length === 0 && values.password.length === 0) {
            return;
        }
        return;
    }

    render() {
        const code = this.getLoginCode();
        const loginError = this.props.error;
        const divider = <small className="pl-1 pr-1"> | </small>;
        return (
            <Row className="LoginWrapper m-0 align-items-center justify-content-center">
                <div className="LoginPageBox">
                    <svg className="LoginBackground">
                        <circle
                            cx="1%"
                            cy="50%"
                            r="60%"
                            fill="#e7e7e7"
                            fillOpacity="0.5"
                        />
                        <circle
                            cx="70%"
                            cy="10%"
                            r="70%"
                            fill="#e7e7e7"
                            fillOpacity="0.5"
                        />
                        <circle
                            cx="20%"
                            cy="20%"
                            r="60%"
                            fill="#e7e7e7"
                            fillOpacity="0.5"
                        />
                        <circle
                            cx="80%"
                            cy="70%"
                            r="50%"
                            fill="#e7e7e7"
                            fillOpacity="0.5"
                        />
                    </svg>
                    <Jumbotron className="Login mx-auto">
                        <img className="w-100 pb-3" src={horus} />
                        <p className="lead">Sign-off manager</p>
                        <p className="lead mt-5 mb-0">
                            {(code == null || loginError != null) && (
                                <a
                                    className="no-decoration mb-4"
                                    href="/api/auth/saml/request"
                                >
                                    <Button size="lg" color="primary">
                                        Log in with UT
                                    </Button>
                                </a>
                            )}

                            {code != null && loginError == null && <Spinner />}

                            {(code == null || loginError != null) && (
                                <Modal
                                    isOpen={this.state.showExternalLogin}
                                    toggle={() =>
                                        this.toggleExternalLoginCollapse()
                                    }
                                >
                                    <Formik
                                        initialValues={{
                                            username: "",
                                            password: "",
                                        }}
                                        validate={this.validate}
                                        onSubmit={this.onSubmit}
                                    >
                                        {({ handleSubmit }) => (
                                            <div>
                                                <ModalHeader>
                                                    External Login
                                                </ModalHeader>
                                                <ModalBody>
                                                    <Form>
                                                        <FormGroup>
                                                            <Label>
                                                                Username
                                                            </Label>
                                                            <Input
                                                                tag={Field}
                                                                id="username"
                                                                name="username"
                                                                placeholder="s1234567/m1234567"
                                                                onKeyDown={(
                                                                    event: KeyboardEvent,
                                                                ) => {
                                                                    if (
                                                                        event.key ===
                                                                        "Enter"
                                                                    ) {
                                                                        event.preventDefault();
                                                                        handleSubmit();
                                                                    } else {
                                                                        return;
                                                                    }
                                                                }}
                                                            />
                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label>
                                                                Password
                                                            </Label>
                                                            <Input
                                                                tag={Field}
                                                                id="password"
                                                                name="password"
                                                                placeholder="*********"
                                                                type="password"
                                                                onKeyDown={(
                                                                    event: KeyboardEvent,
                                                                ) => {
                                                                    if (
                                                                        event.key ===
                                                                        "Enter"
                                                                    ) {
                                                                        event.preventDefault();
                                                                        handleSubmit();
                                                                    } else {
                                                                        return;
                                                                    }
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Form>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button
                                                        block
                                                        color="primary"
                                                        outline
                                                        onClick={() => {
                                                            handleSubmit();
                                                        }}
                                                    >
                                                        Log in
                                                    </Button>
                                                </ModalFooter>
                                            </div>
                                        )}
                                    </Formik>
                                </Modal>
                            )}
                        </p>
                        <p className="mt-4 mb-0">
                            <Button
                                color="success"
                                outline
                                onClick={() =>
                                    this.props.history.push({
                                        pathname: PATH_PROJECTOR_PROMPT,
                                    })
                                }
                            >
                                Projector mode
                            </Button>
                        </p>
                    </Jumbotron>
                    <div className="LoginPageMenu">
                        <small
                            className="text-dark"
                            onClick={() => this.toggleExternalLoginCollapse()}
                        >
                            External Login
                        </small>
                        {divider}
                        <small
                            className="text-dark"
                            onClick={() => this.toggleAboutPageCollapse()}
                        >
                            About
                        </small>
                        {divider}
                        <small
                            className="text-dark"
                            onClick={() => window.open(PATH_MANUAL)}
                        >
                            User Manual
                            </small>
                    </div>
                </div>
                {(code == null || loginError != null) && (
                    <Modal
                        isOpen={this.state.showAboutPage}
                        toggle={() => this.toggleAboutPageCollapse()}
                        className="AboutPageModal"
                    >
                        <div>
                            <ModalHeader>About Horus</ModalHeader>
                            <ModalBody>
                                <div>
                                    Horus is a course management system
                                    particularly focussing on the "sign-offs" of
                                    assignments. Its intent is to take away the
                                    inconveniences perceived during the sign-off
                                    process, both for students and Teaching
                                    Assistants. In addition, Horus also aims to
                                    take away some of the manual labor involved
                                    in managing courses for teachers.
                                </div>
                                <h4 className="pt-3">Developers</h4>
                                <div>
                                    Horus was originally developed in 2019 as a
                                    Design Project for the Technical Computer
                                    Science curriculum.
                                    <img
                                        className="AboutPageImage pt-2 pb-2"
                                        src={groupPicture}
                                        alt="Picture of the Horus project group"
                                    />
                                    This is the project team that made it
                                    happen. From left to right, the members are{" "}
                                    <a href="mailto:r.a.h.perera@student.utwente.nl">
                                        Harindu Perera
                                    </a>
                                    ,{" "}
                                    <a href="mailto:r.abraham@student.utwente.nl">
                                        Remco Abraham
                                    </a>
                                    ,{" "}
                                    <a href="mailto:r.h.devries@student.utwente.nl">
                                        Rick de Vries
                                    </a>
                                    ,{" "}
                                    <a href="mailto:j.w.praas@student.utwente.nl">
                                        Justin Praas
                                    </a>{" "}
                                    &amp;{" "}
                                    <a href="mailto:d.kooij-1@student.utwente.nl">
                                        Daan Kooij
                                    </a>
                                    .
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    block
                                    size="md"
                                    color="primary"
                                    outline
                                    onClick={() =>
                                        this.toggleAboutPageCollapse()
                                    }
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </div>
                    </Modal>
                )}
            </Row>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            loggedIn: isLoggedIn(state),
            error: getLoginError(state),
        }),
        {
            logIn: loginAction,
        },
    )(Login),
);
