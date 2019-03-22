import React, { Component, SyntheticEvent } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import queryString from "query-string";
import reactStringReplace from "react-string-replace";

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from "reactstrap";
import Autosuggest from "react-autosuggest";

import { AssignmentSetDtoBrief } from "../../../api/types";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks } from "@fortawesome/free-solid-svg-icons";

interface SignOffSearchProps {
    searchQuery?: string;

    searchResult: GroupAssignmentSetCombination[] | null;
    assignmentSets: () => AssignmentSetDtoBrief[] | null;

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
        this.setState((_) => ({ searchQuery: "" }));
        this.props.fetchAssignmentSets(this.props.match.params.cid);
    }

    render() {
        return (
            <div className="d-flex flex-row align-items-stretch h-100">
                <div className="flex-grow-1">{this.renderSearchBar()}</div>
                <div className="h-100">
                    {this.renderAssignmentSetSelector()}
                </div>
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
            <Dropdown
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
                className="h-100"
            >
                <span>
                    <DropdownToggle
                        color="primary"
                        outline
                        className="px-3 h-100"
                        caret
                    >
                        <span className="mr-2">
                            <FontAwesomeIcon icon={faTasks} />
                        </span>
                        <span className="d-none d-lg-inline">
                            {selectedAssignmentSet != null
                                ? selectedAssignmentSet.name
                                : "Select an assignment set"}
                        </span>
                    </DropdownToggle>
                </span>
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
                    return this.highlightSuggestion(
                        suggestionName,
                        suggestion.important,
                        this.state.searchQuery,
                    );
                }}
                onSuggestionSelected={(_: any, suggestion: any) => {
                    if (suggestion == null) {
                        return;
                    }
                    const groupAssignmentSetCombination: GroupAssignmentSetCombination =
                        suggestion.suggestion;
                    this.setState({ searchQuery: "" }, () => {
                        this.pushURL(
                            groupAssignmentSetCombination.assignmentSet.id,
                            groupAssignmentSetCombination.id,
                        );
                    });
                }}
                inputProps={{
                    autoFocus: true,
                    onFocus: (e) => e.target.select(),
                    placeholder: "Group number, student name/number",
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

    private highlightSuggestion(
        suggestionName: string,
        important: boolean | null,
        input: string,
    ) {
        const result = reactStringReplace(
            suggestionName,
            input,
            (match: string, i: number) => (
                <mark key={i} className="m-0 px-0">
                    {match}
                </mark>
            ),
        );

        if (important) {
            return <div className="font-weight-bold">{result}</div>;
        } else {
            return <div>{result}</div>;
        }
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
        asid: number | null,
        selectedGroupID: number | null,
    ) {
        const searchParams: string[] = [];

        if (asid != null) {
            searchParams.push(`as=${asid}`);
        }

        if (selectedGroupID != null) {
            searchParams.push(`g=${selectedGroupID}`);
        }

        const { location } = this.props.history;

        this.props.history.push({
            ...location,
            search: `?${searchParams.join("&")}`,
        });
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
        },
    )(SignOffSearch),
);
