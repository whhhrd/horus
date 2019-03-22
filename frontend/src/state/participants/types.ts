import { ParticipantDtoFull } from "../../api/types";

export interface ParticipantsState {
    participants: ParticipantDtoFull[] | null;
    staff: ParticipantDtoFull[] | null;
}
