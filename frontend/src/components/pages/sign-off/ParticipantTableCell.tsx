import React, { Component } from "react";

import {
    ParticipantDtoBrief,
    GroupDtoSummary,
    CommentThreadDtoFull,
} from "../../../api/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import CommentThread from "../../comments/CommentThread";
import { EntityType } from "../../../state/comments/types";
import { getCommentThread } from "../../../state/comments/selectors";
import { ApplicationState } from "../../../state/state";
import { connect } from "react-redux";

interface ParticipantTableCellProps {
    participant: ParticipantDtoBrief;
    group: GroupDtoSummary;
    onCommentClick: (comments: JSX.Element) => void;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;
}

class ParticipantTableCell extends Component<ParticipantTableCellProps> {
    render() {
        const { person } = this.props.participant;
        return (
            <td className="sign-off-table-heading sign-off-table-top-row">
                {person.fullName}

                {this.props.onCommentClick && (
                    <div
                        onClick={() =>
                            this.props.onCommentClick(this.buildComments())
                        }
                        className={`table-cell-comment-button ${
                            this.highlightIcon() ? "icon-highlighted" : ""
                        }`}
                    >
                        <FontAwesomeIcon icon={faComments} size="lg" />
                    </div>
                )}
            </td>
        );
    }

    private buildComments() {
        const { participant, group } = this.props;
        return (
            <div>
                <h4>Comments:</h4>
                <CommentThread
                    commentThreadId={
                        participant.commentThread != null
                            ? participant.commentThread.id
                            : null
                    }
                    commentThreadSubject={participant.person.fullName}
                    linkedEntityId={participant.id}
                    linkedEntityType={EntityType.Participant}
                    showCommentThreadContent={true}
                />
                <CommentThread
                    commentThreadId={
                        group.commentThread != null
                            ? group.commentThread.id
                            : null
                    }
                    commentThreadSubject={group.name}
                    linkedEntityId={group.id}
                    linkedEntityType={EntityType.Group}
                    showCommentThreadContent={false}
                />
            </div>
        );
    }

    private highlightIcon() {
        const { participant, commentThread } = this.props;
        return (
            commentThread(participant.id, EntityType.Participant) != null ||
            participant.commentThread != null
        );
    }
}

export default connect(
    (state: ApplicationState) => ({
        commentThread: (entityId: number, entityType: EntityType) =>
            getCommentThread(state, entityId, entityType),
    }),
    {},
)(ParticipantTableCell);
