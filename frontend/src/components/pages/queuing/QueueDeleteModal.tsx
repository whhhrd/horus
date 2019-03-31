import { Component } from "react";
import React from "react";
import {
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal,
    Button,
    Alert,
} from "reactstrap";
import { QueueDto } from "../../../api/types";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import {
    QueueRemovedAction,
    queueRemovedAction,
} from "../../../state/queuing/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface QueueDeleteModalProps {
    isOpen: boolean;
    onCloseModal: () => void;
    queue: QueueDto;
    deleteQueue: (
        rid: string,
        cid: number,
        queueId: string,
    ) => QueueRemovedAction;
}

class QueueDeleteModal extends Component<
    QueueDeleteModalProps & RouteComponentProps<any>
> {
    render() {
        const { queue } = this.props;
        const queueLength = queue.participants.length;
        return (
            <Modal isOpen={this.props.isOpen != null}>
                <ModalHeader toggle={() => this.props.onCloseModal()}>
                    Deleting queue{" "}
                    <span className="font-weight-bold">{queue.name}</span>
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this queue?
                    {queueLength > 0 && (
                        <Alert className="mt-3 mb-2" color="warning">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="mr-3"
                                size="lg"
                            />
                            {queueLength === 1 &&
                                `There is one participant in this queue.`}
                            {queueLength > 1 &&
                                `There are ${
                                    queue.participants.length
                                } participants in this queue.`}
                        </Alert>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        block
                        outline
                        color="secondary"
                        onClick={() => this.props.onCloseModal()}
                    >
                        Cancel
                    </Button>
                    <Button
                        block
                        color={queueLength > 0 ? "warning" : "primary"}
                        onClick={() => this.deleteQueue()}
                    >
                        Delete queue
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    deleteQueue() {
        this.props.deleteQueue(
            this.props.match.params.rid,
            Number(this.props.match.params.cid),
            this.props.queue.id,
        );
        this.onCloseModal();
    }

    onCloseModal() {
        this.props.onCloseModal();
    }
}

export default withRouter(
    connect(
        () => ({}),
        {
            deleteQueue: (rid: string, cid: number, queueId: string) =>
                queueRemovedAction(cid, rid, queueId),
        },
    )(QueueDeleteModal),
);
