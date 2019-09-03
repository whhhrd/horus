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
import { RouteComponentProps, withRouter } from "react-router";
import ParticipantLabelInfo from "../admin/labels/ParticipantLabelInfo";
import CoursePermissions from "../../../api/permissions";
import { labelAnyView } from "../../../state/auth/constants";
import { getCoursePermissions } from "../../../state/auth/selectors";

interface ParticipantTableCellProps {
    participant: ParticipantDtoBrief;
    group: GroupDtoSummary;
    onCommentClick: (comments: JSX.Element) => void;
    canViewComments: boolean;

    commentThread: (
        entityId: number,
        entityType: EntityType,
    ) => CommentThreadDtoFull | null;

    coursePermissions: CoursePermissions | null;
}

class ParticipantTableCell extends Component<
    ParticipantTableCellProps & RouteComponentProps<any>
> {
    render() {
        const { person } = this.props.participant;
        return (
            <td className="sign-off-table-heading sign-off-table-top-row">
                {person.fullName}

                {this.props.canViewComments && this.props.onCommentClick && (
                    <div
                        onClick={() =>
                            this.props.onCommentClick(
                                this.buildSidebarContent(),
                            )
                        }
                        className={`table-cell-comment-button ${
                            this.highlightIcon() ? "icon-highlighted" : ""
                        }`}
                        title="View or add comments to this student"
                    >
                        <FontAwesomeIcon icon={faComments} size="lg" />
                    </div>
                )}
            </td>
        );
    }

    private buildSidebarContent() {
        const { participant, group, coursePermissions } = this.props;
        const canViewLabels = labelAnyView.check(
            Number(this.props.match.params.cid),
            coursePermissions!,
        );
        return (
            <div>
                {canViewLabels && (
                    <div>
                        <h4>
                            Labels assigned to {participant.person.shortName}:
                        </h4>
                        <ParticipantLabelInfo participantId={participant.id} />
                    </div>
                )}
                <h4>Comments:</h4>
                <CommentThread
                    commentThreadId={
                        participant.commentThread != null
                            ? participant.commentThread.id
                            : null
                    }
                    commentThreadSubject={participant.person.fullName}
                    entityId={participant.id}
                    entityType={EntityType.Participant}
                    commentThreadOpen={true}
                />
                <CommentThread
                    commentThreadId={
                        group.commentThread != null
                            ? group.commentThread.id
                            : null
                    }
                    commentThreadSubject={group.name}
                    entityId={group.id}
                    entityType={EntityType.Group}
                    commentThreadOpen={false}
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

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            commentThread: (entityId: number, entityType: EntityType) =>
                getCommentThread(state, entityId, entityType),
            coursePermissions: getCoursePermissions(state),
        }),
        {},
    )(ParticipantTableCell),
);
