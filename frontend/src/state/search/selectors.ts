import { ApplicationState } from "../state";

export const getSignOffSearchResults = (state: ApplicationState) => {
    return state.search != undefined ? state.search!.searchResult : null;
};
