import React, { Component } from "react";

import { GroupDtoFull } from "../../../api/types";

interface GroupTableCellProps {
    group: GroupDtoFull;
}

export default class GroupTableCell extends Component<GroupTableCellProps> {
    render() {
        const { name } = this.props.group;
        return (
            <td className="sign-off-table-top-left-cell sign-off-table-heading">
                {name}
            </td>
        );
    }
}
