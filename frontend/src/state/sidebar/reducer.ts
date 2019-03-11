import { SidebarPhoneState } from "./types";
import { Action } from "redux";
import { OPEN_PHONE_SIDEBAR, CLOSE_PHONE_SIDEBAR, TOGGLE_PHONE_SIDEBAR } from "./constants";

const initialState: SidebarPhoneState = {
    isOpen: false,
};

function sidebarPhoneReducer(state: SidebarPhoneState, action: Action): SidebarPhoneState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case OPEN_PHONE_SIDEBAR:
            return { isOpen: true };
        case CLOSE_PHONE_SIDEBAR:
            return { isOpen: false };
        case TOGGLE_PHONE_SIDEBAR:
            return { isOpen: !state.isOpen };
        default:
            return state;
    }
}

export default sidebarPhoneReducer;
