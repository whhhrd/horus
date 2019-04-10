import { authenticatedFetchJSON } from "../../api";
import { RoomDto } from "../../api/types";
import { call, put, takeEvery } from "redux-saga/effects";
import { notifyError } from "../notifications/constants";
import {
    RoomsFetchRequestedAction,
    roomsFetchRequestSucceededAction,
    RoomOpenRequestedAction,
    roomOpenRequestSucceededAction,
    RoomCloseRequestedAction,
    roomCloseRequestSucceededAction,
} from "./action";
import {
    ROOMS_FETCH_REQUESTED_ACTION,
    ROOM_OPEN_REQUESTED_ACTION,
    ROOM_CLOSE_REQUESTED_ACTION,
} from "./constants";

export function* getRooms(action: RoomsFetchRequestedAction) {
    try {
        const rooms: RoomDto[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `queuing/${action.courseId}/rooms`,
        );
        yield put(roomsFetchRequestSucceededAction(rooms));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* openRoom(action: RoomOpenRequestedAction) {
    try {
        const room: RoomDto = yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.courseId}/rooms`,
            null,
            action.roomCreate,
        );
        yield put(roomOpenRequestSucceededAction(room));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* closeRoom(action: RoomCloseRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `queuing/${action.courseId}/rooms/${action.roomCode}`,
        );
        yield put(roomCloseRequestSucceededAction(action.roomCode));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* roomsSagas() {
    yield takeEvery(ROOMS_FETCH_REQUESTED_ACTION, getRooms);
    yield takeEvery(ROOM_OPEN_REQUESTED_ACTION, openRoom);
    yield takeEvery(ROOM_CLOSE_REQUESTED_ACTION, closeRoom);
}
