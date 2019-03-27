import { Component } from "react";
import { ApplicationState } from "../../../state/state";
import { connect } from "react-redux";
import { getSignOffHistory } from "../../../state/sign-off/selectors";
import {
    SignOffHistoryRequestedAction,
    signOffHistoryRequestedAction,
} from "../../../state/sign-off/actions";
import React from "react";
import { Card, CardBody, Button, Alert } from "reactstrap";
import { getDisplayedDate } from "../../util";
import SignOffHistoryModal from "./SignOffHistoryModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import {SignOffInformation} from "../../../state/sign-off/types";

interface SignOffDetailsProps {
    participantId: number;
    assignmentId: number;
    signOffHistory: SignOffInformation[] | null;

    fetchSignOffHistory: (
        participantId: number,
        assignmentId: number,
    ) => SignOffHistoryRequestedAction;
}

interface SignOffDetailsState {
    signOffHistoryModalOpen: boolean;
}

class SignOffDetails extends Component<
    SignOffDetailsProps,
    SignOffDetailsState
> {
    constructor(props: SignOffDetailsProps) {
        super(props);
        this.state = {
            signOffHistoryModalOpen: false,
        };
        this.toggleHistoryModal = this.toggleHistoryModal.bind(this);
    }

    componentDidMount() {
        const { participantId, assignmentId, fetchSignOffHistory } = this.props;
        fetchSignOffHistory(participantId, assignmentId);
    }

    componentDidUpdate(prevProps: SignOffDetailsProps) {
        const prevAsid = prevProps.assignmentId;
        const prevPid = prevProps.participantId;

        const asid = this.props.assignmentId;
        const pid = this.props.participantId;

        if (prevAsid !== asid || prevPid !== pid) {
            this.props.fetchSignOffHistory(pid, asid);
        }
    }

    toggleHistoryModal() {
        this.setState((state) => ({
            signOffHistoryModalOpen: !state.signOffHistoryModalOpen,
        }));
    }

    render() {
        const { signOffHistory } = this.props;

        if (signOffHistory == null) {
            return (
                <div className="mb-3">
                    <Card>
                        <CardBody>
                            <span>Loading...</span>
                            <Button
                                color="primary"
                                disabled
                                block
                                outline
                                className="mt-3"
                                onClick={() => this.toggleHistoryModal()}
                            >
                                <FontAwesomeIcon
                                    icon={faHistory}
                                    className="mr-2"
                                />
                                Show sign-off history
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            );
        } else {
            const mostRecentSignoff = signOffHistory[0];
            if (mostRecentSignoff != null) {
                return (
                    <div className="mb-3">
                        <Card>
                            <CardBody>
                                <span>
                                    Marked as{" "}
                                    <strong>
                                        {mostRecentSignoff.type.toLowerCase()}
                                    </strong>{" "}
                                    by{" "}
                                    <mark className="mr-2">
                                        {
                                            mostRecentSignoff.signer.person.fullName
                                        }
                                    </mark>
                                    <small>
                                        {getDisplayedDate(
                                            new Date(
                                                mostRecentSignoff.signedAt,
                                            ),
                                        )}
                                    </small>
                                </span>
                                <Button
                                    color="primary"
                                    block
                                    outline
                                    className="mt-3"
                                    onClick={() => this.toggleHistoryModal()}
                                >
                                    <FontAwesomeIcon
                                        icon={faHistory}
                                        className="mr-2"
                                    />
                                    Show sign-off history
                                </Button>
                            </CardBody>
                        </Card>
                        {this.state.signOffHistoryModalOpen && (
                            <SignOffHistoryModal
                                participant={mostRecentSignoff.student}
                                signOffHistory={signOffHistory}
                                onCloseModal={this.toggleHistoryModal}
                                isOpen={this.state.signOffHistoryModalOpen}
                            />
                        )}
                    </div>
                );
            } else {
                return (
                    <div className="mb-3">
                        <Card>
                            <CardBody>
                                <Alert color="warning">No sign-off history available.</Alert>
                                <Button
                                    color="primary"
                                    disabled
                                    block
                                    outline
                                    className="mt-3"
                                    onClick={() => this.toggleHistoryModal()}
                                >
                                    <FontAwesomeIcon
                                        icon={faHistory}
                                        className="mr-2"
                                    />
                                    Show sign-off history
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                );
            }
        }
    }
}

export default connect(
    (state: ApplicationState) => ({
        signOffHistory: getSignOffHistory(state),
    }),
    {
        fetchSignOffHistory: signOffHistoryRequestedAction,
    },
)(SignOffDetails);
