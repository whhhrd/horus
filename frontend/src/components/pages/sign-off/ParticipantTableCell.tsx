import React, { Component } from "react";

import { ParticipantDto } from "../../../api/types";

interface ParticipantTableCellProps {
    participant: ParticipantDto;
}

export default class ParticipantTableCell extends Component<
    ParticipantTableCellProps
> {
    render() {
        const { person } = this.props.participant;
        return (
            <td className="sign-off-table-heading sign-off-table-top-row">
                {person.fullName}
            </td>
        );
    }
}
