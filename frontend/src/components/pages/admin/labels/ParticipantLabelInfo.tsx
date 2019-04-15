import React, { Component } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";

import { Card, CardBody, Dropdown, DropdownToggle, Badge } from "reactstrap";

import { LabelDto, ParticipantDtoFull } from "../../../../api/types";
import {
    labelMappingCreateAction,
    LabelMappingCreateAction,
    LabelMappingDeleteAction,
    labelMappingDeleteAction,
} from "../../../../state/labels/action";
import { getParticipant } from "../../../../state/participants/selectors";
import { getLabels } from "../../../../state/labels/selectors";
import { ApplicationState } from "../../../../state/state";
import CoursePermissions from "../../../../api/permissions";
import { getCoursePermissions } from "../../../../state/auth/selectors";
import {
    labelMappingAnyDelete,
    labelMappingAnyCreate,
} from "../../../../state/auth/constants";
import {
    ParticipantsFetchAction,
    participantsFetchAction,
} from "../../../../state/participants/actions";
import {
    CourseRequestedAction,
    courseRequestedAction,
} from "../../../../state/courses/action";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import Label from "../../../Label";
import LabelAddDropdown from "./LabelAddDropdown";

interface ParticipantLabelInfoProps {
    participantId: number;
    permissions: CoursePermissions | null;
    labels: LabelDto[] | null;
    participant: (participantId: number) => ParticipantDtoFull | null;

    createLabelMapping: (
        participantdId: number,
        label: LabelDto,
    ) => LabelMappingCreateAction;
    deleteLabelMapping: (
        participantId: number,
        label: LabelDto,
    ) => LabelMappingDeleteAction;
    fetchParticipants: (participantIds: number[]) => ParticipantsFetchAction;
    fetchCourse: (id: number) => CourseRequestedAction;
}

/**
 * A component that displays the labels of a student. Permissible participants
 * can remove or add labels via this component (and child components).
 */
class ParticipantLabelInfo extends Component<
    ParticipantLabelInfoProps & RouteComponentProps<any>
> {
    componentDidMount() {
        this.props.fetchParticipants([this.props.participantId]);
        const { labels, fetchCourse } = this.props;

        if (labels == null) {
            fetchCourse(Number(this.props.match.params.cid));
        }
    }

    componentDidUpdate(
        prevProps: ParticipantLabelInfoProps & RouteComponentProps<any>,
    ) {
        const prevPid = prevProps.participantId;
        const currPid = this.props.participantId;
        if (prevPid !== currPid) {
            this.props.fetchParticipants([currPid]);
        }
    }

    render() {
        const { labels, participantId, permissions } = this.props;
        const participant = this.props.participant(participantId);
        const canDeleteMapping = labelMappingAnyDelete.check(
            this.props.match.params.cid,
            permissions!,
        );
        const canAddMapping = labelMappingAnyCreate.check(
            this.props.match.params.cid,
            permissions!,
        );

        if (participant == null || labels == null) {
            return this.buildPlaceholder();
        }

        return (
            <Card className="mb-3">
                <CardBody>
                    {participant != null && participant.labels.length > 0 ? (
                        participant.labels.map((l) => (
                            <Label key={l.id} label={l}>
                                {canDeleteMapping && (
                                    <span
                                        title="Delete label mapping"
                                        className="ml-2 cursor-pointer"
                                        onClick={() =>
                                            this.props.deleteLabelMapping(
                                                participantId,
                                                l,
                                            )
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </span>
                                )}{" "}
                            </Label>
                        ))
                    ) : (
                        <small className="text-muted">
                            This student has no labels assigned to them.
                        </small>
                    )}
                    {participant != null && labels != null && canAddMapping && (
                        <LabelAddDropdown
                            className="mt-2"
                            assignedLabels={participant.labels}
                            participantId={participant.id}
                            allLabels={labels}
                        />
                    )}
                </CardBody>
            </Card>
        );
    }

    /**
     * A placeholder builder for this component. Used for when data is not
     * available yet. Prevents the components above/below this component from
     * shifting around when data is not available yet.
     */
    buildPlaceholder() {
        return (
            <Card className="mb-3">
                <CardBody>
                    <Badge
                        pill
                        className="p-label mr-1 mb-1 py-1 px-2 shadow-sm"
                        color="primary"
                    >
                        {"Loading..."}
                    </Badge>
                    <Dropdown toggle={() => null}>
                        <DropdownToggle
                            disabled
                            outline
                            color="success"
                            size="sm"
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="mr-2"
                                size="sm"
                            />
                            Add label
                        </DropdownToggle>
                    </Dropdown>
                </CardBody>
            </Card>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            participant: (participantId: number) =>
                getParticipant(state, participantId),
            labels: getLabels(state),
            permissions: getCoursePermissions(state),
        }),
        {
            createLabelMapping: labelMappingCreateAction,
            deleteLabelMapping: labelMappingDeleteAction,
            fetchParticipants: participantsFetchAction,
            fetchCourse: courseRequestedAction,
        },
    )(ParticipantLabelInfo),
);
