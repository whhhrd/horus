import React, { Component } from "react";
import { AssignmentDtoBrief, CommentThreadDtoFull } from "../../../api/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faCheckCircle,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { EntityType } from "../../../state/comments/types";
import CommentThread from "../../comments/CommentThread";
import { connect } from "react-redux";
import { ApplicationState } from "../../../state/state";
import { getCommentThread } from "../../../state/comments/selectors";

interface AssignmentTableCellProps {
    style: React.CSSProperties;
    className: string;

    // The number of students (that are being displayed in the overview)
    // who have COMPLETED this assignment
    numOfStudentsWhoHaveCompleted: number | undefined;

    // Idem for INSUFFICIENT
    numOfStudentsWhoHaveAttempted: number | undefined;

    // The total number of students that are being displayed in the overview
    numOfStudents: number;

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
        const {
            style,
            numOfStudents,
            numOfStudentsWhoHaveCompleted: numComplete,
            numOfStudentsWhoHaveAttempted: numInsufficient,
        } = this.props;
        return (
            <div className={this.props.className} style={style} title={name}>
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
                        title="View or add clarifications to this assignment"
                    >
                        <FontAwesomeIcon icon={faComments} size="sm" />
                    </div>
                )}

                {/* Display the number of students who have completed this assignment */}
                <span
                    style={{ fontSize: "0.9em", cursor: "default" }}
                    className={
                        (numComplete != null && numComplete / numOfStudents) ===
                        1
                            ? "text-success"
                            : "text-dark"
                    }
                    title={
                        `${numComplete} out of ${numOfStudents} ` +
                        `students ${
                            numComplete === 1 ? "has" : "have"
                        } completed this assignment` +
                        `${
                            numInsufficient != null && numInsufficient > 0
                                ? ` and\n${numInsufficient} students have attempted this assignment`
                                : ""
                        }`
                    }
                >
                    <FontAwesomeIcon
                        icon={numComplete == null ? faSpinner : faCheckCircle}
                        spin={numComplete == null}
                        size="xs"
                        className="mr-1"
                    />
                    {numComplete}
                </span>
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
