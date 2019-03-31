import { ApplicationState } from "../state";

export const getRooms = (state: ApplicationState) =>
    state.rooms != null ? state.rooms.rooms : null;

export const getRoom = (state: ApplicationState, roomCode: string) => {
    if (state.rooms != null && state.rooms.rooms != null) {
        const room = state.rooms.rooms.find((r) => r.code === roomCode);
        return room != null ? room : null;
    } else {
        return null;
    }
};
