import React, { Component } from "react";
import { connect } from "react-redux";

import { Dropdown, DropdownToggle, DropdownMenu } from "reactstrap";

import { LabelDto } from "../../../../api/types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Label from "../../../Label";
import {
    labelMappingCreateAction,
    LabelMappingCreateAction,
} from "../../../../state/labels/action";

interface LabelAddDropdownProps {
    assignedLabels: LabelDto[];
    allLabels: LabelDto[];
    participantId: number;
    className?: string;

    createLabelMapping: (
        participantdId: number,
        label: LabelDto,
    ) => LabelMappingCreateAction;
}

interface LabelAddDropdownState {
    dropdownOpen: boolean;
}

const initialState = {
    dropdownOpen: false,
};

/**
 * A dropdown component that is used for assigning labels to students.
 */
class LabelAddDropdown extends Component<
    LabelAddDropdownProps,
    LabelAddDropdownState
> {
    constructor(props: LabelAddDropdownProps) {
        super(props);
        this.state = initialState;
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown() {
        this.setState((state) => ({
            dropdownOpen: !state.dropdownOpen,
        }));
    }

    render() {
        const {
            allLabels,
            participantId,
            assignedLabels,
            className,
        } = this.props;

        // Determine which labels are still assignable to the student
        const assignableLabels: LabelDto[] = [];
        if (this.state.dropdownOpen) {
            allLabels.forEach((l) => {
                const label = assignedLabels.find((l2) => l2.id === l.id);
                if (label == null) {
                    assignableLabels.push(l);
                }
            });
        }

        return (
            <Dropdown
                className={`${className != null ? className : ""}`}
                isOpen={this.state.dropdownOpen}
                toggle={() => this.toggleDropdown()}
            >
                <DropdownToggle outline color="success" size="sm">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" size="sm" />
                    Add label
                </DropdownToggle>
                <DropdownMenu className="p-3">
                    {assignableLabels.length > 0 &&
                        assignableLabels.map((l) => (
                            <span
                                key={l.id}
                                className="cursor-pointer"
                                onClick={() =>
                                    this.props.createLabelMapping(
                                        participantId,
                                        l,
                                    )
                                }
                            >
                                <Label label={l} />
                            </span>
                        ))}
                    {assignableLabels.length === 0 && (
                        <small className="text-muted">
                            No labels to assign.
                        </small>
                    )}
                </DropdownMenu>
            </Dropdown>
        );
    }
}

export default connect(
    () => ({}),
    {
        createLabelMapping: labelMappingCreateAction,
    },
)(LabelAddDropdown);
