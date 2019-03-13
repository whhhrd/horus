import React, { PureComponent, ReactNode } from "react";
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
}

interface Row {
    group?: GroupDtoFull;
    participant?: ParticipantDtoBrief;
}

class SignOffOverview extends PureComponent<
    SignOffOverviewProps & RouteComponentProps<any>
> {
    static rowHeight = 30;
    static columnWidth = 50;

    render() {
        return buildContent("Sign-Off Overview", this.buildContent());
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
                return 80;
            case 1:
                return 150;
            default:
                return SignOffOverview.columnWidth;
        }
    }

    private isSeparatorRow(rows: Row[], index: number): boolean {
        return (
            index > 0 &&
            (rows[index].participant == null && rows[index].group == null)
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
        if (row.group != null && columnIndex === 0) {
            return (
                <div
                    style={{
                        ...style,
                        height:
                            row.group.participants.length *
                            SignOffOverview.rowHeight,
                        zIndex: 50,
                    }}
                    key={key}
                    className={className}
                >
                    {row.group.name}
                </div>
            );
        }
        if (columnIndex === 0 && rowIndex === 0) {
            content = "Group";
        }
        if (columnIndex === 1 && rowIndex === 0) {
            content = "Name";
        }
        if (columnIndex === 1 && row.participant != null) {
            content = row.participant.person.fullName;
        }
        if (rowIndex === 0 && columnIndex > 1) {
            content = assignments[columnIndex - 2].name;
        }
        if (
            row.participant != null &&
            columnIndex > 1 &&
            this.props.results != null
        ) {
            const pMap = this.props.results.get(row.participant.id);
            const result =
                pMap != null ? pMap.get(assignments[columnIndex - 2].id) : null;
            if (result != null) {
                switch (result.result) {
                    case "COMPLETE":
                        className = "sign-off-overview-content-cell-complete";
                        break;
                    case "INSUFFICIENT":
                        className =
                            "sign-off-overview-content-cell-insufficient";
                        break;
                }
            }
        }
        return (
            <div style={{ ...style }} key={key} className={className}>
                {content}
            </div>
        );
    }

    private groupsToRowArray(groups: GroupDtoFull[]): Row[] {
        const arr: Row[] = [{}];
        groups
            .filter((group) => group.participants.length > 0)
            .forEach((group) => {
                group.participants.forEach((participant, pIndex) => {
                    if (pIndex === 0) {
                        arr.push({ group, participant });
                    } else {
                        arr.push({ participant });
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
        },
    )(SignOffOverview),
);
