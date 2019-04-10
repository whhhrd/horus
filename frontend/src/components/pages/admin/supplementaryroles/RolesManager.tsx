import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import {
    Row,
    Col,
    Input,
    Table,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    Alert,
} from "reactstrap";
import {
    ParticipantDtoFull,
    SupplementaryRoleDto,
} from "../../../../api/types";
import { buildContent, centerSpinner } from "../../../pagebuilder";
import { ApplicationState } from "../../../../state/state";
import { getCoursePermissions } from "../../../../state/auth/selectors";
import CoursePermissions from "../../../../api/permissions";
import {
    SuppRolesFetchRequestedAction,
    suppRolesFetchRequestedAction,
    SuppRolesMappingFetchRequestedAction,
    suppRolesMappingFetchRequestedAction,
    SuppRoleMappingCreateAction,
    suppRoleMappingCreateAction,
    SuppRoleMappingDeleteAction,
    suppRoleMappingDeleteAction,
} from "../../../../state/roles/action";
import {
    getSuppRoles,
    getSuppRolesMapping,
} from "../../../../state/roles/selectors";
import {
    CourseStaffParticipantsFetchAction,
    courseStaffParticipantsFetchAction,
} from "../../../../state/participants/actions";
import { getStaffParticipants } from "../../../../state/participants/selectors";
import SuppRoleLabel from "./SuppRoleLabel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    suppRolesMappingAnyCreate,
    suppRolesMappingAnyDelete,
    suppRolesMappingAnyView,
    suppRoleAdmin,
} from "../../../../state/auth/constants";

interface RolesManagerProps {
    staff: ParticipantDtoFull[] | null;
    suppRoles: SupplementaryRoleDto[] | null;
    permissions: CoursePermissions | null;
    suppRolesMapping: (pid: number) => number[] | null;

    fetchSuppRoles: (courseId: number) => SuppRolesFetchRequestedAction;
    fetchSuppRolesMapping: (
        courseId: number,
    ) => SuppRolesMappingFetchRequestedAction;
    fetchCourseStaff: (courseId: number) => CourseStaffParticipantsFetchAction;

    createRoleMapping: (
        participantId: number,
        role: SupplementaryRoleDto,
    ) => SuppRoleMappingCreateAction;

    deleteRoleMapping: (
        participantId: number,
        role: SupplementaryRoleDto,
    ) => SuppRoleMappingDeleteAction;
}

interface RolesManagerState {
    searchQuery: string;

    dropdownOpen: boolean;
    dropdownElement: string;
}

const initialState = {
    searchQuery: "",

    dropdownOpen: false,
    dropdownElement: "",
};

class RolesManager extends Component<
    RolesManagerProps & RouteComponentProps<any>,
    RolesManagerState
> {
    constructor(props: RolesManagerProps & RouteComponentProps<any>) {
        super(props);
        this.state = initialState;
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    componentDidMount() {
        const { cid } = this.props.match.params;
        const isSuppRoleAdmin = suppRoleAdmin.check(
            cid,
            this.props.permissions!,
        );

        if (isSuppRoleAdmin) {
            this.props.fetchSuppRoles(cid);
            this.props.fetchSuppRolesMapping(cid);
            this.props.fetchCourseStaff(cid);
        }
    }

    render() {
        return buildContent("Roles Manager", this.buildContent());
    }

    buildContent() {
        const { suppRoles, staff, suppRolesMapping, permissions } = this.props;
        const cid = this.props.match.params.cid;

        const isSuppRoleAdmin = suppRoleAdmin.check(cid, permissions!);

        if (!isSuppRoleAdmin) {
            return undefined;
        } else if (suppRoles == null || staff == null) {
            return null;
        }

        return (
            <div>
                <Row className="px-2 d-flex justify-content-center">
                    <Col md="12" lg="6" className="border-bottom">
                        <h4>Course Roles</h4>
                        <div className="mb-3">
                            {this.buildSupplementaryRoles(suppRoles)}
                        </div>
                    </Col>
                </Row>
                <Row className="px-2 d-flex justify-content-center">
                    <Col md="12" lg="6" className="pt-3">
                        <h4>Assign roles to teaching staff</h4>
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
                                    <th>Assigned roles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderParticipantEntries(
                                    staff,
                                    suppRoles,
                                    suppRolesMapping,
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
        );
    }

    buildSupplementaryRoles(roles: SupplementaryRoleDto[]) {
        const numberOfRoles = roles.length;

        if (numberOfRoles > 0) {
            return roles.map((role) => (
                <SuppRoleLabel key={role.id} role={role} />
            ));
        } else {
            return (
                <small className="text-muted">
                    This course has no supplementary roles
                </small>
            );
        }
    }

    renderParticipantEntries(
        staff: ParticipantDtoFull[] | null,
        suppRoles: SupplementaryRoleDto[],
        suppRolesMapping: (pid: number) => number[] | null,
    ) {
        const searchQuery = this.state.searchQuery;
        const studentRender = [];

        const { permissions } = this.props;
        const cid = this.props.match.params.cid;

        const canAddMapping = suppRolesMappingAnyCreate.check(
            cid,
            permissions!,
        );

        const canDeleteMapping = suppRolesMappingAnyDelete.check(
            cid,
            permissions!,
        );

        const canViewMapping = suppRolesMappingAnyView.check(cid, permissions!);

        if (staff == null || suppRoles == null) {
            return (
                <Col lg="12" xs="12">
                    {centerSpinner()}
                </Col>
            );
        } else if (!canViewMapping) {
            return (
                <Alert color="danger">
                    You can not view the supplementary roles of others.
                </Alert>
            );
        } else {
            for (const p of staff) {
                const suppRoleIds = suppRolesMapping(p.id);
                if (
                    p.person.fullName.toLowerCase().includes(searchQuery) ||
                    p.person.loginId.includes(searchQuery)
                ) {
                    studentRender.push(
                        <tr key={p.id}>
                            <td>{p.person.fullName}</td>
                            <td>{p.person.loginId}</td>
                            <td>
                                {suppRoleIds != null &&
                                    suppRoleIds.length > 0 &&
                                    suppRoleIds.map((suppRoleId) => {
                                        const suppRole = suppRoles.find(
                                            (sr) => sr.id === suppRoleId,
                                        );
                                        if (suppRole != null) {
                                            return (
                                                <SuppRoleLabel
                                                    key={suppRole.id}
                                                    role={suppRole}
                                                >
                                                    {canDeleteMapping && (
                                                        <span
                                                            title="Delete role mapping"
                                                            className="ml-2 cursor-pointer"
                                                            onClick={() =>
                                                                this.props.deleteRoleMapping(
                                                                    p.id,
                                                                    suppRole,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTimes}
                                                            />
                                                        </span>
                                                    )}
                                                </SuppRoleLabel>
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}
                                {canAddMapping &&
                                    this.buildAddRoleDropdown(
                                        String(p.id),
                                        suppRoleIds != null ? suppRoleIds : [],
                                        suppRoles,
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

    toggleDropdown(id: string) {
        this.setState((state) => ({
            dropdownOpen: !state.dropdownOpen,
            dropdownElement: id,
        }));
    }

    buildAddRoleDropdown(
        id: string,
        assignedRoles: number[],
        allRoles: SupplementaryRoleDto[],
        participantId: number,
    ) {
        const assignableRoles: SupplementaryRoleDto[] = [];
        allRoles.forEach((r) => {
            const role = assignedRoles.find(
                (assignedRoleId) => assignedRoleId === r.id,
            );
            if (role == null) {
                assignableRoles.push(r);
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
                    Add role
                </DropdownToggle>
                <DropdownMenu className="p-3" persist>
                    {assignableRoles.length > 0 &&
                        assignableRoles.map((role) => (
                            <span
                                key={role.id}
                                className="cursor-pointer"
                                onClick={() =>
                                    this.props.createRoleMapping(
                                        participantId,
                                        role,
                                    )
                                }
                            >
                                <SuppRoleLabel className="w-100" role={role} />
                            </span>
                        ))}
                    {assignableRoles.length === 0 && (
                        <small className="text-muted">
                            No roles to assign.
                        </small>
                    )}
                </DropdownMenu>
            </Dropdown>
        );
    }

    private onSearchQueryInput(newValue: string) {
        this.setState(() => ({ searchQuery: newValue.toLowerCase() }));
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            permissions: getCoursePermissions(state),
            suppRoles: getSuppRoles(state),
            staff: getStaffParticipants(state),
            suppRolesMapping: (pid: number) => getSuppRolesMapping(state, pid),
        }),
        {
            fetchSuppRoles: suppRolesFetchRequestedAction,
            fetchSuppRolesMapping: suppRolesMappingFetchRequestedAction,
            fetchCourseStaff: courseStaffParticipantsFetchAction,
            createRoleMapping: suppRoleMappingCreateAction,
            deleteRoleMapping: suppRoleMappingDeleteAction,
        },
    )(RolesManager),
);
