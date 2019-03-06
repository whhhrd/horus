import React, { Component, SyntheticEvent } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ApplicationState } from "../../../state/state";
import Autosuggest from "react-autosuggest";
import { connect } from "react-redux";
import { NotificationProps } from "../../../state/notifications/types";
import { getSignOffSearchResults } from "../../../state/search/selectors";
import { signOffSearchQueryAction } from "../../../state/search/action";
import { push } from "connected-react-router";
import { GroupAssignmentSetCombination } from "../../../state/search/types";
import { assignmentSetsFetchRequestedAction } from "../../../state/assignments/actions";
import { getAssignmentSets } from "../../../state/assignments/selectors";
import { AssignmentSetDtoBrief } from "../../../state/types";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

interface SignOffSearchProps {
    searchResult: GroupAssignmentSetCombination[] | undefined;
    assignmentSets: () => AssignmentSetDtoBrief[] | null;
    doSearchQuery: (courseID: number, query: string) => {
        type: string,
    };
    fetchAssignmentSets: (courseID: number) => {
        type: string,
    };
    redirectTo: (url: string) => {};
}

interface SignOffSearchState {
    searchQuery: string;
    dropdownOpen: boolean;
    selectedAssignmentSet?: AssignmentSetDtoBrief;
}

class SignOffSearch extends Component<SignOffSearchProps & RouteComponentProps<any> & NotificationProps,
    SignOffSearchState> {

    constructor(props: SignOffSearchProps & RouteComponentProps<any> & NotificationProps) {
        super(props);

        this.state = {
            searchQuery: "",
            dropdownOpen: false,
        };
        this.toggle = this.toggle.bind(this);

    }

    toggle() {
        this.setState((state) => ({
            dropdownOpen: !state.dropdownOpen,
        }));
    }

    componentDidMount() {
        this.props.fetchAssignmentSets(this.props.match.params.cid);
    }

    render() {
        return (
            <div>
                {this.renderAssignmentSetSelector()}
                {this.renderSearchBar()}
            </div>
        );
    }

    private renderAssignmentSetSelector() {
        const assignmentSetOptions = [];
        if (this.props.assignmentSets() !== null) {
            for (const assignmentSet of this.props.assignmentSets()!) {
                assignmentSetOptions.push(
                    <DropdownItem key={assignmentSet.id}
                        onClick={() => {
                            this.pushURL(this.props.match.params.cid, assignmentSet.id);
                        }}>{assignmentSet.name}</DropdownItem>,
                );
            }
        }
        const selectedAssignmentSet = this.getAssignmentSetByID(Number(this.props.match.params.asid));
        return (
            <Dropdown isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
                className="p-4">
                <DropdownToggle caret>
                    {selectedAssignmentSet !== undefined ? selectedAssignmentSet.name : "Select an assignment set"}
                </DropdownToggle>
                <DropdownMenu>
                    {assignmentSetOptions}
                </DropdownMenu>
            </Dropdown>
        );
    }

    private renderSearchBar() {
        return (
            <Autosuggest
                suggestions={this.props.searchResult !== undefined
                    ? this.orderSearchResults(this.props.searchResult) : []}
                onSuggestionsFetchRequested={(value: any) => {
                    this.props.doSearchQuery(this.props.match.params.cid, value.value);
                }}
                onSuggestionsClearRequested={() => {
                    return;
                }}
                getSuggestionValue={(suggestion: GroupAssignmentSetCombination) => {
                    return suggestion.name;
                }}
                renderSuggestion={(suggestion: GroupAssignmentSetCombination) => {
                    const assignmentSetString = suggestion.assignmentSet.name + ": ";
                    let memberString: string;
                    if (suggestion.memberNames.length === 0) {
                        memberString = "";
                    } else {
                        memberString = " (";
                        memberString += suggestion.memberNames[0];
                        for (let i = 1; i < suggestion.memberNames.length; i++) {
                            memberString += ", " + suggestion.memberNames[i];
                        }
                        memberString += ")";
                    }

                    const suggestionName = assignmentSetString + suggestion.name + memberString;
                    if (suggestion.important) {
                        return (
                            <div><b>{suggestionName}</b></div>
                        );
                    } else {
                        return (
                            <div>{suggestionName}</div>
                        );
                    }
                }}
                onSuggestionSelected={(_: any, suggestion: any) => {
                    if (suggestion == null) {
                        return;
                    }
                    const groupAssignmentSetCombination: GroupAssignmentSetCombination = suggestion.suggestion;
                    this.pushURL(this.props.match.params.cid,
                        groupAssignmentSetCombination.assignmentSet.id,
                        groupAssignmentSetCombination.id);
                }}
                inputProps={{
                    placeholder: "Input something",
                    value: this.state.searchQuery,
                    onChange: (_: SyntheticEvent, newValue: any) => {
                        this.setState(() => ({ searchQuery: newValue.newValue }));
                    },
                }}
            />
        );
    }

    private orderSearchResults(searchResult: GroupAssignmentSetCombination[]): GroupAssignmentSetCombination[] {
        const asid = Number(this.props.match.params.asid);
        if (asid !== undefined) {
            const bestResults: GroupAssignmentSetCombination[] = [];
            const otherResults: GroupAssignmentSetCombination[] = [];
            for (const groupAssignmentSetCombination of searchResult) {
                if (groupAssignmentSetCombination.assignmentSet.id === asid) {
                    bestResults.push({ ...groupAssignmentSetCombination, important: true });
                } else {
                    otherResults.push(groupAssignmentSetCombination);
                }
            }
            return bestResults.concat(otherResults);
        } else {
            return searchResult;
        }
    }

    private getAssignmentSetByID(asid: number): (AssignmentSetDtoBrief | undefined) {
        if (asid !== undefined && this.props.assignmentSets() !== null) {
            for (const assignmentSet of this.props.assignmentSets()!) {
                if (assignmentSet.id === asid) {
                    return assignmentSet;
                }
            }
        }
        return undefined;
    }

    private pushURL(cid: number, asid?: number, selectedGroupID?: number) {
        let newURL: string;
        if (asid === undefined) {
            newURL = "/signoff";
        } else {
            newURL = "/courses/" + cid + "/assignmentsets/" + asid + "/signoff/table";
            if (selectedGroupID !== undefined) {
                newURL += "?g=" + selectedGroupID;
            }
        }
        this.props.redirectTo(newURL);
    }

}

export default withRouter(connect((state: ApplicationState) => ({
    searchResult: getSignOffSearchResults(state),
    assignmentSets: () => getAssignmentSets(state),
}), {
        doSearchQuery: (courseID: number, query: string) => signOffSearchQueryAction(courseID, query),
        fetchAssignmentSets: assignmentSetsFetchRequestedAction,
        redirectTo: (url: string) => push(url),
    })(SignOffSearch));
