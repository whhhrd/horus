import React, { ReactNode, Component } from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";
import { buildContent } from "../../pagebuilder";
import { MultiGrid, GridCellProps, AutoSizer, Index } from "react-virtualized";
import {
    assignmentSetFetchRequestedAction,
    AssignmentSetFetchAction,
} from "../../../state/assignments/actions";
import {
    overviewGroupsFetchRequestedAction,
    overviewSignOffResultsRequestedAction,
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
} from "../../../api/types";
import {
    SignOffResultsMap,
    SignOffOverviewFetchRequestedAction,
    SignOffOverviewResultsFetchRequestedAction,
} from "../../../state/overview/types";
import { getAssignmentSet } from "../../../state/assignments/selectors";
import { Action } from "redux";
import { openSidebarPhoneAction } from "../../../state/sidebar/actions";
import GroupTableCell from "./GroupTableCell";
import ParticipantTableCell from "./ParticipantTableCell";
import AssignmentTableCell from "./AssignmentTableCell";
import SignoffResultTableCell from "./SignoffResultTableCell";

interface SignOffOverviewProps {
    results: SignOffResultsMap | null;
    groups: GroupDtoFull[];
    loading: boolean;
    assignmentSet: (id: number) => AssignmentSetDtoFull | null;

    fetchAssignmentSet: (id: number) => AssignmentSetFetchAction;
    fetchOverviewGroups: (
        courseId: number,
        assignmentSetId: number,
    ) => SignOffOverviewFetchRequestedAction;
    fetchOverviewResults: (
        courseId: number,
        assignmentSetId: number,
    ) => SignOffOverviewResultsFetchRequestedAction;
    openSideBarPhone: () => Action;
}

interface SignOffOverviewState {
    comments: JSX.Element | null;
}

interface Row {
    metaGroup?: GroupDtoFull;
    participant?: ParticipantDtoBrief;
    group?: GroupDtoFull;
}

class SignOffOverview extends Component<
    SignOffOverviewProps & RouteComponentProps<any>,
    SignOffOverviewState
> {
    static rowHeight = 30;
    static columnWidth = 50;

    constructor(props: SignOffOverviewProps & RouteComponentProps<any>) {
        super(props);
        this.state = {
            comments: null,
        };
        this.setComments = this.setComments.bind(this);
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
        this.props.fetchOverviewGroups(courseId, assignmentSetId);
    }

    private buildContent(): JSX.Element | null {
        const assignmentSetId = Number(this.props.match.params.asid);

        if (this.props.assignmentSet(assignmentSetId) == null) {
            return null;
        }

        const assignmentSet = this.props.assignmentSet(assignmentSetId);
        const rowArray = this.groupsToRowArray(this.props.groups);
        return (
            <AutoSizer>
                {({ width, height }) => (
                    <MultiGrid
                        cellRenderer={(cellProps) =>
                            this.renderCell(
                                assignmentSet!.assignments,
                                rowArray,
                                cellProps,
                            )
                        }
                        columnWidth={this.getColumnWidth.bind(this)}
                        columnCount={assignmentSet!.assignments.length + 2}
                        fixedColumnCount={2}
                        fixedRowCount={1}
                        height={height}
                        rowHeight={(index) =>
                            this.getRowHeight(rowArray, index)
                        }
                        rowCount={rowArray.length}
                        width={width}
                        overscanColumnCount={10}
                        overscanRowCount={10}
                    />
                )}
            </AutoSizer>
        );
    }

    private buildSidebar() {
        if (this.state.comments != null) {
            return this.state.comments;
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

    private getRowHeight(rowArray: Row[], { index }: Index): number {
        if (index === 0) {
            return 70;
        } else {
            return this.isSeparatorRow(rowArray, index)
                ? 10
                : SignOffOverview.rowHeight;
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

    private isSeparatorRow(rows: Row[], index: number): boolean {
        return (
            index > 0 &&
            (rows[index].participant == null && rows[index].metaGroup == null)
        );
    }

    private renderCell(
        assignments: AssignmentDtoBrief[],
        rows: Row[],
        cellProps: GridCellProps,
    ): ReactNode | null {
        let className;
        let content = "";
        const { columnIndex, rowIndex, key, style } = cellProps;
        const row = rows[rowIndex];
        if (this.isSeparatorRow(rows, rowIndex)) {
            className = "";
        } else if (columnIndex <= 1 || rowIndex === 0) {
            className = "sign-off-overview-heading-cell";
        } else {
            className = "sign-off-overview-cell";
        }
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
                    onCommentClick={this.setComments}
                />
            );
        }
        if (columnIndex === 0 && rowIndex === 0) {
            content = "Group";
        }
        if (columnIndex === 1 && rowIndex === 0) {
            content = "Name";
        }
        if (columnIndex === 1 && row.participant != null && row.group != null) {
            // return row.participant.person.fullName;
            return (
                <ParticipantTableCell
                    key={key}
                    style={style}
                    className={className}
                    participant={row.participant}
                    onCommentClick={this.setComments}
                    group={row.group}
                />
            );
        }
        if (rowIndex === 0 && columnIndex > 1) {
            const assignment = assignments[columnIndex - 2];
            return (
                <AssignmentTableCell
                    assignment={assignment}
                    key={key}
                    onCommentClick={this.setComments}
                    style={style}
                    className={className}
                />
            );
        }
        if (
            row.participant != null &&
            row.group != null &&
            columnIndex > 1 &&
            this.props.results != null
        ) {
            const pMap = this.props.results.get(row.participant.id);
            const assignment = assignments[columnIndex - 2];
            const result =
                pMap != null ? pMap.get(assignment.id) : null;
            if (result != null) {
                return (
                    <SignoffResultTableCell
                        style={style}
                        className={className}
                        assignment={assignment}
                        group={row.group}
                        key={`res-${result.id}`}
                        onCommentClick={this.setComments}
                        participant={row.participant}
                        signOff={result}
                        signOffState={result.result}
                    />
                );
            }
        }
        return (
            <div style={{ ...style }} key={key} className={className}>
                {content}
            </div>
        );
    }

    private setComments(comments: JSX.Element) {
        this.setState((_) => ({ comments }));
        this.props.openSideBarPhone();
    }

    private groupsToRowArray(groups: GroupDtoFull[]): Row[] {
        const arr: Row[] = [{}];
        groups
            .filter((group) => group.participants.length > 0)
            .forEach((group) => {
                group.participants.forEach((participant, pIndex) => {
                    if (pIndex === 0) {
                        arr.push({ metaGroup: group, group, participant });
                    } else {
                        arr.push({ group, participant });
                    }
                });
                arr.push({});
            });
        return arr;
    }
}

export default withRouter(
    connect(
        (state) => ({
            groups: getOverviewGroups(state),
            loading: getOverviewLoading(state),
            results: getOverviewSignOffResults(state),
            assignmentSet: (id: number) => getAssignmentSet(state, id),
        }),
        {
            fetchAssignmentSet: assignmentSetFetchRequestedAction,
            fetchOverviewGroups: overviewGroupsFetchRequestedAction,
            fetchOverviewResults: overviewSignOffResultsRequestedAction,
            openSideBarPhone: openSidebarPhoneAction,
        },
    )(SignOffOverview),
);
