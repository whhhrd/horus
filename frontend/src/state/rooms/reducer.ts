import { Action } from "redux";
import { RoomsState } from "./types";
import {
    ROOMS_FETCH_REQUEST_SUCCEEDED_ACTION,
    ROOMS_FETCH_REQUESTED_ACTION,
    ROOM_OPEN_REQUEST_SUCCEEDED_ACTION,
    ROOM_CLOSE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import {
    RoomsFetchRequestSucceededAction,
    RoomOpenRequestSucceededAction,
    RoomCloseRequestSucceededAction,
} from "./action";

const initialState: RoomsState = {
    rooms: null,
};

export default function roomsReducer(
    state: RoomsState,
    action: Action,
): RoomsState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case ROOMS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                rooms: null,
            };
        case ROOMS_FETCH_REQUEST_SUCCEEDED_ACTION:
            const rooms = (action as RoomsFetchRequestSucceededAction).rooms;
            return {
                ...state,
                rooms,
            };
        case ROOM_OPEN_REQUEST_SUCCEEDED_ACTION:
            const room = (action as RoomOpenRequestSucceededAction).room;
            if (state.rooms == null) {
                return {
                    ...state,
                    rooms: [room],
                };
            } else {
                const newRooms = state.rooms.slice();
                newRooms.push(room);
                return {
                    ...state,
                    rooms: newRooms,
                };
            }
        case ROOM_CLOSE_REQUEST_SUCCEEDED_ACTION:
            const roomCode = (action as RoomCloseRequestSucceededAction)
                .roomCode;
            if (state.rooms != null) {
                const newRooms = state.rooms.slice();
                const roomToDelete = newRooms.find((r) => r.code === roomCode);
                if (roomToDelete != null) {
                    const roomToDeleteIndex = newRooms.indexOf(roomToDelete);
                    newRooms.splice(roomToDeleteIndex, 1);
                }
                return {
                    ...state,
                    rooms: newRooms,
                };
            } else {
                return state;
            }
        default:
            return state;
    }
}
