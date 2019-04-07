import { AcceptDto, QueueDto } from "../../../api/types";
import {
    RemindRequestedAction,
    remindRequestedAction,
} from "../../../state/queuing/actions";
import { PureComponent } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import { getHistory, getQueues } from "../../../state/queuing/selectors";
import {
    Col,
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    Table,
    Button,
} from "reactstrap";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faBell } from "@fortawesome/free-solid-svg-icons";

interface HistoryProps {
    size?: number;
    taMode?: boolean;
    roomHistory: AcceptDto[] | null;
    queues: QueueDto[] | null;

    remind: (
        cid: number,
        rid: string,
        participantId: number,
    ) => RemindRequestedAction;
}

class History extends PureComponent<HistoryProps & RouteComponentProps<any>> {
    static defaultProps = {
        size: 5,
        taMode: false,
    };

    render() {
        const { taMode, roomHistory, queues, size } = this.props;

        if (queues == null || roomHistory == null) {
            return null;
        }

        return (
            <Col xs="12" lg="6" xl="4" className="mb-3">
                <Card className="h-100">
                    <CardHeader>
                        <CardTitle>
                            <FontAwesomeIcon
                                icon={faHistory}
                                className="mr-2"
                            />{" "}
                            Room history
                        </CardTitle>
                    </CardHeader>
                    <CardBody className="py-0 px-0">
                        {roomHistory.length > 0 ? (
                            <div
                                style={{
                                    maxHeight: "500px",
                                    overflow: "auto",
                                }}
                            >
                                <Table className="mb-0 table-fixed">
                                    <thead className="thead-light sign-off-table-top-row">
                                        <tr>
                                            <th>Student</th>
                                            <th>TA</th>
                                            <th>In Queue</th>
                                            {taMode && <th />}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roomHistory
                                            .slice(0, size)
                                            .map((h, i) => (
                                                <tr
                                                    key={
                                                        i +
                                                        h.accepter.fullName +
                                                        h.participant.fullName
                                                    }
                                                >
                                                    <td>
                                                        {h.participant.fullName}
                                                    </td>
                                                    <td>
                                                        {h.accepter.fullName}
                                                    </td>
                                                    <td>
                                                        {queues.find(
                                                            (q) =>
                                                                q.id ===
                                                                h.queueId,
                                                        ) != null ? (
                                                            queues.find(
                                                                (q) =>
                                                                    q.id ===
                                                                    h.queueId,
                                                            )!.name
                                                        ) : (
                                                            <span className="text-muted">
                                                                deleted queue
                                                            </span>
                                                        )}
                                                    </td>
                                                    {taMode && (
                                                        <td>
                                                            <Button
                                                                title="Send a reminder to the student"
                                                                outline
                                                                color="primary"
                                                                onClick={() =>
                                                                    this.props.remind(
                                                                        Number(
                                                                            this
                                                                                .props
                                                                                .match
                                                                                .params
                                                                                .cid,
                                                                        ),
                                                                        h.roomCode,
                                                                        h
                                                                            .participant
                                                                            .id,
                                                                    )
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faBell
                                                                    }
                                                                />
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <span className="text-muted d-block p-3">
                                No history in this room
                            </span>
                        )}
                    </CardBody>
                </Card>
            </Col>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            roomHistory: getHistory(state),
            queues: getQueues(state),
        }),
        {
            remind: remindRequestedAction,
        },
    )(History),
);
