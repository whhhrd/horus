import React, { Component } from "react";
import { AssignmentDtoBrief, CommentThreadDtoFull } from "../../../api/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { EntityType } from "../../../state/comments/types";
import CommentThread from "../../comments/CommentThread";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import { getCommentThread } from "../../../state/comments/selectors";

interface AssignmentTableCellProps {
    style: React.CSSProperties;
    className: string;

    onClick?: () => void;

    assignment: AssignmentDtoBrief;
    onCommentClick: (comments: JSX.Element) => void;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;
}

class AssignmentTableCell extends Component<AssignmentTableCellProps> {
    render() {
        const { name } = this.props.assignment;
        const style = this.props.style;
        return (
            <div className={this.props.className} style={style}>
                {name}
                {this.props.onCommentClick && (
                    <div
                        onClick={() =>
                            this.props.onCommentClick(this.buildComments())
                        }
                        className={`overview-table-cell-comment-button ${
                            this.highlightIcon() ? "icon-highlighted" : ""
                        }`}
                        style={{ float: "none" }}
                    >
                        <FontAwesomeIcon icon={faComments} size="sm" />
                    </div>
                )}
            </div>
        );
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
