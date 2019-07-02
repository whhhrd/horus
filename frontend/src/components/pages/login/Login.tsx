import React, {Component, KeyboardEvent} from "react";
import {withRouter, RouteComponentProps} from "react-router-dom";
import {connect} from "react-redux";
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
import {Formik, Field} from "formik";

import {LoginForm} from "../../../state/auth/types";
import {isLoggedIn, getLoginError} from "../../../state/auth/selectors";
import {ApplicationState} from "../../../state/state";
import {loginAction} from "../../../state/auth/actions";
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
    showPrivacyPolicyPage: boolean;
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
            showPrivacyPolicyPage: false,
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

    togglePrivacyPolicyPageCollapse() {
        this.setState((state) => ({
            showPrivacyPolicyPage: !state.showPrivacyPolicyPage,
        }));
    }

    onSubmit = (values: LoginValues) => {
        const {logIn} = this.props;
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
        const {logIn} = this.props;
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
                        <img className="w-100 pb-3" src={horus}/>
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

                            {code != null && loginError == null && <Spinner/>}

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
                                        {({handleSubmit}) => (
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
                            onClick={() => this.togglePrivacyPolicyPageCollapse()}
                        >
                            Privacy Policy
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
                    <div>
                        <Modal
                            isOpen={this.state.showAboutPage}
                            toggle={() => this.toggleAboutPageCollapse()}
                            className="AboutPageModal"
                        >
                            <div style={{maxHeight: "90vh", overflowY: "auto"}}>
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
                        <Modal
                            isOpen={this.state.showPrivacyPolicyPage}
                            toggle={() => this.togglePrivacyPolicyPageCollapse()}
                            className="PrivacyPolicyPageModal"
                        >
                            <div>
                                <ModalHeader>Privacy Policy</ModalHeader>
                                <ModalBody>
                                    <div>
                                        <i>Last updated: April 17, 2019</i>
                                    </div>
                                    <h4 className="pt-3">Introduction</h4>
                                    <div>
                                        You are currently reading the privacy policy of the Horus application. Horus is
                                        an online course management system particularly focussing on the "sign-offs" of
                                        assignments. To do this effectively, the system stores and processes personal
                                        data as described in this privacy policy.
                                        <br/><br/>
                                        This privacy policy may be updated in the future. You will be informed about
                                        these changes via this page. Once an updated privacy policy is posted here, it
                                        is effective immediately.
                                    </div>
                                    <h4 className="pt-3">Data Collection</h4>
                                    <div>
                                        In order to facilitate Horus in assisting managing a course, the functionality
                                        to import a course from Canvas is provided. In doing so, basic course metadata
                                        (course name, course code and external ID), participants of the course and group
                                        sets within the course are retrieved from Canvas and stored within Horus. Also
                                        the canvas access token of the importer is stored within Horus. The participant
                                        data contains the full name, email address and login ID of every participant in
                                        the course, and the group sets data contains the name of and the groups
                                        (including group name and group members) in every group set. After importing a
                                        course, the above described data can be re-fetched from Canvas at any time and
                                        again be stored in Horus at the request of a teacher within the course.
                                        <br/><br/>
                                        After a course is imported in Horus, participants (teachers, TAs and students)
                                        of the course can log in to Horus and enter the course. Participants are able to
                                        add and alter data within the system. Every form of data that is entered into
                                        the application is stored within Horus. This includes assignment sets,
                                        assignments, assignment set to group set mappings, labels, label to student
                                        mappings, participant to supplementary role mappings, sign-offs of
                                        participant-assignment combinations, comment threads, comments, rooms within the
                                        queuing system, queues within a room, and queue to assignment set mappings.
                                        <br/><br/>
                                        Apart from the above mentioned data collection, in principle also every
                                        interaction of a user with the application is stored somewhere within the
                                        system, either explicitly or in the form of server logs. Such an interaction may
                                        also contain metadata about your system and/or network configuration. This data
                                        is collected for two reasons. First of all, this data is collected to make
                                        executors of actions accountable for their actions, as the data stored within
                                        the system is used for educational purposes and therefore should not be
                                        erroneously changed. Secondly, this data is collected and may be used to improve
                                        the functioning of the application, for instance by inspecting the actions that
                                        led to an error within the application.
                                    </div>
                                    <h4 className="pt-3">Data Access</h4>
                                    <div>
                                        Only participants of a course are able to see data belonging to the course, with
                                        the exception of the rooms within the queuing system and queues within a room,
                                        which in principle are accessible by anyone with the specific room code.
                                        <br/><br/>
                                        Within a course, by default a teacher has access to all the data belonging to a
                                        course: assignment sets, assignments, assignment set to group set mappings,
                                        group sets, groups, labels, label to student mappings, participant to
                                        supplementary role mappings, sign-offs of participant-assignment combinations,
                                        comment threads, comments, rooms within the queuing system, queues within a
                                        room, and queue to assignment set mappings. TAs have access to the same
                                        information, with the exception that they cannot view participant to
                                        supplementary role mappings. Students, on the other hand, only have access to
                                        the sign-offs of participant-assignment combinations where they are the
                                        participant, the groups they are in, the rooms within the queuing system, and
                                        queues within a room. Teachers can, however, assign extra permissions to
                                        specific TAs within a course, after which these TAs may have more data access,
                                        but never more than the teacher itself.
                                        <br/><br/>
                                        In addition to the above mentioned data access, some of the original developers
                                        of the application also have access to the server logs and the database (meaning
                                        all data stored within the system) for the purpose of managing the system. This
                                        access, however, will not be used with the intention to inspect personal data.
                                    </div>
                                    <h4 className="pt-3">Data Storage</h4>
                                    <div>
                                        The data stored within Horus is stored at several places. First of all, the data
                                        is stored at the server hosting the application, located somewhere at the
                                        University of Twente. Secondly, backups of the system are made and stored by the
                                        DS (Data Science) research group of the University of Twente. Finally, also
                                        regularly encrypted backups of the system are made and stored in the Google
                                        cloud of the University of Twente.
                                    </div>
                                    <h4 className="pt-3">Storage Period</h4>
                                    <div>
                                        In principle, data stored in Horus will stay there indefinitely. But on request
                                        of course teacher, data belonging to courses in which they are a teacher can be
                                        removed from the live version of the system.
                                        <br/><br/>
                                        Specific parts of data belonging to a course can be deleted from Horus by using
                                        the user interface of the web application. In particular, this is the case for
                                        assignment sets, assignments, assignment set to group set mappings, labels,
                                        label to student mappings, participant to supplementary role mappings, sign-offs
                                        of participant-assignment combinations, comment threads, comments, rooms within
                                        the queuing system, queues within a room, and queue to assignment set mappings.
                                        <br/><br/>
                                        The data that is removed from Horus, either on request of a course teacher or
                                        via the user interface, will not be removed from the server logs or system
                                        backups.
                                    </div>
                                    <h4 className="pt-3">Contact</h4>
                                    <div>
                                        If something within this privacy policy is unclear, or if you have any questions
                                        about this privacy policy, you can contact us via email at <a
                                        href="mailto:contact@horusapp.nl">contact@horusapp.nl</a>.
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        block
                                        size="md"
                                        color="primary"
                                        outline
                                        onClick={() =>
                                            this.togglePrivacyPolicyPageCollapse()
                                        }
                                    >
                                        Close
                                    </Button>
                                </ModalFooter>
                            </div>
                        </Modal>
                    </div>
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
