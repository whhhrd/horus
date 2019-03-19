import { Component } from "react";
import {
    SignOffResultDtoSummary,
    ParticipantDtoBrief,
} from "../../../api/types";
import { centerSpinner } from "../../pagebuilder";
import React from "react";
import { Table, Modal, ModalHeader, ModalBody } from "reactstrap";
import { getDisplayedDate } from "../../util";

interface SignOffHistoryModalProps {
    isOpen: boolean;
    signOffHistory: SignOffResultDtoSummary[] | null;
    participant: ParticipantDtoBrief;
    onCloseModal: () => void;
}

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
                                    <tr key={result.signedAt.toString()}>
                                        <td>{result.signer.person.fullName}</td>
                                        <td>{result.result}</td>
                                        <td>
                                            {getDisplayedDate(
                                                new Date(result.signedAt),
                                            )}
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
