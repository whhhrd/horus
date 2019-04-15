import React, { Component } from "react";
import { Table, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
    ParticipantDtoBrief,
} from "../../../api/types";
import { centerSpinner } from "../../pagebuilder";
import { getDisplayedDate } from "../../util";
import {SignOffInformation} from "../../../state/sign-off/types";

interface SignOffHistoryModalProps {
    isOpen: boolean;
    signOffHistory: SignOffInformation[] | null;
    participant: ParticipantDtoBrief;
    onCloseModal: () => void;
}

/**
 * A modal that displays the sign-off history of a given
 * sign-off, for a specific combination of student and
 * assignment.
 */
export default class SignOffHistoryModal extends Component<
    SignOffHistoryModalProps
> {
    constructor(props: SignOffHistoryModalProps) {
        super(props);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    render() {
        const { signOffHistory } = this.props;

        if (signOffHistory == null) {
            return centerSpinner();
        } else {
            const { participant, isOpen } = this.props;

            return (
                <Modal autoFocus={false} isOpen={isOpen}>
                    <ModalHeader
                        toggle={this.onCloseModal}
                    >{`Sign-Off history for ${
                        participant.person.fullName
                    }`}</ModalHeader>
                    <ModalBody>
                        <Table className="table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th>Signer</th>
                                    <th>Marked as</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {signOffHistory.map((result) => (
                                    <tr key={result.signedAt.getTime()}>
                                        <td>{result.signer.person.fullName}</td>
                                        <td>{result.type}</td>
                                        <td>
                                            {getDisplayedDate(result.signedAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                </Modal>
            );
        }
    }
}
