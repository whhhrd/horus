import { Action } from "redux";

import {
    ROOMS_FETCH_REQUESTED_ACTION,
    ROOMS_FETCH_REQUEST_SUCCEEDED_ACTION,
    ROOM_OPEN_REQUESTED_ACTION,
    ROOM_OPEN_REQUEST_SUCCEEDED_ACTION,
    ROOM_CLOSE_REQUESTED_ACTION,
    ROOM_CLOSE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import { RoomDto, RoomCreateDto } from "../../api/types";

// FETCH ROOMS
export interface RoomsFetchRequestedAction extends Action<string> {
    courseId: number;
}

export interface RoomsFetchRequestSucceededAction extends Action<string> {
    rooms: RoomDto[];
}

export const roomsFetchRequestedAction = (courseId: number) => ({
    type: ROOMS_FETCH_REQUESTED_ACTION,
    courseId,
});

export const roomsFetchRequestSucceededAction = (rooms: RoomDto[]) => ({
    type: ROOMS_FETCH_REQUEST_SUCCEEDED_ACTION,
    rooms,
});

// OPEN ROOM
export interface RoomOpenRequestedAction extends Action<string> {
    courseId: number;
    roomCreate: RoomCreateDto;
}

export interface RoomOpenRequestSucceededAction extends Action<string> {
    room: RoomDto;
}

export const roomOpenRequestedAction = (
    courseId: number,
    roomCreate: RoomCreateDto,
) => ({
    type: ROOM_OPEN_REQUESTED_ACTION,
    courseId,
    roomCreate,
});

export const roomOpenRequestSucceededAction = (room: RoomDto) => ({
    type: ROOM_OPEN_REQUEST_SUCCEEDED_ACTION,
    room,
});

// CLOSE ROOM
export interface RoomCloseRequestedAction extends Action<string> {
    courseId: number;
    roomCode: string;
}

export interface RoomCloseRequestSucceededAction extends Action<string> {
    roomCode: string;
}

export const roomCloseRequestedAction = (courseId: number, roomCode: string) => ({
    type: ROOM_CLOSE_REQUESTED_ACTION,
    courseId,
    roomCode,
});

export const roomCloseRequestSucceededAction = (roomCode: string) => ({
    type: ROOM_CLOSE_REQUEST_SUCCEEDED_ACTION,
    roomCode,
});
