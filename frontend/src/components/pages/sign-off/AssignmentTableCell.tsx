import React, { Component } from "react";
import { AssignmentDtoBrief } from "../../../state/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

interface AssignmentTableCellProps {
    assignment: AssignmentDtoBrief;
    onCommentClick?: () => void;
    onClick?: () => void;
    disabled: boolean;
}

export default class AssignmentTableCell extends Component<
    AssignmentTableCellProps
> {
    render() {
        const { name } = this.props.assignment;
        const { disabled } = this.props;
        return (
            <td
                onDoubleClick={() => this.onClick()}
                className="sign-off-table-heading sign-off-table-left-column"
                style={{ cursor: disabled ? "default" : "pointer" }}
            >
                {name}
                {this.props.onCommentClick && (
                    <div
                        onClick={this.props.onCommentClick}
                        style={{ float: "right" }}
                    >
                        <FontAwesomeIcon icon={faEllipsisH} />
                    </div>
                )}
            </td>
        );
    }

    private onClick() {
        const { onClick, disabled } = this.props;

        if (!disabled && onClick != null) {
            onClick();
        }
    }
}
