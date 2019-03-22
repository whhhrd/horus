import { Action } from "redux";
import {
    SUPP_ROLES_MAPPING_CREATE_ACTION,
    SUPP_ROLES_MAPPING_CREATE_SUCCEEDED_ACTION,
    SUPP_ROLES_MAPPING_DELETE_ACTION,
    SUPP_ROLES_MAPPING_DELETE_SUCCEEDED_ACTION,
    SUPP_ROLES_FETCH_REQUESTED_ACTION,
    SUPP_ROLES_FETCH_REQUEST_SUCCEEDED_ACTION,
    SUPP_ROLES_MAPPING_FETCH_REQUESTED_ACTION,
    SUPP_ROLES_MAPPING_FETCH_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import { SupplementaryRoleDto, ParticipantSupplementaryRoleMappingDto } from "../../api/types";

// FETCH SUPP ROLES
export interface SuppRolesFetchRequestedAction extends Action<string> {
    courseId: number;
}

export interface SuppRolesFetchRequestSucceededAction extends Action<string> {
    suppRoles: SupplementaryRoleDto[];
}

export const suppRolesFetchRequestedAction = (courseId: number) => ({
    type: SUPP_ROLES_FETCH_REQUESTED_ACTION,
    courseId,
});

export const suppRolesFetchRequestSucceededAction = (
    suppRoles: SupplementaryRoleDto[],
) => ({
    type: SUPP_ROLES_FETCH_REQUEST_SUCCEEDED_ACTION,
    suppRoles,
});

// FETCH SUPP ROLES MAPPING
export interface SuppRolesMappingFetchRequestedAction extends Action<string> {
    courseId: number;
}

export interface SuppRolesMappingFetchRequestSucceededAction extends Action<string> {
    suppRolesMapping: ParticipantSupplementaryRoleMappingDto[];
}

export const suppRolesMappingFetchRequestedAction = (courseId: number) => ({
    type: SUPP_ROLES_MAPPING_FETCH_REQUESTED_ACTION,
    courseId,
});

export const suppRolesMappingFetchRequestSucceededAction = (
    suppRolesMapping: ParticipantSupplementaryRoleMappingDto[],
) => ({
    type: SUPP_ROLES_MAPPING_FETCH_REQUEST_SUCCEEDED_ACTION,
    suppRolesMapping,
});

// CREATE SUPP ROLE MAPPING
export interface SuppRoleMappingCreateAction extends Action<string> {
    participantId: number;
    suppRole: SupplementaryRoleDto;
}

export interface SuppRoleMappingCreateSucceededAction extends Action<string> {
    participantId: number;
    suppRole: SupplementaryRoleDto;
}

export const suppRoleMappingCreateAction = (
    participantId: number,
    suppRole: SupplementaryRoleDto,
) => ({
    type: SUPP_ROLES_MAPPING_CREATE_ACTION,
    participantId,
    suppRole,
});

export const suppRoleMappingCreateSucceededAction = (
    participantId: number,
    suppRole: SupplementaryRoleDto,
) => ({
    type: SUPP_ROLES_MAPPING_CREATE_SUCCEEDED_ACTION,
    participantId,
    suppRole,
});

// DELETE SUPP ROLE MAPPING
export interface SuppRoleMappingDeleteAction extends Action<string> {
    participantId: number;
    suppRole: SupplementaryRoleDto;
}

export interface SuppRoleMappingDeleteSucceededAction extends Action<string> {
    participantId: number;
    suppRole: SupplementaryRoleDto;
}

export const suppRoleMappingDeleteAction = (
    participantId: number,
    suppRole: SupplementaryRoleDto,
) => ({
    type: SUPP_ROLES_MAPPING_DELETE_ACTION,
    participantId,
    suppRole,
});

export const suppRoleMappingDeleteSucceededAction = (
    participantId: number,
    suppRole: SupplementaryRoleDto,
) => ({
    type: SUPP_ROLES_MAPPING_DELETE_SUCCEEDED_ACTION,
    participantId,
    suppRole,
});
