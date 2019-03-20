import React, { Component } from "react";
import {
    Input,
    Button,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label,
    Badge,
    FormGroup,
    Dropdown,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from "reactstrap";

import { connect } from "react-redux";

import ReactSortable from "react-sortablejs";

import {
    AssignmentCreateUpdateDto,
    AssignmentSetDtoFull,
    AssignmentSetUpdateDto,
    GroupSetDtoBrief,
    AssignmentDtoBrief,
} from "../../../../api/types";
import {
    assignmentSetFetchRequestedAction,
    assignmentSetUpdateRequestedAction,
    assignmentsDeleteCheckRequestedAction,
    resetDeleteCheckAction,
    assignmentSetDeleteRequestedAction,
} from "../../../../state/assignments/actions";
import { groupSetsFetchRequestedAction } from "../../../../state/groups/actions";

import { getAssignmentSet, getDeleteWarnings, getDeleteOK } from "../../../../state/assignments/selectors";
import { getGroupSets } from "../../../../state/groups/selectors";
import { ApplicationState } from "../../../../state/state";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faPlus,
    faArrowsAltV,
    faFlag,
} from "@fortawesome/free-solid-svg-icons";
import ListGroupItem from "reactstrap/lib/ListGroupItem";
import { AssignmentValue } from "../../../../state/assignments/types";
import ButtonGroup from "reactstrap/lib/ButtonGroup";

interface AssignmentSetEditorModalProps {
    isOpen: boolean;
    assignmentSetId: number;
    courseId: number;
    canDelete: boolean;

    groupSets: GroupSetDtoBrief[] | null;

    deleteWarning: AssignmentValue[] | null;

    deleteOK: boolean;

    canSeeGroups: boolean;

    fetchGroupSets: (courseId: number) => {
        type: string,
    };

    fetchAssignmentSet: (assignmentSetId: number) => {
        type: string,
    };

    updateAssignmentSet: (assignmentSetId: number, assignmentSetUpdateDto: AssignmentSetUpdateDto) => {
        type: string,
    };

    assignmentSet: (asid: number) => AssignmentSetDtoFull | null;

    onCloseModal: () => void;

    checkDelete: (assignments: AssignmentValue[]) => {
        type: string,
    };
    deleteAssignmentSet: (asid: number) => {
        type: string,
    };
    resetDeleteCheck: () => {
        type: string;
    };
}

interface AssignmentSetEditorModalState {
    name: string;
    assignmentValues: AssignmentValue[];
    assignedGroupSetDtoBriefs: GroupSetDtoBrief[];
    lastAssignmentId: number;
    dropdownOpen: boolean;
    newAssignmentId: number;
    isDeletingAssignments: boolean;
    isDeletingSet: boolean;
    isDeleteOpen: boolean;
}

class AssignmentSetEditorModal extends Component<AssignmentSetEditorModalProps, AssignmentSetEditorModalState> {

    /**
     * Updates this component's own state when the props have been updated due to fetching
     * data when the component has mounted. See {@linkcode componentDidMount} for the fetching procedure.
     */
    // tslint:disable-next-line: member-ordering
    static getDerivedStateFromProps(props: AssignmentSetEditorModalProps, state: AssignmentSetEditorModalState) {

        if (props.assignmentSet(props.assignmentSetId) != null &&
            state.assignmentValues.length === 0 &&
            props.assignmentSet(props.assignmentSetId)!.id === props.assignmentSetId) {

            // Fill already existing assignment values into the form
            const assignmentValues = props.assignmentSet(props.assignmentSetId)!.assignments.map((assignment) => {
                return { id: assignment.id, name: assignment.name, milestone: assignment.milestone };
            });

            // Add a fake assignment set for new entries
            assignmentValues.push({ id: -1, name: "", milestone: false });

            // Fill already assigned groupsets into the form
            const assignedGroupSetDtoBriefs: GroupSetDtoBrief[] = [];
            props.assignmentSet(props.assignmentSetId)!.groupSetMappings.forEach((mapping) => {
                assignedGroupSetDtoBriefs.push(mapping.groupSet);
            });

            // Update the state with the Assignment Set data
            return ({
                ...state,
                name: props.assignmentSet(props.assignmentSetId)!.name,
                assignmentValues,
                assignedGroupSetDtoBriefs,
                lastAssignmentId: assignmentValues[assignmentValues.length - 1].id,
            });
        } else {
            return state;
        }
    }

    constructor(props: AssignmentSetEditorModalProps) {
        super(props);
        this.state = {
            name: "",
            assignedGroupSetDtoBriefs: [],
            assignmentValues: [],
            lastAssignmentId: 0,
            dropdownOpen: false,
            newAssignmentId: -1,
            isDeletingAssignments: false,
            isDeletingSet: false,
            isDeleteOpen: false,
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    onCloseModal() {
        this.props.onCloseModal();
    }

    componentDidMount() {
        // Fetch the data of the assignment set
        this.props.fetchGroupSets(this.props.courseId);
        this.props.fetchAssignmentSet(this.props.assignmentSetId);
    }

    render() {
        if (this.state.assignmentValues == null ||
            this.props.groupSets == null ||
            this.props.assignmentSet == null) {
            return null;
        }

        const assignmentTextBoxes = this.state.assignmentValues.map((assignmentValue: AssignmentValue) =>
            this.createAssignmentListGroupItem(assignmentValue.id, assignmentValue.name, assignmentValue.milestone));

        const assignedGroupsBadges: JSX.Element[] = this.state.assignedGroupSetDtoBriefs.map((groupSet) => {
            return (
                <Badge key={groupSet.id} color="primary" size="lg" className="p-2 mr-2 mb-2">
                    <big>{groupSet.name} <span className="ml-2 cursor-pointer" onClick={() => {
                        this.deleteGroupSet(groupSet.id);
                    }}>
                        <FontAwesomeIcon icon={faTimes} /></span>
                    </big>
                </Badge>
            );
        });

        const unassignedGroupsDropdownItems: JSX.Element[] = [];
        this.props.groupSets.forEach((groupSet) => {
            for (const assignedGroupSet of this.state.assignedGroupSetDtoBriefs) {
                if (assignedGroupSet.id === groupSet.id) {
                    return;
                }
            }
            unassignedGroupsDropdownItems.push(<DropdownItem
                key={groupSet.id}
                onClick={() => this.addGroupSet(groupSet.id)}
            >{groupSet.name}</DropdownItem>);
        });

        if (unassignedGroupsDropdownItems.length === 0) {
            unassignedGroupsDropdownItems.push(
                <DropdownItem
                    key={-1}
                    disabled
                >
                    No groups to add
                </DropdownItem>,
            );
        }

        return (
            <div>
                <Modal isOpen={this.props.isOpen} size="lg">
                    <ModalHeader toggle={this.onCloseModal}>{`Edit ${this.state.name}`}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>Name</Label>
                            <Input valid={this.isNameValid()} key="name"
                                defaultValue={this.state.name} onInput={(e) => {
                                    // @ts-ignore
                                    this.onNameInput(e.target.value);
                                }} />
                        </FormGroup>
                        {this.props.canSeeGroups &&
                            <FormGroup>
                                <Label>Linked group sets</Label>
                                {assignedGroupsBadges}
                                <Dropdown className="mt-2"
                                    isOpen={this.state.dropdownOpen}
                                    toggle={this.toggleDropDown}
                                    size="sm">
                                    <DropdownToggle
                                        color="success" outline>
                                        <big>Add group set<FontAwesomeIcon icon={faPlus} className="ml-2" /></big>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {unassignedGroupsDropdownItems}
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                        }
                        <FormGroup>
                            <Label>Assignments</Label>
                            <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                                <ReactSortable
                                    tag="list-group"
                                    options={{ animation: 100, easing: "cubic-bezier(1, 0, 0, 1)" }}
                                    onChange={
                                        // @ts-ignore
                                        (order, sortable, evt) => this.reorder(order)}>
                                    {assignmentTextBoxes}
                                </ReactSortable>
                            </div>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        {this.props.canDelete &&
                            <Button block size="md" color="danger" outline onClick={() => {
                                this.safeDeleteSet();
                            }}>Delete</Button>
                        }
                        <Button block size="md" color="secondary" outline onClick={this.onCloseModal}>Cancel</Button>
                        <Button disabled={!this.isFormValid()}
                            block size="md" color="primary" onClick={() => {
                                this.safeDelete();
                            }}>Save</Button>
                    </ModalFooter>
                </Modal >
                {this.deleteModal()}
            </div>
        );
    }
    componentDidUpdate() {
        // Was there a delete check which resulted in no warnings?
        if (this.props.deleteOK && this.props.deleteWarning != null && this.props.deleteWarning.length === 0) {
            // In that case, it is save to delete without a warning.
            if (this.state.isDeletingAssignments) {
                this.setState((_) => ({
                    isDeletingAssignments: false,
                }));
                this.updateAssignmentSet();
            } else if (this.state.isDeletingSet) {
                this.setState((_) => ({
                    isDeletingSet: false,
                }));
                this.props.deleteAssignmentSet(this.props.assignmentSetId);
            }
            this.props.resetDeleteCheck();
            this.onCloseModal();
        }

    }
    private safeDeleteSet() {
        this.setState((_) => ({
            isDeletingSet: true,
            isDeleteOpen: true,
        }));
        this.props.checkDelete(this.props.assignmentSet(this.props.assignmentSetId)!
            .assignments.map((assignment: AssignmentDtoBrief) => ({
                name: assignment.name,
                id: assignment.id,
                milestone: assignment.milestone,
            })));
    }
    private safeDelete() {
        const deletedAssignments: AssignmentDtoBrief[] = this.props.assignmentSet(this.props.assignmentSetId)!
            .assignments.filter((assignment: AssignmentDtoBrief) => (
                !this.state.assignmentValues.some((localAssignment: AssignmentValue) => (
                    localAssignment.id === assignment.id
                ))
            ));
        this.setState((_) => ({
            isDeletingAssignments: true,
            isDeleteOpen: true,
        }));
        this.props.checkDelete(deletedAssignments);
    }
    private deleteModal() {
        // If a delete check was done and it is dangerous to do a deletion
        if (this.props.deleteOK && this.props.deleteWarning != null && this.props.deleteWarning.length !== 0) {
            // Dangerous to delete, display modal
            return (<Modal isOpen={this.state.isDeleteOpen}>
                <ModalHeader>Are you sure?</ModalHeader>
                <p style={{ padding: "20px" }}>The following assignments you are about to delete contain sign-offs.
                    Are you sure you want to delete them?</p>
                <ul style={{ maxHeight: "500px", overflowY: "scroll" }}>
                    {this.props.deleteWarning.map((assignment: AssignmentValue) => (
                        <li key={assignment.id}>
                            {assignment.name}
                        </li>
                    ))}
                </ul>
                <ButtonGroup>
                    <Button color="danger" onClick={() => {
                        if (this.state.isDeletingAssignments) {
                            this.setState((_) => ({
                                isDeletingAssignments: false,
                            }));
                            this.updateAssignmentSet();
                        } else if (this.state.isDeletingSet) {
                            this.setState((_) => ({
                                isDeletingSet: false,
                            }));
                            this.props.deleteAssignmentSet(this.props.assignmentSetId);
                        }
                        this.props.resetDeleteCheck();
                        this.onCloseModal();
                    }}>OK</Button>
                    <Button onClick={() => {
                        this.onCloseModal();
                    }}>Cancel</Button>
                </ButtonGroup>
            </Modal>);

        }
        return null;
    }
    private isNameValid(): boolean {
        return this.state.name.trim().length > 0;
    }

    private isAssignmentValid(id: number | null, name: string): boolean {
        return (id == null || id < 0) || name.trim().length > 0;
    }

    private isFormValid(): boolean {
        return this.isNameValid() && this.state.assignmentValues.every((a) => this.isAssignmentValid(a.id, a.name));
    }

    private toggleDropDown() {
        this.setState((state) => {
            return { dropdownOpen: !state.dropdownOpen };
        });
    }
    // TODO: to be reworked later
    private createAssignmentListGroupItem(id: number, name: string, milestone: boolean) {
        const isNewAssignmentSetItem = id === this.state.newAssignmentId;
        const invisibleString = isNewAssignmentSetItem ? " invisible" : "";

        const milestoneButtonClassName = milestone ? "rounded bg-primary text-white" : "rounded";
        const milestoneButtonTooltip = milestone ? "Remove milestone from assignment" : "Add milestone to assignment";
        const textboxClassName = milestone ? "milestone-textbox" : "";

        return (
            <ListGroupItem className="border-0 p-1" key={id} data-id={id}>
                <InputGroup>
                    <InputGroupAddon
                        disabled={isNewAssignmentSetItem}
                        addonType="prepend"
                        className={`cursor-move mr-2${invisibleString}`}>
                        <InputGroupText
                            className="border-0 rounded bg-secondary text-white">
                            <FontAwesomeIcon icon={faArrowsAltV} />
                        </InputGroupText>
                    </InputGroupAddon>
                    <Input
                        valid={!(id < 0 && name === "") && this.isAssignmentValid(id, name)}
                        className={textboxClassName} key={id} defaultValue={name} onInput={(e) => {
                            // @ts-ignore
                            const value = e.target.value;
                            this.onAssignmentInput(id, value);
                        }} />

                    <InputGroupAddon title={milestoneButtonTooltip}
                                     className={`ml-2${invisibleString}`}
                                     addonType="append">
                        <Button disabled={isNewAssignmentSetItem}
                            onClick={() => this.setMilestone(id, !milestone) }
                            outline color={"primary"}
                            className={milestoneButtonClassName}
                            tabIndex={-1} >
                            <FontAwesomeIcon icon={faFlag} />
                        </Button>
                    </InputGroupAddon>

                    <InputGroupAddon className={`ml-2${invisibleString}`}
                        addonType="append">
                        <InputGroupText disabled={isNewAssignmentSetItem}
                            onClick={() => { this.removeAssignmentValue(id); }}
                            className="border-0 rounded bg-danger text-white cursor-pointer">
                            <FontAwesomeIcon icon={faTimes} />
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            </ListGroupItem>
        );
    }

    private onNameInput(newValue: string) {
        this.setState((_) => ({ name: newValue }));
    }

    private addGroupSet(id: number) {
        this.props.groupSets!.forEach((groupSet) => {
            if (groupSet.id === id) {
                const newAssignedGroupSetDtoBriefs = this.state.assignedGroupSetDtoBriefs.slice(); // Copy the array
                newAssignedGroupSetDtoBriefs.push(groupSet);
                this.setState((_) => ({ assignedGroupSetDtoBriefs: newAssignedGroupSetDtoBriefs }));
                return;
            }
        });
    }

    private deleteGroupSet(id: number) {
        const newAssignedGroupSetDtoBriefs: GroupSetDtoBrief[] = this.state.assignedGroupSetDtoBriefs.slice();
        for (const groupSet of newAssignedGroupSetDtoBriefs) {
            if (groupSet.id === id) {
                const index = newAssignedGroupSetDtoBriefs.indexOf(groupSet);
                newAssignedGroupSetDtoBriefs.splice(index, 1);
                this.setState((_) => ({ assignedGroupSetDtoBriefs: newAssignedGroupSetDtoBriefs }));
                return;
            }
        }
    }

    private setMilestone(goalId: number, milestone: boolean) {
        const newAssignmentValues = this.state.assignmentValues.slice();
        const assignment = newAssignmentValues.find((a) => (a.id === goalId));
        if (assignment != null) {
            assignment.milestone = milestone;
            newAssignmentValues[newAssignmentValues.indexOf(assignment)] = assignment;
            this.setState(() => ({ assignmentValues: newAssignmentValues }));
        }
    }

    private onAssignmentInput(goalId: number, newValue: string) {
        const assignmentValues = [...(this.state.assignmentValues)];
        let lastAssignmentId = this.state.lastAssignmentId;
        let newAssignmentId = this.state.newAssignmentId;
        let index = 0;
        assignmentValues.forEach(({ id, milestone }) => {
            if (id === goalId) {
                assignmentValues[index] = { id, name: newValue, milestone };
            }
            index++;
        });

        if (assignmentValues[assignmentValues.length - 1].name.length > 0) {
            newAssignmentId = newAssignmentId - 1;
            const newAssignment = { id: newAssignmentId, name: "", milestone: false };
            assignmentValues.push(newAssignment);
            lastAssignmentId = newAssignment.id;
        }

        this.setState(() => ({ assignmentValues, lastAssignmentId, newAssignmentId }));
    }

    private removeAssignmentValue(goalId: number) {
        const newAssignmentValues: AssignmentValue[] = this.state.assignmentValues.slice();
        let index = 0;
        newAssignmentValues.forEach(({ id }) => {
            if (id === goalId) {
                newAssignmentValues.splice(index, 1);
                this.setState((_) => ({ assignmentValues: newAssignmentValues }));
                return;
            }
            index++;
        });
    }

    // // HERE2
    private reorder(order: string[]) {
        const unsortedList = this.state.assignmentValues.slice();
        unsortedList.sort((as1, as2) => {
            const oneOfTheTwoIsNewAssignment =
                (as1.id === this.state.newAssignmentId || as2.id === this.state.newAssignmentId);
            return (
                order.indexOf(String(as1.id)) > order.indexOf(String(as2.id)) && !oneOfTheTwoIsNewAssignment ? 1 : -1);
        });
        this.setState(() => ({ assignmentValues: unsortedList }));
    }

    private updateAssignmentSet() {
        const assignments: AssignmentCreateUpdateDto[] = [];

        this.state.assignmentValues.forEach((assignmentValue: AssignmentValue) => {
            let id: number | null;

            if (assignmentValue.id < 0) {
                id = null;
            } else {
                id = assignmentValue.id;
            }

            if (id != null || assignmentValue.name.trim().length > 0) {
                assignments.push({ id, name: assignmentValue.name, milestone: assignmentValue.milestone });
            }
        });

        const groupSetIds: number[] = this.state.assignedGroupSetDtoBriefs.map((groupSet) => groupSet.id);

        const assignmentSetUpdateDto: AssignmentSetUpdateDto = {
            assignments,
            name: this.state.name,
            groupSetIds,
        };

        this.props.updateAssignmentSet(this.props.assignmentSetId, assignmentSetUpdateDto);
    }
}

export default connect((state: ApplicationState) => ({
    groupSets: getGroupSets(state),
    assignmentSet: (asid: number) => getAssignmentSet(state, asid),
    deleteWarning: getDeleteWarnings(state),
    deleteOK: getDeleteOK(state),
}), {
        fetchGroupSets: groupSetsFetchRequestedAction,
        fetchAssignmentSet: assignmentSetFetchRequestedAction,
        updateAssignmentSet: assignmentSetUpdateRequestedAction,
        checkDelete: assignmentsDeleteCheckRequestedAction,
        resetDeleteCheck: resetDeleteCheckAction,
        deleteAssignmentSet: assignmentSetDeleteRequestedAction,
    })(AssignmentSetEditorModal);
