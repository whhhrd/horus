import { SupplementaryRoleDto } from "../../api/types";

export interface RolesState {
    suppRoles: SupplementaryRoleDto[] | null;

    // Mapping of Participant ID to supplementary role ID list
    suppRoleMapping: Map<number, number[]> | null;
}
