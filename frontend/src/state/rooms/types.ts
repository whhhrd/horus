import { RoomDto } from "../../api/types";

export interface RoomsState {
    rooms: RoomDto[] | null;
}
