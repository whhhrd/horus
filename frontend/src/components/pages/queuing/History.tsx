import React, { Component } from "react";
import { HistoryEntry, QueuingMode } from "../../../state/queuing/types";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

interface HistoryProps {
    history: HistoryEntry[];
    size?: number;
    mode?: QueuingMode;
}
export default class History extends Component<HistoryProps> {
    static defaultProps = {
        size: 5,
        mode: QueuingMode.Student,
    };
    render() {
        const { history } = this.props;
        if (history.length === 0) {
            return (
                <span className="text-muted">
                    No activity in this room so far.
                </span>
            );
        }

        return (
            <Table bordered>
                <thead className="thead-light">
                    <tr>
                        <th>Student</th>
                        <th>Teaching Assistant</th>
                        <th>List</th>
                        {this.props.mode === QueuingMode.TA && <th>Remind</th>}
                    </tr>
                </thead>
                <tbody>{this.buildTableBody()}</tbody>
            </Table>
        );
    }
    private buildTableBody() {
        const result = [];
        const { history, size } = this.props;
        for (let i = 0; i < size!; i++) {
            if (history.length > 0 && history[i] != null) {
                result.push(
                    <tr key={i}>
                        <td>{history[i].student}</td>
                        <td>{history[i].ta}</td>
                        <td>{history[i].list}</td>
                        {this.props.mode === QueuingMode.TA && (
                            <td>
                                <Button
                                    color="primary"
                                    outline
                                    size="sm"
                                    className="queue-history-remind"
                                    onClick={history[i].onRemind}
                                >
                                    <FontAwesomeIcon
                                        icon={faBell}
                                        className="mr-2"
                                    />
                                    Notify
                                </Button>
                            </td>
                        )}
                    </tr>,
                );
            }
        }
        return result;
    }
}
