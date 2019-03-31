import { Component } from "react";
import React from "react";
import { ModalHeader, ModalBody, ModalFooter, Modal, Button } from "reactstrap";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import { AcceptDto, QueueDto } from "../../../api/types";
import { QueuingMode } from "../../../state/queuing/types";
import History from "./History";
import {
    RemindRequestedAction,
    remindRequestedAction,
} from "../../../state/queuing/actions";
import { getHistory, getQueues } from "../../../state/queuing/selectors";
import { ApplicationState } from "../../../state/state";

interface HistoryModalProps {
    isOpen: boolean;
    mode: QueuingMode;
    queues: QueueDto[] | null;
    queueHistory: AcceptDto[] | null;
    onCloseModal: () => void;
    remind: (cid: number, rid: string, id: number) => RemindRequestedAction;
}

class HistoryModal extends Component<
    HistoryModalProps & RouteComponentProps<any>
> {
    render() {
        const {
            isOpen,
            mode,
            queues,
            queueHistory,
            remind,
            onCloseModal,
        } = this.props;

        const { cid, rid } = this.props.match.params;

        if (queues == null || queueHistory == null) {
            return null;
        }

        return (
            <Modal isOpen={isOpen}>
                <ModalHeader toggle={() => onCloseModal()}>
                    Room activity history
                </ModalHeader>
                <ModalBody>
                    <History
                        mode={mode}
                        history={queueHistory!.map((history: AcceptDto) => ({
                            ta: history.accepter.fullName,
                            student: history.participant.fullName,
                            list: queues!.some(
                                (queue: QueueDto) =>
                                    queue.id === history.queueId,
                            )
                                ? queues.find(
                                      (queue: QueueDto) =>
                                          queue.id === history.queueId,
                                  )!.name
                                : "Queue deleted",
                            onRemind: () =>
                                remind(
                                    Number(cid),
                                    rid,
                                    history.participant.id,
                                ),
                        }))}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        block
                        outline
                        color="primary"
                        onClick={() => this.props.onCloseModal()}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    onCloseModal() {
        this.props.onCloseModal();
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            queueHistory: getHistory(state),
            queues: getQueues(state),
        }),
        {
            remind: (cid: number, rid: string, id: number) =>
                remindRequestedAction(cid, rid, id),
        },
    )(HistoryModal),
);
