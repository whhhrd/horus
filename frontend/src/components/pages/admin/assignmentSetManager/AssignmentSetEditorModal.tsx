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
} from "../../../../state/types";
import {
    assignmentSetFetchRequestedAction,
    assignmentSetUpdateRequestedAction,
} from "../../../../state/assignments/actions";
import { groupSetsFetchRequestedAction } from "../../../../state/groups/actions";

import { getAssignmentSet } from "../../../../state/assignments/selectors";
import { getGroupSets } from "../../../../state/groups/selectors";
import { ApplicationState } from "../../../../state/state";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus, faArrowsAltV } from "@fortawesome/free-solid-svg-icons";
import ListGroupItem from "reactstrap/lib/ListGroupItem";

interface AssignmentSetEditorModalProps {
    isOpen: boolean;
    assignmentSetId: number;
    courseId: number;

    groupSets: GroupSetDtoBrief[] | null;

    fetchGroupSets: (courseId: number) => {
        type: string,
    };

    fetchAssignmentSet: (assignmentSetId: number) => {
        type: string,
    };

    updateAssignmentSet: (assignmentSetId: number, assignmentSetUpdateDto: AssignmentSetUpdateDto) => {
        type: string,
    };

    assignmentSet: (asid: number) => AssignmentSetDtoFull | null | undefined;

    onCloseModal: () => void;
}

interface AssignmentSetEditorModalState {
    name: string;
    assignmentValues: AssignmentValue[];
    assignedGroupSetDtoBriefs: GroupSetDtoBrief[];
    lastAssignmentId: number;
    dropdownOpen: boolean;
    newAssignmentId: number;
}

interface AssignmentValue {
    id: number;
    name: string;
}

class AssignmentSetEditorModal extends Component<AssignmentSetEditorModalProps, AssignmentSetEditorModalState> {

    constructor(props: AssignmentSetEditorModalProps) {
        super(props);
        this.state = {
            name: "",
            assignedGroupSetDtoBriefs: [],
            assignmentValues: [],
            lastAssignmentId: 0,
            dropdownOpen: false,
            newAssignmentId: -1,
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

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
                return { id: assignment.id, name: assignment.name };
            });

            // Add a fake assignment set for new entries
            assignmentValues.push({ id: -1, name: "" });

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
            this.createAssignmentListGroupItem(assignmentValue.id, assignmentValue.name));

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
            <Modal isOpen={this.props.isOpen} size="lg">
                <ModalHeader toggle={this.onCloseModal}>{`Edit ${this.state.name}`}</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Name</Label>
                        <Input valid={this.isNameValid()} key="name" defaultValue={this.state.name} onInput={(e) => {
                            // @ts-ignore
                            this.onNameInput(e.target.value);
                        }} />
                    </FormGroup>
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
                    <Button block size="md" color="danger" disabled outline onClick={this.onCloseModal}>Delete</Button>
                    <Button block size="md" color="secondary" outline onClick={this.onCloseModal}>Cancel</Button>
                    <Button disabled={!this.isFormValid()}
                        block size="md" color="primary" onClick={() => {
                            this.updateAssignmentSet();
                            this.onCloseModal();
                    }}>Save</Button>
                </ModalFooter>
            </Modal >
        );
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
    private createAssignmentListGroupItem(id: number, name: string) {
        const isNewAssignmentSetItem = id === this.state.newAssignmentId;
        const invisibleString = isNewAssignmentSetItem ? " invisible" : "";
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
                        className="" key={id} defaultValue={name} onInput={(e) => {
                            // @ts-ignore
                            const value = e.target.value;
                            this.onAssignmentInput(id, value);
                    }} />
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

    private onAssignmentInput(goalId: number, newValue: string) {
        const assignmentValues = [...(this.state.assignmentValues)];
        let lastAssignmentId = this.state.lastAssignmentId;
        let newAssignmentId = this.state.newAssignmentId;
        let index = 0;
        assignmentValues.forEach(({ id }) => {
            if (id === goalId) {
                assignmentValues[index] = { id, name: newValue };
            }
            index++;
        });

        if (assignmentValues[assignmentValues.length - 1].name.length > 0) {
            newAssignmentId = newAssignmentId - 1;
            const newAssignment = {id: newAssignmentId, name: ""};
            assignmentValues.push(newAssignment);
            lastAssignmentId = newAssignment.id;
        }

        this.setState(() => ({assignmentValues, lastAssignmentId, newAssignmentId}));
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
                assignments.push({ id, name: assignmentValue.name });
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
}), {
        fetchGroupSets: groupSetsFetchRequestedAction,
        fetchAssignmentSet: assignmentSetFetchRequestedAction,
        updateAssignmentSet: assignmentSetUpdateRequestedAction,
    })(AssignmentSetEditorModal);
