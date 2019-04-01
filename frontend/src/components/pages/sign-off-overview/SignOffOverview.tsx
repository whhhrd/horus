import React, { ReactNode, Component } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";
import { buildContent } from "../../pagebuilder";
import queryString from "query-string";
import { MultiGrid, GridCellProps, AutoSizer, Index } from "react-virtualized";
import {
    assignmentSetFetchRequestedAction,
    AssignmentSetFetchAction,
} from "../../../state/assignments/actions";
import {
    overviewGroupsFetchRequestedAction,
    overviewSignOffResultsRequestedAction,
    SignOffOverviewFilterQueryAction,
    signOffOverviewFilterQueryAction,
} from "../../../state/overview/actions";

import {
    getOverviewGroups,
    getOverviewLoading,
    getOverviewSignOffResults,
} from "../../../state/overview/selectors";
import {
    GroupDtoFull,
    ParticipantDtoBrief,
    AssignmentSetDtoFull,
    AssignmentDtoBrief,
    SignOffResultDtoCompact,
} from "../../../api/types";
import {
    SignOffResultsMap,
    SignOffOverviewFetchRequestedAction,
    SignOffOverviewResultsFetchRequestedAction,
} from "../../../state/overview/types";
import { getAssignmentSet } from "../../../state/assignments/selectors";
import CoursePermissions from "../../../api/permissions";
import { getCoursePermissions } from "../../../state/auth/selectors";
import { signoffAssignmentsView } from "../../../state/auth/constants";
import GroupTableCell from "./GroupTableCell";
import ParticipantTableCell from "./ParticipantTableCell";
import AssignmentTableCell from "./AssignmentTableCell";
import ProgressTableCell from "./ProgressTableCell";
import SignoffResultTableCell from "./SignoffResultTableCell";
import SignOffOverviewSearch, {
    SortType,
    Filter,
} from "./SignOffOverviewSearch";
import { getListFromQuery, arraysEqual, getFilterParam } from "../../util";

interface SignOffOverviewProps {
    results: SignOffResultsMap | null;
    groups: GroupDtoFull[];
    loading: boolean;
    assignmentSet: (id: number) => AssignmentSetDtoFull | null;
    coursePermissions: CoursePermissions | null;

    fetchAssignmentSet: (id: number) => AssignmentSetFetchAction;

    fetchOverviewGroups: (
        courseId: number,
        assignmentSetId: number,
    ) => SignOffOverviewFetchRequestedAction;

    fetchOverviewResults: (
        courseId: number,
        assignmentSetId: number,
    ) => SignOffOverviewResultsFetchRequestedAction;

    fetchFilteredOverviewGroups: (
        courseId: number,
        operator: string,
        assignmentSetId: number,
        labelIds: number[],
        groupSetId: number | undefined,
    ) => SignOffOverviewFilterQueryAction;
}

interface SignOffOverviewState {
    sidebarContent: JSX.Element | null;
    milestoneData: AssignmentDtoBrief[][] | null;
}

interface Row {
    metaGroup?: GroupDtoFull;
    participant?: ParticipantDtoBrief;
    group?: GroupDtoFull;
    isSeperatorRow?: true;
}

class SignOffOverview extends Component<
    SignOffOverviewProps & RouteComponentProps<any>,
    SignOffOverviewState
> {
    static rowHeight = 30;
    static columnWidth = 50;
    multigrid: MultiGrid | null;

    constructor(props: SignOffOverviewProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            sidebarContent: null,
            milestoneData: null,
        };
        this.multigrid = null;
        this.setSidebarContent = this.setSidebarContent.bind(this);
        this.getMilestoneData = this.getMilestoneData.bind(this);
        this.sortTotalProgress = this.sortTotalProgress.bind(this);
        this.searchFilter = this.searchFilter.bind(this);
    }

    render() {
        return buildContent(
            "Sign-Off Overview",
            this.buildContent(),
            this.buildSidebar(),
        );
    }

    componentDidMount() {
        const params = this.props.match.params;
        const courseId = Number(params.cid);
        const assignmentSetId = Number(params.asid);
        this.props.fetchAssignmentSet(assignmentSetId);
        this.props.fetchOverviewResults(courseId, assignmentSetId);

        this.reloadData();
    }

    componentDidUpdate(
        prevProps: SignOffOverviewProps & RouteComponentProps<any>,
    ) {
        // Check whether we must refetch data from the database. If
        // either the laberId array or the groupSetId array is not the same,
        // then refetch from the database.
        const op = getFilterParam(this.props.location.search, Filter.Operator);
        const prevOp = getFilterParam(
            prevProps.location.search,
            Filter.Operator,
        );

        const groupSetId = getFilterParam(
            this.props.location.search,
            Filter.GroupSetId,
        );
        const prevGroupSetId = getFilterParam(
            prevProps.location.search,
            Filter.GroupSetId,
        );
        if (
            !arraysEqual(
                getListFromQuery(this.props.location.search, Filter.LabelIds),
                getListFromQuery(prevProps.location.search, Filter.LabelIds),
            ) ||
            op !== prevOp ||
            groupSetId !== prevGroupSetId
        ) {
            this.reloadData();
        }

        // Set the milestone data once the assignment set is ready and
        // only if the milestone data is not set yet.
        const asid = Number(this.props.match.params.asid);
        const assignmentSet = this.props.assignmentSet(asid);
        const assignments =
            assignmentSet != null ? assignmentSet.assignments : null;

        if (this.state.milestoneData == null && assignments != null) {
            this.setState(() => ({
                milestoneData: this.getMilestoneData(assignments),
            }));
        }

        // When we change order or sort, recalculated grid size.
        // Prevents glitches when group sizes are irregular.
        if (this.multigrid != null) {
            this.multigrid!.recomputeGridSize();
        }
    }

    private buildContent(): JSX.Element | null {
        const cid = Number(this.props.match.params.cid);
        const assignmentSetId = Number(this.props.match.params.asid);
        const assignmentSet = this.props.assignmentSet(assignmentSetId)!;
        const permissions = this.props.coursePermissions!;
        const canViewSignoffs = signoffAssignmentsView.check(cid, permissions);
        const milestoneData = this.state.milestoneData;

        if (
            !canViewSignoffs ||
            assignmentSet == null ||
            milestoneData == null
        ) {
            return null;
        }

        const rowArray = this.groupsToRowArray(this.props.groups);
        return (
            <div className="d-flex flex-column align-items-stretch h-100">
                <div className="mb-2">
                    <SignOffOverviewSearch />
                </div>
                <div className="flex-fill h-100 w-100">
                    <AutoSizer>
                        {({ width, height }) => (
                            <MultiGrid
                                styleBottomRightGrid={{ outline: "none" }}
                                classNameBottomLeftGrid="overview-bottom-left-grid"
                                enableFixedColumnScroll
                                ref={(r) => (this.multigrid = r)}
                                cellRenderer={(cellProps) =>
                                    this.renderCell(
                                        assignmentSet.assignments,
                                        rowArray,
                                        milestoneData,
                                        cellProps,
                                    )
                                }
                                columnWidth={this.getColumnWidth.bind(this)}
                                columnCount={
                                    assignmentSet!.assignments.length +
                                    milestoneData.length +
                                    2
                                }
                                fixedColumnCount={2}
                                fixedRowCount={1}
                                height={height}
                                rowHeight={(index) =>
                                    this.getRowHeight(
                                        rowArray[index.index],
                                        index,
                                    )
                                }
                                rowCount={rowArray.length}
                                width={width}
                                overscanColumnCount={10}
                                overscanRowCount={10}
                            />
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    private buildSidebar() {
        if (this.state.sidebarContent != null) {
            return this.state.sidebarContent;
        } else {
            return (
                <div className="d-flex w-100 h-100 align-items-center">
                    <h4 className="d-block w-100 text-center">
                        Nothing to show here.
                    </h4>
                </div>
            );
        }
    }

    private getRowHeight(row: Row, { index }: Index): number {
        if (index === 0) {
            return 70;
        } else {
            return row.isSeperatorRow ? 10 : SignOffOverview.rowHeight;
        }
    }

    private getColumnWidth({ index }: Index): number {
        switch (index) {
            case 0:
                return 100;
            case 1:
                return 160;
            default:
                return SignOffOverview.columnWidth;
        }
    }

    private renderCell(
        assignments: AssignmentDtoBrief[],
        rows: Row[],
        milestoneData: AssignmentDtoBrief[][],
        cellProps: GridCellProps,
    ): ReactNode | null {
        let className;
        let content = "";
        const { columnIndex, rowIndex, key, style } = cellProps;
        const row = rows[rowIndex];

        // Determine main classname for cell
        if (row.isSeperatorRow) {
            className = "";
        } else if (columnIndex <= 1 || rowIndex === 0) {
            className = "sign-off-overview-heading-cell";
        } else {
            className = "sign-off-overview-cell";
        }

        className += " ellipsis ";

        // Render the group tag in the top left of the table
        if (columnIndex === 0 && rowIndex === 0) {
            content = "Group";
        }

        // Render the name tag next to the group tag
        if (columnIndex === 1 && rowIndex === 0) {
            content = "Name";
        }

        // Render the group cell (left side of the screen)
        if (row.group != null && columnIndex === 0 && row.metaGroup != null) {
            return (
                <GroupTableCell
                    style={{
                        ...style,
                        height:
                            row.metaGroup.participants.length *
                            SignOffOverview.rowHeight,
                        zIndex: 50,
                    }}
                    group={row.group}
                    key={key}
                    className={className}
                    onCommentClick={this.setSidebarContent}
                />
            );
        }

        // Render the participant cells in the second column of the table
        if (columnIndex === 1 && row.participant != null && row.group != null) {
            return (
                <ParticipantTableCell
                    key={key}
                    style={style}
                    className={className}
                    participant={row.participant}
                    onCommentClick={this.setSidebarContent}
                    group={row.group}
                />
            );
        }

        // Render the milestone headers
        if (
            rowIndex === 0 &&
            columnIndex > 1 &&
            columnIndex <= 1 + milestoneData.length
        ) {
            if (columnIndex === 2) {
                content = "Total";
            } else {
                content = "MS " + String(columnIndex - 2);
            }
        }

        // Render the milestones progress cells
        if (
            row.participant != null &&
            columnIndex > 1 &&
            columnIndex <= 1 + milestoneData.length
        ) {
            const milestone = milestoneData[columnIndex - 2];
            const signoffs = this.props.results!.get(row.participant.id);
            return (
                <ProgressTableCell
                    key={key}
                    style={style}
                    className={className}
                    progress={
                        signoffs != null
                            ? this.getCompletionPercentage(milestone, signoffs)
                            : 0
                    }
                />
            );
        }

        // Render the assignment cell in the top of the table
        if (rowIndex === 0 && columnIndex > 1 + milestoneData.length) {
            const assignment =
                assignments[columnIndex - milestoneData.length - 2];
            const assignmentPrevious =
                assignments[columnIndex - milestoneData.length - 3];
            return (
                <AssignmentTableCell
                    assignment={assignment}
                    key={key}
                    onCommentClick={this.setSidebarContent}
                    style={style}
                    className={
                        className + (assignment.milestone
                            ? " overview-milestone-divider"
                            : "") + (assignmentPrevious != null &&
                              assignmentPrevious.milestone
                            ? " overview-milestone-divider-left"
                            : "")
                    }
                />
            );
        }

        // Set milestone border visuals for actual milestone cell
        if (
            assignments[columnIndex - milestoneData.length - 2] != null &&
            assignments[columnIndex - milestoneData.length - 2].milestone
        ) {
            className += " overview-milestone-divider-gray";
        }

        // Set milestone border visuals for cells after milestone cells,
        if (
            assignments[columnIndex - milestoneData.length - 3] != null &&
            assignments[columnIndex - milestoneData.length - 3].milestone
        ) {
            className += " overview-milestone-divider-left-gray";
        }

        // Render the sign-off result cell
        if (
            row.participant != null &&
            row.group != null &&
            columnIndex > 1 + milestoneData.length &&
            this.props.results != null
        ) {
            const pMap = this.props.results.get(row.participant.id);
            const assignment =
                assignments[columnIndex - milestoneData.length - 2];
            const result = pMap != null ? pMap.get(assignment.id) : null;
            if (result != null) {
                return (
                    <SignoffResultTableCell
                        style={style}
                        className={className}
                        assignment={assignment}
                        group={row.group}
                        key={`res-${result.id}`}
                        onCommentClick={this.setSidebarContent}
                        participant={row.participant}
                        signOff={result}
                        signOffState={result.result}
                    />
                );
            }
        }

        // Return the normal table cell
        return (
            <div style={{ ...style }} key={key} className={className}>
                {content}
            </div>
        );
    }

    /**
     * Sets the sidebar content, based on the passed parameter.
     */
    private setSidebarContent(sidebarContent: JSX.Element) {
        this.setState(() => ({ sidebarContent }));
        this.openSidebar();
    }

    /**
     * Filters the groups based on group name, group number,
     * student names/numbers in the groups, the labels assigned to
     * students in the groups and the group set to which the groups belong to.
     * Then it converts the resulting list of groups to a list of Rows,
     * suitable for the MultiGrid render cell method.
     * @param groups The groups to be filtered and displayed in the MultiGrid
     */
    private groupsToRowArray(groups: GroupDtoFull[]): Row[] {
        const rows: Row[] = [{}];

        // Prepare sorting
        // The order of results, retrieved from the filters in the querystring
        // If no order param is in the filter, then default to ascending
        const filterOrder = this.getFilters(this.props.location.search).order;
        const ascending =
            filterOrder != undefined ? Boolean(Number(filterOrder)) : true;

        // The sort function, derived from the filters in the querystring
        let sortFun: (a: GroupDtoFull, b: GroupDtoFull) => number;
        switch (this.getFilters(this.props.location.search).sortby) {
            case SortType.GroupName:
                sortFun = this.sortGroupName;
                break;
            case SortType.TotalProgress:
                sortFun = this.sortTotalProgress;
                break;
            default:
                sortFun = this.sortGroupName;
                break;
        }

        // Sort the groups
        const sortedGroups: GroupDtoFull[] = groups
            .filter((group) => group.participants.length > 0)
            .filter(this.searchFilter)
            .sort(sortFun);

        // Reverse if needed
        if (!ascending) {
            sortedGroups.reverse();
        }

        // Push the actual rows
        sortedGroups.forEach((group) => {
            group.participants.forEach((participant, pIndex) => {
                if (pIndex === 0) {
                    rows.push({ metaGroup: group, group, participant });
                } else {
                    rows.push({ group, participant });
                }
            });
            rows.push({ isSeperatorRow: true });
        });

        return rows;
    }

    /**
     * Sort function for groups, based on the length of the group name and
     * the name itself. Takes the length into account, since otherwise 'Group 120'
     * would come after 'Group 119' in an ascending order.
     */
    private sortGroupName(groupA: GroupDtoFull, groupB: GroupDtoFull) {
        return groupA.name.length > groupB.name.length ||
            groupA.name > groupB.name
            ? 1
            : -1;
    }

    /**
     * Sort function for groups. Based on the minimum of the total percentages
     * of the students within the groups. There precice calculations for the minimum
     * are: min = minimumTotalProgressOfGroup + sumOfTotalProgressOfGroup^0.3 / len(members).
     */
    private sortTotalProgress(groupA: GroupDtoFull, groupB: GroupDtoFull) {
        // If the data is not ready, simply return in ascending order.
        if (this.state.milestoneData == null || this.props.results == null) {
            return 1;
        }

        const milestone = this.state.milestoneData[0];

        // Calculate the minimum for group A, compensated by a factor of the total of the group
        let totalGrpA = 0;
        let minGrpA = Math.min(
            ...groupA.participants.map((p) => {
                if (this.props.results!.get(p.id) != null) {
                    const perc = this.getCompletionPercentage(
                        milestone,
                        this.props.results!.get(p.id)!,
                    );
                    totalGrpA += perc;
                    return perc;
                } else {
                    return 1;
                }
            }),
        );

        // Add a fraction of the group average
        minGrpA += Math.pow(totalGrpA, 0.3) / groupA.participants.length;

        // Calculate the minimum for group B, compensated by a factor of the total of the group
        let totalGrpB = 0;
        let minGrpB = Math.min(
            ...groupB.participants.map((p) => {
                if (this.props.results!.get(p.id) != null) {
                    const perc = this.getCompletionPercentage(
                        milestone,
                        this.props.results!.get(p.id)!,
                    );
                    totalGrpB += perc;
                    return perc;
                } else {
                    return 1;
                }
            }),
        );

        // Add a fraction of the group average
        minGrpB += Math.pow(totalGrpB, 0.3) / groupB.participants.length;

        return minGrpA > minGrpB ? 1 : -1;
    }

    /**
     * Checks whether the passed group satisfies the filter. The filter
     * checks whether the search input is included in one of the following:
     *     1. The group name
     *     2. The group number
     *     3. Any of the student names
     *     4. Any of the student numbers
     * @param group The group to be checked for the filter.
     */
    private searchFilter(group: GroupDtoFull) {
        const searchQuery = this.getFilters(this.props.location.search).search;

        if (searchQuery != null && searchQuery.length > 0) {
            const search = searchQuery!.toString().toLowerCase();

            // If the groupname includes the search input, return true
            if (group.name.toLowerCase().includes(search)) {
                return true;
            } else {
                // Else, check for the student details
                // @ts-ignore
                const hit = group.participants.find((p) => {
                    if (
                        p.person.fullName.toLowerCase().includes(search) ||
                        p.person.loginId.toLowerCase().includes(search)
                    ) {
                        return p;
                    }
                });
                return hit != null;
            }
        } else {
            return true;
        }
    }

    /**
     * Returns a list, containing lists of assignments, grouped based on milestone indicators.
     * The first element contains all assignments (for total percentage calculation),
     * the others are divided by milestone indicators.
     * @param assignments The assignments in an assignment set containing (or not) milestones.
     */
    private getMilestoneData(assignments: AssignmentDtoBrief[]) {
        const milestoneData: AssignmentDtoBrief[][] = [assignments];
        let milestone: AssignmentDtoBrief[] = [];
        assignments.forEach((assignment) => {
            milestone.push(assignment);
            if (assignment.milestone) {
                milestoneData.push(milestone);
                milestone = [];
            }
        });
        return milestoneData;
    }

    /**
     * Calculates a completion percentage for each milestone.
     * @param milestone The list of assignments for one milestone.
     * @param signoffs The sign-off status for each assignment of a student .
     */
    private getCompletionPercentage(
        milestone: AssignmentDtoBrief[],
        signoffs: Map<number, SignOffResultDtoCompact>,
    ) {
        if (milestone.length === 0) {
            return 100;
        }

        let completed = 0;
        milestone.forEach((ass) => {
            if (
                signoffs.get(ass.id) != null &&
                signoffs.get(ass.id)!.result === "COMPLETE"
            ) {
                completed++;
            }
        });
        return (completed * 100) / milestone.length;
    }

    /**
     * Opens the sidebar by pushing a hash.
     */
    private openSidebar() {
        const { history } = this.props;
        history.push({
            ...history.location,
            hash: "sidebar",
        });
    }

    /**
     * Returns a queryString.ParsedQuery of the current search
     * details.
     * @param search The search in the location of the props.
     */
    private getFilters(search: string) {
        return queryString.parse(search);
    }

    /**
     * Reloads the data, based on the groupSetIds list and the labelIds list.
     * If they are empty, then fetch normal overview groups, else use the specified
     * API call.
     */
    private reloadData() {
        const courseId = Number(this.props.match.params.cid);
        const assignmentSetId = Number(this.props.match.params.asid);
        const labelIds = getListFromQuery(
            this.props.location.search,
            Filter.LabelIds,
        );
        const groupSetId = getFilterParam(
            this.props.location.search,
            Filter.GroupSetId,
        );

        if (labelIds.length > 0 || !isNaN(Number(groupSetId))) {
            const operator = queryString.parse(this.props.location.search).op;
            this.props.fetchFilteredOverviewGroups(
                courseId,
                operator != null ? operator.toString() : "OR",
                assignmentSetId,
                labelIds,
                groupSetId != null ? Number(groupSetId.toString()) : undefined,
            );
        } else {
            this.props.fetchOverviewGroups(courseId, assignmentSetId);
        }
    }
}

export default withRouter(
    connect(
        (state) => ({
            groups: getOverviewGroups(state),
            loading: getOverviewLoading(state),
            results: getOverviewSignOffResults(state),
            assignmentSet: (id: number) => getAssignmentSet(state, id),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            fetchAssignmentSet: assignmentSetFetchRequestedAction,
            fetchOverviewGroups: overviewGroupsFetchRequestedAction,
            fetchOverviewResults: overviewSignOffResultsRequestedAction,
            fetchFilteredOverviewGroups: signOffOverviewFilterQueryAction,
        },
    )(SignOffOverview),
);
