import React, { KeyboardEvent, Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import { Input, Button, FormGroup, Col, Label } from "reactstrap";
import { Field, Formik } from "formik";
import { buildBigCenterMessage, setPageTitle } from "../../pagebuilder";
import { faSadCry } from "@fortawesome/free-solid-svg-icons";

interface PromptValues {
    code: string;
}

/**
 * A simple page prompting the user to enter a room code.
 * The user will be directed to the room (regardless of validity)
 * when they submit the code.
 */
class ProjectorRoomPromptPage extends Component<RouteComponentProps<any>> {
    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.isValidRoomCode = this.isValidRoomCode.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        setPageTitle("Enter room code");
    }

    isValidRoomCode(values: PromptValues) {
        return values.code.trim().length === 6;
    }

    onSubmit(values: PromptValues) {
        this.props.history.push({
            pathname: `/beamer/${values.code.toUpperCase()}`,
        });
    }

    render() {
        return (
            <div style={{ height: "100vh" }}>
                <div className="d-none d-lg-flex">
                    {/* Fills the remaining horizontal space (next to the navbar) */}
                    <div className="flex-fill">
                        {/* A wrapper for the content, a flexible row that contains */}
                        <div className="ContentWrapper d-flex flex-row">
                            {/* The body for the actual content, a flex column that contanis
                                the title and body content */}
                            <div className="ContentBody d-flex flex-column flex-fill">
                                {/* The main content box, displaying the elements from the 'content' argument or
                            the center spinner if the content is Null. */}
                                <div className="d-flex align-items-center h-100 justify-content-center">
                                    <Col xs="12" md="6" lg="4" xl="3">
                                        <Formik
                                            initialValues={{ code: "" }}
                                            onSubmit={this.onSubmit}
                                        >
                                            {({ handleSubmit, values }) => (
                                                <FormGroup>
                                                    <Label>Room code</Label>
                                                    <Input
                                                        tag={Field}
                                                        style={{
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                        bsSize="lg"
                                                        autoFocus={true}
                                                        name="code"
                                                        maxLength={6}
                                                        valid={this.isValidRoomCode(
                                                            values,
                                                        )}
                                                        invalid={
                                                            !this.isValidRoomCode(
                                                                values,
                                                            )
                                                        }
                                                        onKeyDown={(
                                                            event: KeyboardEvent,
                                                        ) => {
                                                            if (
                                                                event.key ===
                                                                    "Enter" &&
                                                                !event.shiftKey
                                                            ) {
                                                                event.preventDefault();
                                                                if (
                                                                    this.isValidRoomCode(
                                                                        values,
                                                                    )
                                                                ) {
                                                                    handleSubmit();
                                                                }
                                                            }
                                                        }}
                                                        placeholder="Room Code"
                                                    />
                                                    <Button
                                                        block
                                                        size="lg"
                                                        color="primary"
                                                        className="mt-3"
                                                        disabled={
                                                            !this.isValidRoomCode(
                                                                values,
                                                            )
                                                        }
                                                        onClick={() => {
                                                            handleSubmit();
                                                        }}
                                                    >
                                                        Go to room
                                                    </Button>
                                                </FormGroup>
                                            )}
                                        </Formik>
                                    </Col>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-lg-none h-100">
                    {buildBigCenterMessage(
                        "Screen size not suitable for beamer mode.",
                        faSadCry,
                    )}
                </div>
            </div>
        );
    }
}

export default withRouter(
    connect(
        () => ({}),
        {},
    )(ProjectorRoomPromptPage),
);
