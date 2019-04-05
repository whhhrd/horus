import React, { Component } from "react";
import { AssignmentDtoBrief, CommentThreadDtoFull } from "../../../api/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { EntityType } from "../../../state/comments/types";
import CommentThread from "../../comments/CommentThread";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import { getCommentThread } from "../../../state/comments/selectors";

interface AssignmentTableCellProps {
    onClick?: () => void;
    disabled: boolean;

    assignment: AssignmentDtoBrief;
    onCommentClick: (comments: JSX.Element) => void;
    canViewComments: boolean;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;
}

class AssignmentTableCell extends Component<AssignmentTableCellProps> {

    lastClick: number;

    constructor(props: AssignmentTableCellProps)  {
        super(props);
        this.lastClick = 0;
    }

    render() {
        const { name } = this.props.assignment;
        const { disabled } = this.props;
        const commentClickable = this.props.assignment.commentThreadId != null;
        return (
            <td
                onClick={() => this.onClick()}
                className="sign-off-table-heading sign-off-table-left-column"
                style={{ cursor: disabled ? "default" : "pointer" }}
            >
                {name}
                {this.props.canViewComments && this.props.onCommentClick && (
                    <div
                        onClick={() =>
                            this.props.onCommentClick(this.buildComments())
                        }
                        className={`table-cell-comment-button ${
                            this.highlightIcon() ? "icon-highlighted" : ""
                        } ${commentClickable ? "" : "invisible"}`}
                    >
                        <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                    </div>
                )}
            </td>
        );
    }

    /**
     * This non-standard complicated double click detection is there because
     * at the time of writing, Safari on iOS (and also Chrome on the same) did
     * not support the ondblclick event, and hence React's onDoubleClick didn't work.
     */
    private onClick() {
        const { onClick, disabled } = this.props;
        const time  = (new Date()).getTime();
        if (!disabled && onClick != null && (time - this.lastClick) < 300) {
            onClick();
        }
        this.lastClick = time;
    }

    private buildComments() {
        const { assignment } = this.props;
        return (
            <div>
                <h4>Comments:</h4>
                <CommentThread
                    commentThreadId={
                        assignment.commentThreadId != null
                            ? assignment.commentThreadId
                            : null
                    }
                    commentThreadSubject={assignment.name}
                    entityId={assignment.id}
                    entityType={EntityType.Assignment}
                    commentThreadOpen={true}
                    commentThreadMutable={false}
                />
            </div>
        );
    }

    private highlightIcon() {
        const { assignment, commentThread } = this.props;
        return (
            commentThread(assignment.id, EntityType.Assignment) != null ||
            assignment.commentThreadId != null
        );
    }
}

export default connect(
    (state: ApplicationState) => ({
        commentThread: (entityId: number, entityType: EntityType) =>
            getCommentThread(state, entityId, entityType),
    }),
    {},
)(AssignmentTableCell);
