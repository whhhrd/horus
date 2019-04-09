import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import {
    Row,
    Col,
    Button,
    Table,
    Input,
} from "reactstrap";
import { ParticipantDtoFull, LabelDto } from "../../../../api/types";
import { buildContent, centerSpinner, setPageTitle } from "../../../pagebuilder";
import { ApplicationState } from "../../../../state/state";
import Label from "../../../Label";
import { faPlus, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LabelCreateModal from "./LabelCreateModal";
import LabelEditModal from "./LabelEditModal";
import LabelDeleteModal from "./LabelDeleteModal";
import { getLabels } from "../../../../state/labels/selectors";
import {
    CourseRequestedAction,
    courseRequestedAction,
} from "../../../../state/courses/action";
import {
    CourseParticipantsFetchAction,
    courseParticipantsFetchAction,
} from "../../../../state/participants/actions";
import { getParticipants } from "../../../../state/participants/selectors";
import {
    labelMappingDeleteAction,
    LabelMappingDeleteAction,
    labelMappingCreateAction,
} from "../../../../state/labels/action";
import { getCoursePermissions } from "../../../../state/auth/selectors";
import CoursePermissions from "../../../../api/permissions";
import {
    canViewListLabels,
    labelAnyEdit,
    labelAnyDelete,
    labelAnyCreate,
    participantsAnyView,
    labelMappingAnyCreate,
    labelMappingAnyDelete,
} from "../../../../state/auth/constants";
import LabelAddDropdown from "./LabelAddDropdown";

interface LabelManagerProps {
    participants: ParticipantDtoFull[] | null;
    labels: LabelDto[] | null;
    permissions: CoursePermissions | null;

    fetchCourseParticipants: (
        courseId: number,
    ) => CourseParticipantsFetchAction;

    fetchCourse: (id: number) => CourseRequestedAction;

    deleteLabelMapping: (
        participantId: number,
        label: LabelDto,
    ) => LabelMappingDeleteAction;
}

interface LabelManagerState {
    createLabelModalOpen: boolean;

    editLabelModalOpen: boolean;
    labelToEdit: LabelDto | null;

    deleteLabelModalOpen: boolean;
    labelToDelete: LabelDto | null;

    searchQuery: string;
}

const initialState = {
    createLabelModalOpen: false,

    editLabelModalOpen: false,
    labelToEdit: null,

    deleteLabelModalOpen: false,
    labelToDelete: null,

    searchQuery: "",
};

class LabelManager extends Component<
    LabelManagerProps & RouteComponentProps<any>,
    LabelManagerState
> {
    static PAGE_TITLE = "Label Manager";
    constructor(props: LabelManagerProps & RouteComponentProps<any>) {
        super(props);
        this.state = initialState;
        this.toggleLabelCreatorModal = this.toggleLabelCreatorModal.bind(this);
        this.toggleLabelEditorModal = this.toggleLabelEditorModal.bind(this);
        this.toggleLabelDeleteModal = this.toggleLabelDeleteModal.bind(this);
    }

    componentDidMount() {
        this.props.fetchCourseParticipants(this.props.match.params.cid);
        this.props.fetchCourse(this.props.match.params.cid);

        setPageTitle(LabelManager.PAGE_TITLE);
    }

    render() {
        return buildContent(LabelManager.PAGE_TITLE, this.buildContent());
    }

    toggleLabelCreatorModal() {
        this.setState((state) => ({
            createLabelModalOpen: !state.createLabelModalOpen,
        }));
    }

    toggleLabelEditorModal(label: LabelDto | null) {
        this.setState((state) => ({
            labelToEdit: label,
            editLabelModalOpen: !state.editLabelModalOpen,
        }));
    }

    toggleLabelDeleteModal(label: LabelDto | null) {
        this.setState((state) => ({
            labelToDelete: label,
            deleteLabelModalOpen: !state.deleteLabelModalOpen,
        }));
    }

    buildContent() {
        const { participants, labels, permissions } = this.props;
        const cid = this.props.match.params.cid;

        if (labels == null || participants == null || permissions == null) {
            return null;
        }

        const canViewList = canViewListLabels.check(cid, permissions);
        const canAddLabel = labelAnyCreate.check(cid, permissions);
        const canEditLabel = labelAnyEdit.check(cid, permissions);
        const canDeleteLabel = labelAnyDelete.check(cid, permissions);
        const canListParticipants = participantsAnyView.check(cid, permissions);
        const canCreateMapping = labelMappingAnyCreate.check(cid, permissions);
        const canDeleteMapping = labelMappingAnyDelete.check(cid, permissions);

        return (
            <div>
                <Row className="px-2 d-flex justify-content-center">
                    {canViewList && (
                        <Col md="12" lg="6" className="border-bottom">
                            <h4>Course Labels</h4>
                            <div className="mb-3">
                                {this.buildCourseLabels(
                                    labels,
                                    canEditLabel,
                                    canDeleteLabel,
                                )}
                            </div>
                            {canAddLabel && (
                                <Button
                                    color="primary"
                                    outline
                                    className="mb-3"
                                    onClick={this.toggleLabelCreatorModal}
                                >
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="mr-2"
                                    />
                                    Create new label
                                </Button>
                            )}
                        </Col>
                    )}
                    {this.state.createLabelModalOpen && canAddLabel && (
                        <LabelCreateModal
                            courseId={cid}
                            isOpen={this.state.createLabelModalOpen}
                            onCloseModal={this.toggleLabelCreatorModal}
                        />
                    )}
                    {this.state.editLabelModalOpen &&
                        canEditLabel &&
                        this.state.labelToEdit != null && (
                            <LabelEditModal
                                courseId={cid}
                                label={this.state.labelToEdit}
                                isOpen={this.state.editLabelModalOpen}
                                onCloseModal={() =>
                                    this.toggleLabelEditorModal(null)
                                }
                            />
                        )}
                    {this.state.deleteLabelModalOpen &&
                        canDeleteLabel &&
                        this.state.labelToDelete != null && (
                            <LabelDeleteModal
                                isOpen={this.state.deleteLabelModalOpen}
                                courseId={cid}
                                labelId={this.state.labelToDelete.id}
                                onCloseModal={() =>
                                    this.toggleLabelDeleteModal(null)
                                }
                            />
                        )}
                </Row>
                {canListParticipants && (
                    <Row className="px-2 d-flex justify-content-center">
                        <Col md="12" lg="6" className="pt-3">
                            <h4>Assign labels to students</h4>
                            <Input
                                className="form-control-lg mb-3 mt-3"
                                placeholder="Student name/number... "
                                onInput={(e) => {
                                    // @ts-ignore
                                    this.onSearchQueryInput(e.target.value);
                                }}
                            />

                            <Table className="table-bordered mt-3">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>S-number</th>
                                        <th>Assigned labels</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderStudentRows(
                                        participants,
                                        labels,
                                        canCreateMapping,
                                        canDeleteMapping,
                                    )}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                )}
            </div>
        );
    }

    renderStudentRows(
        participants: ParticipantDtoFull[] | null,
        labels: LabelDto[],
        canDeleteMapping: boolean,
        canAddMapping: boolean,
    ) {
        const searchQuery = this.state.searchQuery;
        const studentRender = [];

        if (participants == null) {
            return (
                <Col lg="12" xs="12">
                    {centerSpinner()}
                </Col>
            );
        } else {
            for (const p of participants) {
                if (
                    p.role.name === "STUDENT" &&
                    (p.person.fullName.toLowerCase().includes(searchQuery) ||
                        p.person.loginId.includes(searchQuery))
                ) {
                    studentRender.push(
                        <tr key={p.id}>
                            <td>{p.person.fullName}</td>
                            <td>{p.person.loginId}</td>
                            <td>
                                {p.labels.map((l) => {
                                    const label = labels.find(
                                        (lab) => lab.id === l.id,
                                    );
                                    if (label != null) {
                                        return (
                                            <Label key={label.id} label={label}>
                                                {canDeleteMapping && (
                                                    <span
                                                        title="Delete label mapping"
                                                        className="ml-2 cursor-pointer"
                                                        onClick={() =>
                                                            this.props.deleteLabelMapping(
                                                                p.id,
                                                                l,
                                                            )
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTimes}
                                                        />
                                                    </span>
                                                )}
                                            </Label>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}
                                {canAddMapping && (
                                    <LabelAddDropdown
                                        allLabels={labels}
                                        assignedLabels={p.labels}
                                        participantId={p.id}
                                        className="float-right"
                                    />
                                )}
                            </td>
                        </tr>,
                    );
                }
            }
            return studentRender.slice(0, 15);
        }
    }

    buildCourseLabels(
        labels: LabelDto[],
        canEditLabel: boolean,
        canDeleteLabel: boolean,
    ) {
        const numberOfLabels = labels.length;

        if (numberOfLabels > 0) {
            return labels.map((l) => (
                <Label key={l.id} label={l}>
                    {canEditLabel && (
                        <span
                            title="Edit"
                            className="ml-2 cursor-pointer"
                            onClick={() => this.toggleLabelEditorModal(l)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </span>
                    )}
                    {canDeleteLabel && (
                        <span
                            title="Delete"
                            className="ml-2 cursor-pointer"
                            onClick={() => this.toggleLabelDeleteModal(l)}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </span>
                    )}
                </Label>
            ));
        } else {
            return (
                <small className="text-muted">This course has no labels</small>
            );
        }
    }

    private onSearchQueryInput(newValue: string) {
        this.setState(() => ({ searchQuery: newValue.toLowerCase() }));
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            labels: getLabels(state),
            participants: getParticipants(state),
            permissions: getCoursePermissions(state),
        }),
        {
            fetchCourse: courseRequestedAction,
            fetchCourseParticipants: courseParticipantsFetchAction,
            deleteLabelMapping: labelMappingDeleteAction,
            createLabelMapping: labelMappingCreateAction,
        },
    )(LabelManager),
);
