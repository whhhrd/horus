import { ApplicationState } from "../state";

export const getSuppRoles = (state: ApplicationState) =>
    state.roles != null ? state.roles.suppRoles : null;

export const getSuppRolesMapping = (state: ApplicationState, pid: number) => {
    const mappings = state.roles != null ? state.roles.suppRoleMapping : null;
    if (mappings != null) {
        if (mappings.has(pid)) {
            return mappings.get(pid)!;
        } else {
            return null;
        }
    } else {
        return null;
    }
};
