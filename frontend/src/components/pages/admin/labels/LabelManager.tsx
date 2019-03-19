import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import {
    Row,
    Col,
    Button,
    Table,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    Input,
} from "reactstrap";
// import { ParticipantsFetchAction } from "../../../../state/participants/actions";
import { ParticipantDtoFull, LabelDto } from "../../../../api/types";
import { buildContent, centerSpinner } from "../../../pagebuilder";
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
    LabelMappingCreateAction,
    labelMappingCreateAction,
} from "../../../../state/labels/action";

interface LabelManagerProps {
    participants: ParticipantDtoFull[] | null;
    labels: LabelDto[] | null;

    fetchCourseParticipants: (
        courseId: number,
    ) => CourseParticipantsFetchAction;

    fetchCourse: (id: number) => CourseRequestedAction;

    deleteLabelMapping: (
        participantId: number,
        label: LabelDto,
    ) => LabelMappingDeleteAction;

    createLabelMapping: (
        participantdId: number,
        label: LabelDto,
    ) => LabelMappingCreateAction;
}

interface LabelManagerState {
    createLabelModalOpen: boolean;

    editLabelModalOpen: boolean;
    labelToEdit: LabelDto | null;

    deleteLabelModalOpen: boolean;
    labelToDelete: LabelDto | null;

    dropdownOpen: boolean;
    dropdownElement: string;

    searchQuery: string;
}

const initialState = {
    createLabelModalOpen: false,

    editLabelModalOpen: false,
    labelToEdit: null,

    deleteLabelModalOpen: false,
    labelToDelete: null,

    dropdownOpen: false,
    dropdownElement: "",

    searchQuery: "",
};

class LabelManager extends Component<
    LabelManagerProps & RouteComponentProps<any>,
    LabelManagerState
> {
    constructor(props: LabelManagerProps & RouteComponentProps<any>) {
        super(props);
        this.state = initialState;
        this.toggleLabelCreatorModal = this.toggleLabelCreatorModal.bind(this);
        this.toggleLabelEditorModal = this.toggleLabelEditorModal.bind(this);
        this.toggleLabelDeleteModal = this.toggleLabelDeleteModal.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    componentDidMount() {
        this.props.fetchCourseParticipants(this.props.match.params.cid);
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        return buildContent("Label Manager", this.buildContent());
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
        const { participants, labels } = this.props;
        const courseId = this.props.match.params.cid;

        if (labels == null || participants == null) {
            return null;
        } else {
            return (
                <div>
                    <Row className="px-2 d-flex justify-content-center">
                        <Col md="12" lg="6" className="border-bottom">
                            <h4>Course Labels</h4>
                            <div>{this.buildCourseLabels(labels)}</div>
                            <Button
                                color="primary"
                                outline
                                className="mb-3 mt-3"
                                onClick={this.toggleLabelCreatorModal}
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="mr-2"
                                />
                                Create new label
                            </Button>
                        </Col>
                        {this.state.createLabelModalOpen && (
                            <LabelCreateModal
                                courseId={courseId}
                                isOpen={this.state.createLabelModalOpen}
                                onCloseModal={this.toggleLabelCreatorModal}
                            />
                        )}
                        {this.state.editLabelModalOpen &&
                            this.state.labelToEdit != null && (
                                <LabelEditModal
                                    courseId={courseId}
                                    label={this.state.labelToEdit}
                                    isOpen={this.state.editLabelModalOpen}
                                    onCloseModal={() =>
                                        this.toggleLabelEditorModal(null)
                                    }
                                />
                            )}
                        {this.state.deleteLabelModalOpen &&
                            this.state.labelToDelete != null && (
                                <LabelDeleteModal
                                    isOpen={this.state.deleteLabelModalOpen}
                                    courseId={courseId}
                                    labelId={this.state.labelToDelete.id}
                                    onCloseModal={() =>
                                        this.toggleLabelDeleteModal(null)
                                    }
                                />
                            )}
                    </Row>
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
                                    )}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderStudentRows(
        participants: ParticipantDtoFull[] | null,
        labels: LabelDto[],
    ) {
        const searchQuery = this.state.searchQuery;
        const studentRender = [];

        if (participants == null) {
            return (
                <Col lg="12" xs="12">
                    {centerSpinner()}
                </Col>
            );
        } else if (searchQuery === "") {
            return [];
        } else {
            for (const p of participants) {
                if (
                    p.role.name === "STUDENT" && (p.person.fullName.toLowerCase().includes(searchQuery) ||
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
                                            </Label>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}
                                {this.buildAddLabelDropdown(
                                    String(p.id),
                                    p.labels,
                                    labels,
                                    p.id,
                                )}
                            </td>
                        </tr>,
                    );
                }
            }
            return studentRender.slice(0, 15);
        }
    }

    buildAddLabelDropdown(
        id: string,
        assignedLabels: LabelDto[],
        allLabels: LabelDto[],
        participantId: number,
    ) {
        const assignableLabels: LabelDto[] = [];
        allLabels.forEach((l) => {
            const label = assignedLabels.find((l2) => l2.id === l.id);
            if (label == null) {
                assignableLabels.push(l);
            }
        });

        return (
            <Dropdown
                className="float-right"
                onSelect={() => null}
                isOpen={
                    this.state.dropdownOpen && this.state.dropdownElement === id
                }
                toggle={() => this.toggleDropdown(id)}
            >
                <DropdownToggle outline color="success" size="sm">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" size="sm" />
                    Add label
                </DropdownToggle>
                <DropdownMenu className="p-3" persist>
                    {assignableLabels.map((l) => (
                        <span key={l.id}
                            className="cursor-pointer"
                            onClick={() => this.props.createLabelMapping(participantId, l)}
                        >
                            <Label label={l} />
                        </span>
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    toggleDropdown(id: string) {
        this.setState((state) => ({
            dropdownOpen: !state.dropdownOpen,
            dropdownElement: id,
        }));
    }

    buildCourseLabels(labels: LabelDto[]) {
        const numberOfLabels = labels.length;

        if (numberOfLabels > 0) {
            return labels.map((l) => (
                <Label key={l.id} label={l}>
                    <span
                        title="Edit"
                        className="ml-2 cursor-pointer"
                        onClick={() => this.toggleLabelEditorModal(l)}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </span>
                    <span
                        title="Delete"
                        className="ml-2 cursor-pointer"
                        onClick={() => this.toggleLabelDeleteModal(l)}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </Label>
            ));
        } else {
            return <small className="muted">This course has no labels</small>;
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
        }),
        {
            fetchCourse: courseRequestedAction,
            fetchCourseParticipants: courseParticipantsFetchAction,
            deleteLabelMapping: labelMappingDeleteAction,
            createLabelMapping: labelMappingCreateAction,
        },
    )(LabelManager),
);
