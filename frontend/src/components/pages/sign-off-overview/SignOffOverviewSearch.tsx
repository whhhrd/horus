import React, { Component, KeyboardEvent } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";

import {
    Input,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    InputGroup,
    Button,
    DropdownItem,
    Badge,
} from "reactstrap";

import { LabelDto, GroupSetDtoSummary } from "../../../api/types";
import { getLabels } from "../../../state/labels/selectors";
import {
    CourseRequestedAction,
    courseRequestedAction,
} from "../../../state/courses/action";
import {
    GroupSetsFetchAction,
    groupSetsFetchRequestedAction,
} from "../../../state/groups/actions";
import { getGroupSets } from "../../../state/groups/selectors";
import { getOverviewLoading } from "../../../state/overview/selectors";

import Label from "../../Label";
import queryString from "query-string";
import {
    objectToQueryString,
    addReplaceQueryParam,
    getListFromQuery,
    getFilterParam,
    removeQueryParam,
} from "../../util";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faSort,
    faTags,
    faSortAlphaUp,
    faSortAlphaDown,
    faSortAmountDown,
    faSortAmountUp,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface SignOffOverviewProps {
    labels: LabelDto[] | null;
    isLoading: boolean;

    fetchCourse: (id: number) => CourseRequestedAction;
    fetchGroupSets: (courseId: number) => GroupSetsFetchAction;
    groupSets: GroupSetDtoSummary[] | null;
}

interface SignOffOverviewState {
    groupSetSelectorDropdownOpen: boolean;
    labelSelectorDropdownOpen: boolean;
    sortByDropdownOpen: boolean;
}

export enum SortType {
    GroupName = "group",
    TotalProgress = "total",
}

export enum Filter {
    Search = "search",
    SortBy = "sortby",
    Order = "order",
    GroupSetId = "gid",
    LabelIds = "lids",
    Operator = "op",
}

const initialState = {
    groupSetSelectorDropdownOpen: false,
    labelSelectorDropdownOpen: false,
    sortByDropdownOpen: false,
};

/**
 * A component that allows the user to filter the sign-off
 * details of students and groups. Possible filters currently are:
 * 1. filter on search term
 * 2. sort based on group name or total progress
 * 3. filter on group sets
 * 4. filter on labels, either union or intersection
 * A user can also clear the filters with one mouse click or can
 * clear the filters individually by removing the badges below the
 * filters.
 */
class SignOffOverviewSearch extends Component<
    SignOffOverviewProps & RouteComponentProps<any>,
    SignOffOverviewState
> {
    constructor(props: SignOffOverviewProps & RouteComponentProps<any>) {
        super(props);
        this.state = initialState;

        this.toggleGroupSetSelectorDropdown = this.toggleGroupSetSelectorDropdown.bind(
            this,
        );
        this.toggleLabelSelectorDropdown = this.toggleLabelSelectorDropdown.bind(
            this,
        );
        this.toggleSortBySelectorDropdown = this.toggleSortBySelectorDropdown.bind(
            this,
        );
        this.toggleLabelInFilter = this.toggleLabelInFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
    }

    render() {
        return this.buildContent();
    }

    componentDidMount() {
        const params = this.props.match.params;
        const courseId = Number(params.cid);

        if (this.props.labels == null) {
            this.props.fetchCourse(courseId);
        }
        this.props.fetchGroupSets(courseId);
    }

    toggleGroupSetSelectorDropdown() {
        this.setState((state) => ({
            groupSetSelectorDropdownOpen: !state.groupSetSelectorDropdownOpen,
        }));
    }

    toggleLabelSelectorDropdown() {
        this.setState((state) => ({
            labelSelectorDropdownOpen: !state.labelSelectorDropdownOpen,
        }));
    }

    toggleSortBySelectorDropdown() {
        this.setState((state) => ({
            sortByDropdownOpen: !state.sortByDropdownOpen,
        }));
    }

    private buildContent(): JSX.Element | null {
        return (
            <div>
                <InputGroup>
                    {/* Build the search bar */}
                    <Input
                        id="SearchInput"
                        className="form-control-lg rounded"
                        placeholder="Group name/number or student name/number"
                        autoFocus={true}
                        disabled={this.props.isLoading}
                        onKeyPress={(e: KeyboardEvent) => {
                            if (e.key === "Enter") {
                                // @ts-ignore
                                this.setTextSearch(e.target.value);
                            }
                        }}
                    />

                    {/* Build the dropdowns */}
                    {this.buildSortByDropdown()}
                    {this.buildFilterGroupSetsDropdown()}
                    {this.buildFilterLabelDropdown()}

                    {/* Build the clear filter button */}
                    <Button
                        title="Clear filters"
                        size="lg"
                        className="h-100 ml-2"
                        color="secondary"
                        outline
                        disabled={
                            this.props.location.search === "" ||
                            this.props.isLoading
                        }
                        onClick={this.clearFilter}
                    >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </Button>
                </InputGroup>
                <div className="mt-2">{this.buildFilterPills()}</div>
            </div>
        );
    }

    /**
     * Builds the badges that are displayed below the filters,
     * which indicate the current active filters. Allows the user
     * to remove the filters by displaying a clickable X on each
     * badge.
     */
    private buildFilterPills() {
        const search = this.props.location.search;
        const parsedQuery = queryString.parse(search);
        const sort = getFilterParam(search, Filter.SortBy);
        const order = getFilterParam(search, Filter.Order);
        const groupSetId = getFilterParam(search, Filter.GroupSetId);
        const labelIds = getListFromQuery(search, Filter.LabelIds);
        const searchString = getFilterParam(search, Filter.Search);
        const labels = this.props.labels;

        const groupSet =
            this.props.groupSets != null
                ? this.props.groupSets.find(
                      (gs) => gs.id === Number(groupSetId),
                  )
                : null;

        return (
            <div>
                {searchString != null && (
                    <Badge
                        color="primary"
                        pill
                        className="p-label mr-1 mb-1 py-1 px-2 shadow-sm"
                    >
                        Search term: {searchString}{" "}
                        <span
                            onClick={() => {
                                if (!this.props.isLoading) {
                                    this.props.history.push({
                                        ...this.props.history.location,
                                        search: objectToQueryString(
                                            removeQueryParam(
                                                parsedQuery,
                                                Filter.Search,
                                            ),
                                        ),
                                    });
                                    const input: HTMLElement = document.getElementById("SearchInput")!;
                                    // @ts-ignore
                                    input.value = "";
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faTimes}
                                size="sm"
                                className="ml-2 cursor-pointer"
                            />
                        </span>
                    </Badge>
                )}
                {sort != null && (
                    <Badge
                        color="primary"
                        pill
                        className="p-label mr-1 mb-1 py-1 px-2 shadow-sm"
                    >
                        Sorted by {sort}{" "}
                        <span
                            onClick={() => {
                                if (!this.props.isLoading) {
                                    this.props.history.push({
                                        ...this.props.history.location,
                                        search: objectToQueryString(
                                            removeQueryParam(
                                                parsedQuery,
                                                Filter.SortBy,
                                            ),
                                        ),
                                    });
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faTimes}
                                size="sm"
                                className="ml-2 cursor-pointer"
                            />
                        </span>
                    </Badge>
                )}
                {order != null && order !== "1" && (
                    <Badge
                        color="primary"
                        pill
                        className="p-label mr-1 mb-1 py-1 px-2 shadow-sm"
                    >
                        descending order{" "}
                        <span
                            onClick={() => {
                                if (!this.props.isLoading) {
                                    this.props.history.push({
                                        ...this.props.history.location,
                                        search: objectToQueryString(
                                            removeQueryParam(
                                                parsedQuery,
                                                Filter.Order,
                                            ),
                                        ),
                                    });
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faTimes}
                                size="sm"
                                className="ml-2 cursor-pointer"
                            />
                        </span>
                    </Badge>
                )}
                {groupSet != null && (
                    <Badge
                        color="primary"
                        pill
                        className="p-label mr-1 mb-1 py-1 px-2 shadow-sm"
                    >
                        {groupSet.name}
                        <span
                            onClick={() => {
                                if (!this.props.isLoading) {
                                    this.props.history.push({
                                        ...this.props.history.location,
                                        search: objectToQueryString(
                                            removeQueryParam(
                                                parsedQuery,
                                                Filter.GroupSetId,
                                            ),
                                        ),
                                    });
                                }
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faTimes}
                                size="sm"
                                className="ml-2 cursor-pointer"
                            />
                        </span>
                    </Badge>
                )}
                {labelIds != null &&
                    labels != null &&
                    labelIds.map((lId) => {
                        const label = labels.find((l) => l.id === lId);
                        if (label != null) {
                            return (
                                <Label label={label} key={`l-${lId}`}>
                                    <span
                                        onClick={() => {
                                            if (!this.props.isLoading) {
                                                this.toggleLabelInFilter(lId);
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTimes}
                                            size="sm"
                                            className="ml-2 cursor-pointer"
                                        />
                                    </span>
                                </Label>
                            );
                        } else {
                            return null;
                        }
                    })}
            </div>
        );
    }

    private setTextSearch(text: string): any {
        if (text.trim().length > 0) {
            const newQuery = addReplaceQueryParam(
                queryString.parse(this.props.location.search),
                Filter.Search,
                encodeURIComponent(text),
            );

            this.props.history.push({
                ...this.props.history.location,
                search: objectToQueryString(newQuery),
            });
        }
    }

    /**
     * Builds the sort by dropdown, currently displaying 4 options:
     * 1. group name, ascending
     * 2. group name, descending,
     * 3. total progress, ascending,
     * 4. total progress, descending
     */
    private buildSortByDropdown() {
        return (
            <Dropdown
                isOpen={this.state.sortByDropdownOpen}
                toggle={this.toggleSortBySelectorDropdown}
            >
                <DropdownToggle
                    color="primary"
                    outline
                    caret
                    className="h-100 ml-2"
                    disabled={this.props.isLoading}
                >
                    <FontAwesomeIcon icon={faSort} className="mr-2" />
                    Sort by
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem
                        className="py-2"
                        active={this.isSortActive(SortType.GroupName, true)}
                        onClick={() =>
                            this.setSortByFilter(SortType.GroupName, true)
                        }
                    >
                        <FontAwesomeIcon
                            icon={faSortAlphaDown}
                            className="mr-2"
                            size="lg"
                        />
                        Sort by group name (ascending)
                    </DropdownItem>
                    <DropdownItem
                        className="py-2"
                        active={this.isSortActive(SortType.GroupName, false)}
                        onClick={() =>
                            this.setSortByFilter(SortType.GroupName, false)
                        }
                    >
                        <FontAwesomeIcon
                            icon={faSortAlphaUp}
                            className="mr-2"
                            size="lg"
                        />
                        Sort by group name (descending)
                    </DropdownItem>
                    <DropdownItem
                        className="py-2"
                        active={this.isSortActive(SortType.TotalProgress, true)}
                        onClick={() =>
                            this.setSortByFilter(SortType.TotalProgress, true)
                        }
                    >
                        <FontAwesomeIcon
                            icon={faSortAmountDown}
                            className="mr-1"
                            size="lg"
                        />
                        Sort by total progress (ascending)
                    </DropdownItem>
                    <DropdownItem
                        className="py-2"
                        active={this.isSortActive(
                            SortType.TotalProgress,
                            false,
                        )}
                        onClick={() =>
                            this.setSortByFilter(SortType.TotalProgress, false)
                        }
                    >
                        <FontAwesomeIcon
                            icon={faSortAmountUp}
                            className="mr-1"
                            size="lg"
                        />
                        Sort by total progress (descending)
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        );
    }

    /**
     * Sets the chosen filter in the search parameters.
     */
    private setSortByFilter(by: SortType, order: boolean) {
        let newQuery = addReplaceQueryParam(
            queryString.parse(this.props.location.search),
            Filter.SortBy,
            by,
        );

        newQuery = addReplaceQueryParam(
            newQuery,
            Filter.Order,
            order ? "1" : "0",
        );

        this.props.history.push({
            ...this.props.history.location,
            search: objectToQueryString(newQuery),
        });
    }

    /**
     * Determines if the given sorting filter is active based on the
     * query parameters. When no query parameters are given, the
     * groupname ascending sort is active.
     */
    private isSortActive(by: SortType, order: boolean) {
        const queryOrder = queryString.parse(this.props.location.search).order;
        const querySortBy = queryString.parse(this.props.location.search)
            .sortby;

        if (queryOrder == null && querySortBy == null) {
            return by === SortType.GroupName && order;
        } else {
            if (queryOrder == null || querySortBy == null) {
                return false;
            } else {
                return (
                    Boolean(Number(queryOrder)) === order &&
                    querySortBy === by.toString()
                );
            }
        }
    }

    /**
     * Builds the group sets filter dropdown.
     */
    private buildFilterGroupSetsDropdown() {
        const { groupSets } = this.props;

        if (groupSets == null) {
            return null;
        }

        const currentGroupSetId = Number(
            getFilterParam(this.props.location.search, Filter.GroupSetId),
        );

        return (
            <Dropdown
                isOpen={this.state.groupSetSelectorDropdownOpen}
                toggle={this.toggleGroupSetSelectorDropdown}
            >
                <DropdownToggle
                    color="primary"
                    outline
                    caret
                    className="h-100 ml-2"
                    disabled={this.props.isLoading}
                >
                    <FontAwesomeIcon icon={faUsers} className="mr-2" /> Select
                    group set
                </DropdownToggle>
                <DropdownMenu>
                    {groupSets.map((g) => (
                        <DropdownItem
                            key={`g${g.id}`}
                            active={currentGroupSetId === g.id}
                            onClick={() => this.setGroupSetInFilter(g.id)}
                        >
                            {g.name}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    /**
     * Sets the chosen groupset filter in the search parameter.
     */
    private setGroupSetInFilter(groupSetId: number) {
        const currentQuery: queryString.ParsedQuery = queryString.parse(
            this.props.location.search,
        );

        const newQuery = addReplaceQueryParam(
            currentQuery,
            Filter.GroupSetId,
            groupSetId,
        );

        this.props.history.push({
            ...this.props.history.location,
            search: objectToQueryString(newQuery),
        });
    }

    /**
     * Builds the label filter dropdown.
     */
    private buildFilterLabelDropdown() {
        if (this.props.labels == null) {
            return null;
        }

        return (
            <Dropdown
                isOpen={this.state.labelSelectorDropdownOpen}
                toggle={this.toggleLabelSelectorDropdown}
            >
                <DropdownToggle
                    color="primary"
                    outline
                    caret
                    className="h-100 ml-2"
                    disabled={this.props.isLoading}
                >
                    <FontAwesomeIcon icon={faTags} className="mr-2" />
                    Select labels
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem header>
                        <Button
                            block
                            // Default behavior is "OR", so if current filter is not "AND"
                            // then this button is not outlined.
                            outline={
                                getFilterParam(
                                    this.props.location.search,
                                    Filter.Operator,
                                ) !== "OR"
                            }
                            disabled={this.props.isLoading}
                            color="primary"
                            size="sm"
                            onClick={() => this.setLabelFilterOperator("OR")}
                        >
                            Match any
                        </Button>
                        <Button
                            block
                            disabled={this.props.isLoading}
                            outline={
                                getFilterParam(
                                    this.props.location.search,
                                    Filter.Operator,
                                ) === "OR"
                            }
                            color="primary"
                            size="sm"
                            onClick={() => this.setLabelFilterOperator("AND")}
                        >
                            Match all
                        </Button>
                    </DropdownItem>
                    <DropdownItem divider />
                    {this.props.labels.map((l) => {
                        return (
                            <DropdownItem
                                disabled={this.props.isLoading}
                                // toggle={false}
                                key={`l${l.id}`}
                                active={
                                    getListFromQuery(
                                        this.props.location.search,
                                        Filter.LabelIds,
                                    ).find((l2Id) => l2Id === l.id) != undefined
                                }
                                onClick={() => this.toggleLabelInFilter(l.id)}
                            >
                                <Label
                                    label={l}
                                    className="w-100"
                                    style={{ fontSize: "13pt" }}
                                />
                            </DropdownItem>
                        );
                    })}
                </DropdownMenu>
            </Dropdown>
        );
    }

    /**
     * Sets label operator filter in the search parameters.
     * Operators can be: AND | OR.
     */
    private setLabelFilterOperator(operator: string) {
        const currentQuery: queryString.ParsedQuery = queryString.parse(
            this.props.location.search,
        );

        const newQuery = addReplaceQueryParam(
            currentQuery,
            Filter.Operator,
            operator,
        );

        this.props.history.push({
            ...this.props.history.location,
            search: objectToQueryString(newQuery),
        });
    }

    /**
     * Toggles the chosen label from the filter
     * in the search parameters.
     */
    private toggleLabelInFilter(labelId: number) {
        const newLabels = getListFromQuery(
            this.props.location.search,
            Filter.LabelIds,
        );

        const labelToToggle = newLabels.find((lId) => lId === labelId);

        if (labelToToggle != null) {
            const labelIdIndex = newLabels.indexOf(labelId);
            newLabels.splice(labelIdIndex, 1);
        } else {
            newLabels.push(labelId);
        }

        const currentQuery: queryString.ParsedQuery = queryString.parse(
            this.props.location.search,
        );

        const newQuery = addReplaceQueryParam(
            currentQuery,
            Filter.LabelIds,
            newLabels,
        );

        this.props.history.push({
            ...this.props.history.location,
            search: objectToQueryString(newQuery),
        });
    }

    private clearFilter() {
        this.props.history.push({
            ...this.props.location,
            search: "",
        });
    }
}

export default withRouter(
    connect(
        (state) => ({
            labels: getLabels(state),
            groupSets: getGroupSets(state),
            isLoading: getOverviewLoading(state),
        }),
        {
            fetchCourse: courseRequestedAction,
            fetchGroupSets: groupSetsFetchRequestedAction,
        },
    )(SignOffOverviewSearch),
);
