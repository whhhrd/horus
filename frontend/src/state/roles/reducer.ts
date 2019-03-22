import { Action } from "redux";
import { RolesState } from "./types";
import {
    SUPP_ROLES_FETCH_REQUEST_SUCCEEDED_ACTION,
    SUPP_ROLES_FETCH_REQUESTED_ACTION,
    SUPP_ROLES_MAPPING_FETCH_REQUESTED_ACTION,
    SUPP_ROLES_MAPPING_FETCH_REQUEST_SUCCEEDED_ACTION,
    SUPP_ROLES_MAPPING_CREATE_SUCCEEDED_ACTION,
    SUPP_ROLES_MAPPING_DELETE_SUCCEEDED_ACTION,
} from "./constants";
import {
    SuppRolesFetchRequestSucceededAction,
    SuppRolesMappingFetchRequestSucceededAction,
    SuppRoleMappingCreateSucceededAction,
    SuppRoleMappingDeleteSucceededAction,
} from "./action";
import { ParticipantSupplementaryRoleMappingDto } from "../../api/types";

const initialState: RolesState = {
    suppRoles: null,
    suppRoleMapping: null,
};

export default function rolesReducer(
    state: RolesState,
    action: Action,
): RolesState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case SUPP_ROLES_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                suppRoles: null,
            };
        case SUPP_ROLES_FETCH_REQUEST_SUCCEEDED_ACTION:
            const suppRoles = (action as SuppRolesFetchRequestSucceededAction)
                .suppRoles;
            return {
                ...state,
                suppRoles,
            };
        case SUPP_ROLES_MAPPING_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                suppRoleMapping: null,
            };
        case SUPP_ROLES_MAPPING_FETCH_REQUEST_SUCCEEDED_ACTION: {
            const a = action as SuppRolesMappingFetchRequestSucceededAction;
            const mappings: ParticipantSupplementaryRoleMappingDto[] =
                a.suppRolesMapping;
            return {
                ...state,
                suppRoleMapping: listOfMappingsToMap(mappings),
            };
        }
        case SUPP_ROLES_MAPPING_CREATE_SUCCEEDED_ACTION: {
            const {
                participantId,
                suppRole,
            } = action as SuppRoleMappingCreateSucceededAction;

            if (state.suppRoleMapping == null) {
                const newMappings = new Map();
                newMappings.set(participantId, [suppRole.id]);

                return {
                    ...state,
                    suppRoleMapping: newMappings,
                };
            } else {
                // Shallow copy
                const newMappings = new Map(state.suppRoleMapping);
                if (newMappings.has(participantId)) {
                    const roleIds = newMappings.get(participantId)!.slice();
                    roleIds.push(suppRole.id);
                    newMappings.set(participantId, roleIds);
                } else {
                    newMappings.set(participantId, [suppRole.id]);
                }

                return {
                    ...state,
                    suppRoleMapping: newMappings,
                };
            }
        }

        case SUPP_ROLES_MAPPING_DELETE_SUCCEEDED_ACTION: {
            const {
                participantId,
                suppRole,
            } = action as SuppRoleMappingDeleteSucceededAction;

            if (state.suppRoleMapping == null) {
                return state;
            } else {
                // Shallow copy
                const newMappings = new Map(state.suppRoleMapping);
                if (newMappings.has(participantId)) {
                    const roleIds = newMappings.get(participantId)!.slice();
                    const roleIdIndex = roleIds.indexOf(suppRole.id);
                    roleIds.splice(roleIdIndex, 1);
                    newMappings.set(participantId, roleIds);
                }

                return {
                    ...state,
                    suppRoleMapping: newMappings,
                };
            }
        }

        default:
            return state;
    }
}

function listOfMappingsToMap(
    mappings: ParticipantSupplementaryRoleMappingDto[],
) {
    const rolesMap = new Map<number, number[]>();

    mappings.forEach((m: ParticipantSupplementaryRoleMappingDto) => {
        const pid = m.participantId;
        if (!rolesMap.has(pid)) {
            rolesMap.set(pid, [m.roleId]);
        } else {
            const roles = rolesMap.get(pid)!.slice();
            roles.push(m.roleId);
            rolesMap.set(pid, roles);
        }
    });

    return rolesMap;
}
