import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import { authenticatedFetchJSON } from "../../api";
import {
    SuppRoleMappingCreateAction,
    suppRoleMappingCreateSucceededAction,
    SuppRoleMappingDeleteAction,
    suppRoleMappingDeleteSucceededAction,
    SuppRolesFetchRequestedAction,
    suppRolesFetchRequestSucceededAction,
    SuppRolesMappingFetchRequestedAction,
    suppRolesMappingFetchRequestSucceededAction,
} from "./action";
import {
    SUPP_ROLES_MAPPING_CREATE_ACTION,
    SUPP_ROLES_MAPPING_DELETE_ACTION,
    SUPP_ROLES_FETCH_REQUESTED_ACTION,
    SUPP_ROLES_MAPPING_FETCH_REQUESTED_ACTION,
} from "./constants";
import {
    SupplementaryRoleDto,
    ParticipantSupplementaryRoleMappingDto,
} from "../../api/types";

export function* fetchSuppRoles(action: SuppRolesFetchRequestedAction) {
    const { courseId } = action;
    try {
        const result: SupplementaryRoleDto[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${courseId}/roles`,
        );
        yield put(suppRolesFetchRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchSuppRolesMapping(
    action: SuppRolesMappingFetchRequestedAction,
) {
    const { courseId } = action;
    try {
        const result: ParticipantSupplementaryRoleMappingDto[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${courseId}/supplementaryRoleMappings`,
        );
        yield put(suppRolesMappingFetchRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* createSuppRoleMapping(action: SuppRoleMappingCreateAction) {
    const { participantId, suppRole } = action;
    try {
        yield call(authenticatedFetchJSON, "POST", `roles`, {
            participantId,
            roleId: suppRole.id,
        });
        yield put(
            suppRoleMappingCreateSucceededAction(participantId, suppRole),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* deleteSuppRoleMapping(action: SuppRoleMappingDeleteAction) {
    const { participantId, suppRole } = action;
    try {
        yield call(authenticatedFetchJSON, "DELETE", `roles`, {
            participantId,
            roleId: suppRole.id,
        });
        yield put(
            suppRoleMappingDeleteSucceededAction(participantId, suppRole),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* rolesSagas() {
    yield takeEvery(SUPP_ROLES_MAPPING_CREATE_ACTION, createSuppRoleMapping);
    yield takeEvery(SUPP_ROLES_MAPPING_DELETE_ACTION, deleteSuppRoleMapping);
    yield takeEvery(SUPP_ROLES_FETCH_REQUESTED_ACTION, fetchSuppRoles);
    yield takeEvery(
        SUPP_ROLES_MAPPING_FETCH_REQUESTED_ACTION,
        fetchSuppRolesMapping,
    );
}
