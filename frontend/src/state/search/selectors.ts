import { ApplicationState } from "../state";

export const getSignOffSearchResults = (state: ApplicationState) => {
    return state.search != null ? state.search!.searchResult : undefined;
};
