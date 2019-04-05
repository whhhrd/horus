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
    Button,
} from "reactstrap";
import Autosuggest from "react-autosuggest";

import {
    AssignmentSetDtoBrief,
    AssignmentGroupSetsMappingDto,
    GroupDtoFull,
} from "../../../api/types";
import { ApplicationState } from "../../../state/state";
import {
    GroupAssignmentSetCombination,
    GroupAssignmentSetSection,
} from "../../../state/search/types";

import {
    assignmentSetsFetchRequestedAction,
    AssignmentSetsFetchAction,
    AssignmentGroupSetMappingFetchRequestedAction,
    assignmentGroupSetsMappingsFetchRequestedAction,
} from "../../../state/assignments/actions";
import {
    signOffSearchQueryAction,
    SignOffSearchQueryAction,
} from "../../../state/search/action";

import {
    getAssignmentSets,
    getAssignmentGroupSetsMappingDtos,
} from "../../../state/assignments/selectors";
import { getSignOffSearchResults } from "../../../state/search/selectors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTasks,
    faArrowCircleLeft,
    faBell,
} from "@fortawesome/free-solid-svg-icons";
import {
    getFilterParam,
    replaceQueryParam,
    objectToQueryString,
} from "../../util";
import {
    RemindRequestedAction,
    remindRequestedAction,
} from "../../../state/queuing/actions";
import { getGroup } from "../../../state/sign-off/selectors";

interface SignOffSearchProps {
    searchQuery?: string;

    searchResult: GroupAssignmentSetCombination[] | null;
    assignmentSets: AssignmentSetDtoBrief[] | null;
    assignmentGroupSetsMapping: AssignmentGroupSetsMappingDto[] | null;
    group: GroupDtoFull | null;

    doSearchQuery: (
        courseID: number,
        query: string,
    ) => SignOffSearchQueryAction;
    fetchAssignmentSets: (courseID: number) => AssignmentSetsFetchAction;
    fetchAssignmentGroupSetsMapping: (
        courseId: number,
    ) => AssignmentGroupSetMappingFetchRequestedAction;
    remind: (cid: number, rid: string, id: number) => RemindRequestedAction;
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
        this.setState(() => ({ searchQuery: "" }));
        this.props.fetchAssignmentSets(this.props.match.params.cid);
        this.props.fetchAssignmentGroupSetsMapping(this.props.match.params.cid);
    }

    render() {
        const roomCode = getFilterParam(this.props.location.search, "r");
        return (
            <div className="d-flex flex-row align-items-stretch h-100">
                <div className="flex-grow-1">
                    {roomCode != null ? (
                        <div className="d-flex mr-2">
                            <Button
                                block
                                color="success"
                                className="mr-2 mt-0"
                                onClick={() =>
                                    this.props.history.push({
                                        pathname: `rooms/${roomCode}`,
                                    })
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faArrowCircleLeft}
                                    className="mr-2"
                                />
                                Go back
                            </Button>
                            <Button
                                block
                                color="primary"
                                className="mt-0"
                                onClick={() =>
                                    this.props.remind(
                                        Number(this.props.match.params.cid),
                                        roomCode.toString(),
                                        Number(
                                            getFilterParam(
                                                this.props.location.search,
                                                "pid",
                                            ),
                                        ),
                                    )
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faBell}
                                    className="mr-2"
                                />
                                Remind
                            </Button>
                        </div>
                    ) : (
                        this.renderSearchBar()
                    )}
                </div>
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
        const {
            assignmentSets,
            assignmentGroupSetsMapping,
            group,
        } = this.props;

        const gid = getFilterParam(this.props.location.search, "g");
        const assignmentSetOptions: JSX.Element[] = [];

        // If we have not yet selected a group, show all assignment sets
        if (gid == null && assignmentSets != null) {
            assignmentSets.forEach((as) => {
                assignmentSetOptions.push(
                    this.renderAssignmentSetDropdownItem(as),
                );
            });
        } else if (
            // If we have selected a group, find the mapped assignment sets and add
            // dropdown items for those assignment sets
            assignmentGroupSetsMapping != null &&
            group != null &&
            gid != null
        ) {
            const mapsForThisGroup = assignmentGroupSetsMapping.filter(
                (mapping) => mapping.groupSet.id === group.groupSet.id,
            );

            mapsForThisGroup.forEach((mapping) => {
                assignmentSetOptions.push(
                    this.renderAssignmentSetDropdownItem(mapping.assignmentSet),
                );
            });
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
                <DropdownMenu>
                    {assignmentSetOptions.length > 0 ? (
                        assignmentSetOptions
                    ) : (
                        // This only appears if the course has no assignment sets
                        // or if the chosen group has no mapped assignment sets (very unlikely)
                        <DropdownItem className="text-muted p-2">
                            No assignment sets can be chosen
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        );
    }

    private renderAssignmentSetDropdownItem(
        assignmentSet: AssignmentSetDtoBrief,
    ) {
        return (
            <DropdownItem
                key={assignmentSet.id}
                onClick={() => {
                    let newQuery = queryString.parse(
                        this.props.location.search,
                    );
                    newQuery = replaceQueryParam(
                        newQuery,
                        "as",
                        assignmentSet.id,
                    );
                    this.props.history.push({
                        ...this.props.history.location,
                        search: objectToQueryString(newQuery),
                    });
                }}
            >
                {assignmentSet.name}
            </DropdownItem>
        );
    }

    private renderSearchBar() {
        return (
            <Autosuggest
                // @ts-ignore
                // Because suggestions are actually used as sections here,
                // meaning that type of suggestion != type of section.
                suggestions={
                    this.props.searchResult != null
                        ? this.sectionizeSearchResults(this.props.searchResult)
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
                    // const assignmentSetString =
                    //     suggestion.assignmentSet.name + ": ";
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

                    const suggestionName = suggestion.name + memberString;
                    return this.highlightSuggestion(
                        suggestionName,
                        false,
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
                    onBlurCapture: () => this.selectFirstSuggestion(false),
                    onKeyPress: (e) => {
                        if (e.key === "Enter") {
                            this.selectFirstSuggestion(true);
                            // @ts-ignore
                            e.target.blur();
                        }
                    },
                }}
                focusInputOnSuggestionClick={false}
                multiSection={true}
                renderSectionTitle={this.renderSectionTitle}
                getSectionSuggestions={this.getSectionSuggestions}
            />
        );
    }

    private renderSectionTitle(section: GroupAssignmentSetSection) {
        return (
            <span className="font-weight-bold autosuggest-section-title">
                {section.assignmentSet.name}
            </span>
        );
    }

    private getSectionSuggestions(section: GroupAssignmentSetSection) {
        return section.groupsAssignmentSetCombinations;
    }

    private selectFirstSuggestion(forceSelect: boolean) {
        const searchQuery = this.state.searchQuery;
        const asid = queryString.parse(this.props.location.search).as;
        const searchResults = this.props.searchResult;
        if (
            searchQuery != null &&
            searchQuery.length > 0 &&
            searchResults != null &&
            searchResults.length >= 1 &&
            (forceSelect || asid == null)
        ) {
            const groupAssignmentSetCombination = searchResults[0];
            this.pushURL(
                groupAssignmentSetCombination.assignmentSet.id,
                groupAssignmentSetCombination.id,
            );
        }
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

    private sectionizeSearchResults(
        searchResult: GroupAssignmentSetCombination[],
    ): GroupAssignmentSetSection[] {
        const sectionMapping = new Map<
            AssignmentSetDtoBrief,
            GroupAssignmentSetCombination[]
        >();
        const asid = Number(queryString.parse(this.props.location.search).as!);

        // First construct a map with assignment sets as key,
        // and a list of GroupAssignmentSetCombination as values.
        searchResult.forEach((c) => {
            if (!sectionMapping.has(c.assignmentSet)) {
                sectionMapping.set(c.assignmentSet, []);
            }
            sectionMapping.get(c.assignmentSet)!.push(c);
        });

        // Then convert this map to a two-dimensional list (representing the sections),
        // with the 'important' elements at the start of the list.
        // A section is important whenever that section is selected,
        // meaning the query parameter matches the assignment set id.
        const sections: GroupAssignmentSetSection[] = [];
        sectionMapping.forEach((value, key) => {
            const section: GroupAssignmentSetSection = {
                assignmentSet: key,
                groupsAssignmentSetCombinations: value,
                important: key.id === asid,
            };
            if (section.important) {
                sections.unshift(section);
            } else {
                sections.push(section);
            }
        });

        return sections;
    }

    private getAssignmentSetByID(asid: number): AssignmentSetDtoBrief | null {
        if (asid != null && this.props.assignmentSets != null) {
            for (const assignmentSet of this.props.assignmentSets) {
                if (assignmentSet.id === asid) {
                    return assignmentSet;
                }
            }
        }
        return null;
    }

    private pushURL(asid: number | null, selectedGroupID: number | null) {
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
            assignmentSets: getAssignmentSets(state),
            assignmentGroupSetsMapping: getAssignmentGroupSetsMappingDtos(
                state,
            ),
            group: getGroup(state),
        }),
        {
            doSearchQuery: (courseID: number, query: string) =>
                signOffSearchQueryAction(courseID, query),
            remind: (cid: number, rid: string, id: number) =>
                remindRequestedAction(cid, rid, id),
            fetchAssignmentSets: assignmentSetsFetchRequestedAction,
            fetchAssignmentGroupSetsMapping: assignmentGroupSetsMappingsFetchRequestedAction,
        },
    )(SignOffSearch),
);
