import React, { Component, SyntheticEvent } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import queryString from "query-string";

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from "reactstrap";
import Autosuggest from "react-autosuggest";

import { AssignmentSetDtoBrief } from "../../../state/types";
import { ApplicationState } from "../../../state/state";
import { GroupAssignmentSetCombination } from "../../../state/search/types";

import {
    assignmentSetsFetchRequestedAction,
    AssignmentSetsFetchAction,
} from "../../../state/assignments/actions";
import {
    signOffSearchQueryAction,
    SignOffSearchQueryAction,
} from "../../../state/search/action";

import { getAssignmentSets } from "../../../state/assignments/selectors";
import { getSignOffSearchResults } from "../../../state/search/selectors";

interface SignOffSearchProps {
    searchQuery?: string;

    searchResult: GroupAssignmentSetCombination[] | null;
    assignmentSets: () => AssignmentSetDtoBrief[] | null;

    redirectTo: (url: string) => {};
    doSearchQuery: (
        courseID: number,
        query: string,
    ) => SignOffSearchQueryAction;
    fetchAssignmentSets: (courseID: number) => AssignmentSetsFetchAction;
}

interface SignOffSearchState {
    searchQuery: string;
    dropdownOpen: boolean;
    selectedAssignmentSet: AssignmentSetDtoBrief | null;
}

class SignOffSearch extends Component<
    SignOffSearchProps & RouteComponentProps<any>,
    SignOffSearchState
    > {
    constructor(props: SignOffSearchProps & RouteComponentProps<any>) {
        super(props);
        const { searchQuery } = this.props;
        this.state = {
            searchQuery: searchQuery != null ? searchQuery : "",
            dropdownOpen: false,
            selectedAssignmentSet: null,
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

    componentDidUpdate(prevProps: SignOffSearchProps) {
        const { searchQuery } = this.props;
        if (
            searchQuery !== prevProps.searchQuery &&
            this.state.searchQuery !== ""
        ) {
            this.setState({
                searchQuery: searchQuery != null ? searchQuery : "",
            });
        }
    }

    private renderAssignmentSetSelector() {
        const assignmentSetOptions = [];
        if (this.props.assignmentSets() != null) {
            for (const assignmentSet of this.props.assignmentSets()!) {
                assignmentSetOptions.push(
                    <DropdownItem
                        key={assignmentSet.id}
                        onClick={() => {
                            const groupId = Number(
                                queryString.parse(this.props.location.search).g,
                            );
                            const hasGroup = !isNaN(groupId) && groupId > 0;
                            this.pushURL(
                                this.props.match.params.cid,
                                assignmentSet.id,
                                hasGroup ? groupId : null,
                            );
                        }}
                    >
                        {assignmentSet.name}
                    </DropdownItem>,
                );
            }
        }
        const selectedAssignmentSet = this.getAssignmentSetByID(
            Number(queryString.parse(this.props.location.search).as!),
        );

        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                    {selectedAssignmentSet != null
                        ? selectedAssignmentSet.name
                        : "Select an assignment set"}
                </DropdownToggle>
                <DropdownMenu>{assignmentSetOptions}</DropdownMenu>
            </Dropdown>
        );
    }

    private renderSearchBar() {
        return (
            <Autosuggest
                suggestions={
                    this.props.searchResult != null
                        ? this.orderSearchResults(this.props.searchResult)
                        : []
                }
                onSuggestionsFetchRequested={(value: any) => {
                    this.props.doSearchQuery(
                        this.props.match.params.cid,
                        value.value,
                    );
                }}
                onSuggestionsClearRequested={() => {
                    return;
                }}
                getSuggestionValue={(
                    suggestion: GroupAssignmentSetCombination,
                ) => {
                    return suggestion.name;
                }}
                renderSuggestion={(
                    suggestion: GroupAssignmentSetCombination,
                ) => {
                    const assignmentSetString =
                        suggestion.assignmentSet.name + ": ";
                    let memberString: string;
                    if (suggestion.memberNames.length === 0) {
                        memberString = "";
                    } else {
                        memberString = " (";
                        memberString += suggestion.memberNames[0];
                        for (
                            let i = 1;
                            i < suggestion.memberNames.length;
                            i++
                        ) {
                            memberString += ", " + suggestion.memberNames[i];
                        }
                        memberString += ")";
                    }

                    const suggestionName =
                        assignmentSetString + suggestion.name + memberString;
                    if (suggestion.important) {
                        return (
                            <div>
                                <b>{suggestionName}</b>
                            </div>
                        );
                    } else {
                        return <div>{suggestionName}</div>;
                    }
                }}
                onSuggestionSelected={(_: any, suggestion: any) => {
                    if (suggestion == null) {
                        return;
                    }
                    const groupAssignmentSetCombination: GroupAssignmentSetCombination =
                        suggestion.suggestion;
                    this.pushURL(
                        this.props.match.params.cid,
                        groupAssignmentSetCombination.assignmentSet.id,
                        groupAssignmentSetCombination.id,
                    );
                }}
                inputProps={{
                    autoFocus: true,
                    onFocus: (e) => e.target.select(),
                    placeholder: "Input something",
                    value: this.state.searchQuery,
                    onChange: (_: SyntheticEvent, newValue: any) => {
                        this.setState(() => ({
                            searchQuery: newValue.newValue,
                        }));
                    },
                }}
            />
        );
    }

    private orderSearchResults(
        searchResult: GroupAssignmentSetCombination[],
    ): GroupAssignmentSetCombination[] {
        const asid = Number(queryString.parse(this.props.location.search).as!);
        if (!isNaN(asid) && asid > 0) {
            const bestResults: GroupAssignmentSetCombination[] = [];
            const otherResults: GroupAssignmentSetCombination[] = [];
            for (const groupAssignmentSetCombination of searchResult) {
                if (groupAssignmentSetCombination.assignmentSet.id === asid) {
                    bestResults.push({
                        ...groupAssignmentSetCombination,
                        important: true,
                    });
                } else {
                    otherResults.push(groupAssignmentSetCombination);
                }
            }
            return bestResults.concat(otherResults);
        } else {
            return searchResult;
        }
    }

    private getAssignmentSetByID(asid: number): AssignmentSetDtoBrief | null {
        if (asid != null && this.props.assignmentSets() != null) {
            for (const assignmentSet of this.props.assignmentSets()!) {
                if (assignmentSet.id === asid) {
                    return assignmentSet;
                }
            }
        }
        return null;
    }

    private pushURL(
        cid: number,
        asid: number | null,
        selectedGroupID: number | null,
    ) {
        let newURL: string = "/courses/" + cid + "/signoff";
        if (asid != null && selectedGroupID != null) {
            newURL += `?g=${selectedGroupID}&as=${asid}`;
        }
        this.props.redirectTo(newURL);
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            searchResult: getSignOffSearchResults(state),
            assignmentSets: () => getAssignmentSets(state),
        }),
        {
            doSearchQuery: (courseID: number, query: string) =>
                signOffSearchQueryAction(courseID, query),
            fetchAssignmentSets: assignmentSetsFetchRequestedAction,
            redirectTo: (url: string) => push(url),
        },
    )(SignOffSearch),
);
