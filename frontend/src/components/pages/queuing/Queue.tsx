import React, { Component } from "react";
import { QueueEntry, QueuingMode } from "../../../state/queuing/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEdit } from "@fortawesome/free-solid-svg-icons";
import { ParticipantDtoBrief, QueueDto } from "../../../api/types";
import {
    Col,
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Button,
    ListGroup,
    ListGroupItem,
    Badge,
} from "reactstrap";
import QueueTimeBadge from "./QueueTimeBadge";
import { gradientColor } from "../../util";
import QueueEditModal from "./QueueEditModal";

interface QueueProps {
    queue: QueueDto;
    entries: QueueEntry[];
    mode?: QueuingMode;
    currentParticipant?: ParticipantDtoBrief;
    onJoinQueue?: () => any;
    onDeleteQueue?: () => any;
    onAcceptNext?: () => any;
}

interface QueueState {
    queueToEdit: QueueDto | null;
}

export default class Queue extends Component<QueueProps, QueueState> {
    static UNACCEPTABLE_QUEUE_LENGTH = 15;

    constructor(props: QueueProps) {
        super(props);
        this.state = { queueToEdit: null };
        this.toggleQueueEditModal = this.toggleQueueEditModal.bind(this);
    }

    toggleQueueEditModal(queue: QueueDto | null) {
        this.setState(() => ({
            queueToEdit: queue,
        }));
    }

    render() {
        const {
            entries,
            queue,
            onDeleteQueue,
            mode,
            onAcceptNext,
            currentParticipant,
        } = this.props;

        const { queueToEdit } = this.state;

        const numOfEntries = entries.length;

        const progress = Math.max(
            0,
            100 - (100 * numOfEntries) / Queue.UNACCEPTABLE_QUEUE_LENGTH,
        );

        return (
            <Col xs="12" lg="6" xl="4" className="mb-3">
                <Card className="h-100">
                    <CardHeader>
                        <CardTitle className="d-flex align-items-center justify-content-between">
                            <div className="ellipsis mr-2" title={queue.name}>
                                {queue.name}
                            </div>
                            <Badge
                                pill
                                style={{
                                    backgroundColor: gradientColor(progress)
                                        .borderColor,
                                }}
                                className="d-none d-lg-inline-block ellipsis mr-2"
                            >
                                {numOfEntries} in queue
                            </Badge>
                            {mode != null && (
                                <div className="d-flex flex-nowrap float-right flex-shrink-0">
                                    {this.buildJoinLeaveButton(numOfEntries)}
                                    {mode === QueuingMode.TA && (
                                        <Button
                                            title="Edit queue"
                                            outline
                                            color="success"
                                            className="ml-2"
                                            onClick={() =>
                                                this.toggleQueueEditModal(queue)
                                            }
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                    )}
                                    {mode === QueuingMode.TA &&
                                        onDeleteQueue != null && (
                                            <Button
                                                title="Delete queue"
                                                outline
                                                color="danger"
                                                className="ml-2"
                                                onClick={onDeleteQueue}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTimes}
                                                />
                                            </Button>
                                        )}
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardBody className="py-2">
                        {numOfEntries === 0 && (
                            <span className="text-muted d-block p-3">
                                No students in this queue
                            </span>
                        )}
                        {numOfEntries > 0 && (
                            <div>
                                {mode === QueuingMode.TA &&
                                    onAcceptNext != null && (
                                        <Button
                                            color="success"
                                            block
                                            size="sm"
                                            className="mb-2 mt-2"
                                            onClick={onAcceptNext}
                                        >
                                            <FontAwesomeIcon
                                                className="mr-3"
                                                icon={faCheck}
                                            />
                                            Accept next
                                        </Button>
                                    )}
                                <div
                                    style={{
                                        maxHeight: "350px",
                                        overflow: "auto",
                                    }}
                                >
                                    <ListGroup className="w-100">
                                        {entries.map(
                                            (entry: QueueEntry, i: number) => (
                                                <ListGroupItem
                                                    key={entry.participant.id}
                                                    className={`d-flex px-0 align-items-center
                                                        justify-content-between py-2
                                                        border-right-0 border-left-0 ${
                                                            i === 0
                                                                ? "border-top-0"
                                                                : ""
                                                        } ${
                                                        i === numOfEntries - 1
                                                            ? "border-bottom-0"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="d-inline-block ellipsis mr-2">
                                                        {
                                                            entry.participant
                                                                .fullName
                                                        }
                                                    </div>
                                                    <div className="d-flex flex-row justify-content-center flex-nowrap">
                                                        {(i === 0 ||
                                                            (currentParticipant !=
                                                                null &&
                                                                entry
                                                                    .participant
                                                                    .id ===
                                                                    currentParticipant.id)) && (
                                                            <div className="mr-3">
                                                                <QueueTimeBadge
                                                                    addedAt={
                                                                        entry
                                                                            .participant
                                                                            .addedAt
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        {this.props.mode ===
                                                            QueuingMode.TA && (
                                                            <div className="d-flex flex-nowrap">
                                                                <Button
                                                                    size="sm"
                                                                    color="success"
                                                                    className="px-4"
                                                                    onClick={
                                                                        entry.onAccept
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        size="sm"
                                                                        icon={
                                                                            faCheck
                                                                        }
                                                                    />
                                                                </Button>
                                                                <Button
                                                                    color="danger"
                                                                    outline
                                                                    size="sm"
                                                                    className="ml-2 mr-1 px-3"
                                                                    onClick={
                                                                        entry.onDeny
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        size="sm"
                                                                        icon={
                                                                            faTimes
                                                                        }
                                                                    />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </ListGroupItem>
                                            ),
                                        )}
                                    </ListGroup>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
                {queueToEdit != null && (
                    <QueueEditModal
                        isOpen={queueToEdit != null}
                        queue={queueToEdit!}
                        onCloseModal={() => this.toggleQueueEditModal(null)}
                    />
                )}
            </Col>
        );
    }

    private buildJoinLeaveButton(numOfEntries: number) {
        const { mode, currentParticipant, onJoinQueue, entries } = this.props;
        if (
            mode === QueuingMode.Student &&
            currentParticipant != null &&
            onJoinQueue != null
        ) {
            const entry = entries.find(
                (qentry: QueueEntry) =>
                    qentry.participant.id === currentParticipant!.id,
            );

            if (entry == null) {
                return (
                    <Button
                        title="Join queue"
                        outline
                        color="success"
                        onClick={onJoinQueue}
                    >
                        Join Queue{" "}
                        <Badge pill className="d-lg-none ml-1" color="success">
                            {numOfEntries}
                        </Badge>
                    </Button>
                );
            } else {
                return (
                    <Button
                        title="Leave queue"
                        outline
                        color="danger"
                        onClick={entry.onDeny}
                    >
                        Leave Queue
                    </Button>
                );
            }
        }
        return null;
    }
}
