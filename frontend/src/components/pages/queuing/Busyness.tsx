import React, { PureComponent } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "react-redux";

import { Col, Card, CardHeader, CardTitle, CardBody, Badge } from "reactstrap";

import { RoomQueueLengthsDto, QueueLengthDto } from "../../../api/types";
import { ApplicationState } from "../../../state/state";
import { getRoomQueueLengths } from "../../../state/queuing/selectors";
import {
    RoomQueueLengthsRequestedAction,
    roomQueueLengthsRequestedAction,
} from "../../../state/queuing/actions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStoreAlt } from "@fortawesome/free-solid-svg-icons";
import Queue from "./Queue";
import { gradientColor } from "../../util";

interface BusynessProps {
    roomCode: string;
    roomQueueLengths: RoomQueueLengthsDto[] | null;

    fetchRoomQueueLengths: (
        courseId: number,
    ) => RoomQueueLengthsRequestedAction;
}

/**
 * A queue compliant card component that displays the
 * busyness in other rooms that are linked to the course.
 * Only shows the two queues in the other rooms that have
 * the most queued students.
 * Polls the busyness every POLL_INTERVAL seconds.
 */
class Busyness extends PureComponent<BusynessProps & RouteComponentProps<any>> {
    static POLL_INTERVAL = 30000;
    poller: number;

    constructor(props: BusynessProps & RouteComponentProps<any>) {
        super(props);
        this.poller = -1;
    }

    poll() {
        this.poller = setTimeout(() => {
            if (document.hasFocus()) {
                this.props.fetchRoomQueueLengths(this.props.match.params.cid);
            }
            this.poll();
        }, Busyness.POLL_INTERVAL);
    }

    componentDidMount() {
        this.props.fetchRoomQueueLengths(this.props.match.params.cid);
        this.poll();
    }

    componentWillUnmount() {
        clearTimeout(this.poller);
    }

    render() {
        const { roomQueueLengths, roomCode } = this.props;

        if (roomQueueLengths == null) {
            return null;
        } else {
            const otherRqls = roomQueueLengths.filter(
                (rql) => rql.room.code !== roomCode,
            );
            if (otherRqls.length === 0) {
                return null;
            } else {
                return (
                    <Col xs="12" lg="6" xl="4" className="mb-3">
                        <Card className="h-100">
                            <CardHeader>
                                <CardTitle>
                                    <FontAwesomeIcon
                                        icon={faStoreAlt}
                                        className="mr-2"
                                    />{" "}
                                    Other rooms
                                </CardTitle>
                            </CardHeader>
                            <CardBody className="pb-0">
                                {otherRqls.map((rql) => {
                                    if (rql.queues.length === 0) {
                                        return null;
                                    } else {
                                        return (
                                            <Card
                                                key={rql.room.code}
                                                className="mb-3 shadow-sm"
                                            >
                                                <CardBody className="py-0">
                                                    <div className="d-flex flex-row justify-content-between">
                                                        <div
                                                            className="flex-shrink-1 mr-2 border-right pr-3 py-2"
                                                            style={{
                                                                maxWidth: "30%",
                                                                width: "30%",
                                                            }}
                                                        >
                                                            <p className="lead d-block">
                                                                {rql.room.name}
                                                            </p>
                                                        </div>
                                                        <div className="d-flex flex-column flex-grow-1 py-2">
                                                            {rql.queues
                                                                .sort((a, b) =>
                                                                    a.length <=
                                                                    b.length
                                                                        ? 1
                                                                        : -1,
                                                                )
                                                                .slice(0, 2)
                                                                .map((q, i) =>
                                                                    this.buildQueueEntry(
                                                                        q,
                                                                        i,
                                                                    ),
                                                                )}
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        );
                                    }
                                })}
                            </CardBody>
                        </Card>
                    </Col>
                );
            }
        }
    }

    buildQueueEntry(queue: QueueLengthDto, index: number) {
        const numOfEntries = queue.length;
        const progress = Math.max(
            0,
            100 - (100 * numOfEntries) / Queue.UNACCEPTABLE_QUEUE_LENGTH,
        );
        return (
            <div
                key={queue.name + index}
                className="d-flex flex-row justify-content-between w-100 my-1 pl-2"
            >
                <div>{queue.name}</div>
                <div className="d-flex align-items-center">
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
                </div>
            </div>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            roomQueueLengths: getRoomQueueLengths(state),
        }),
        {
            fetchRoomQueueLengths: roomQueueLengthsRequestedAction,
        },
    )(Busyness),
);
