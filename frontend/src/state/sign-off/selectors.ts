import { ApplicationState } from "../state";
import {SignOffInformation} from "./types";

export const getSignoffDetails = (state: ApplicationState) =>
    state.signOffs == null ? null : state.signOffs!.signOffs;

export const getAssignmentSet = (state: ApplicationState) =>
    getSignoffDetails(state) == null
        ? null
        : getSignoffDetails(state)!.assignmentSet;

export const getGroup = (state: ApplicationState) =>
    getSignoffDetails(state) == null ? null : getSignoffDetails(state)!.group;

export const getRemoteSignoffs = (state: ApplicationState) =>
    getSignoffDetails(state) == null
        ? null
        : getSignoffDetails(state)!.signOffs;

export const getSignOffHistory = (state: ApplicationState) => {
    if (state.signOffs == null || state.signOffs.signOffHistory == null) {
        return null;
    } else {
        const completeHistory: SignOffInformation[] = [];

        // First create a newHistoryElement for every sign-off event and put it in the completeHistory list
        state.signOffs.signOffHistory!.forEach((historyElement) => {
            if (historyElement.archivedAt != null) {
                const archivedHistoryElement: SignOffInformation = {
                    signedAt: new Date(historyElement.archivedAt),
                    signer: historyElement.archivedBy!,
                    type: "UNATTEMPTED",
                    student: historyElement.participant,
                    assignment: historyElement.assignment,
                };
                completeHistory.push(archivedHistoryElement);
            }
            const newHistoryElement: SignOffInformation = {
                signedAt: new Date(historyElement.signedAt),
                signer: historyElement.signer!,
                type: historyElement.result.toString(),
                student: historyElement.participant,
                assignment: historyElement.assignment,
            };
            completeHistory.push(newHistoryElement);
        });
        // Then remove the ones that are within 5 minutes of the previous entry
        const displayedHistory: SignOffInformation[] = [];
        for (let i = 0; i < completeHistory.length; i++) {
            if (i === 0) {
                displayedHistory.push(completeHistory[i]);
            } else {
                const currentEntry = completeHistory[i];
                const futureEntry = completeHistory[i - 1];
                if (futureEntry.signedAt.getTime() - currentEntry.signedAt.getTime() >= 300000) {
                    displayedHistory.push(currentEntry);
                }
            }
        }
        return displayedHistory;
    }
};
