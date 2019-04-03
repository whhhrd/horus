import { Component } from "react";
import React from "react";
import { Badge } from "reactstrap";
import { gradientColor } from "../../util";

interface QueueTimeBadgeProps {
    addedAt: Date;
}

export default class QueueTimeBadge extends Component<QueueTimeBadgeProps> {
    static UNACCEPTABLE_WAITING_TIME = 30;

    timer: number;

    constructor(props: QueueTimeBadgeProps) {
        super(props);
        this.timer = -1;
    }

    startTicking() {
        this.timer = setTimeout(() => {
            this.forceUpdate();
            this.startTicking();
        }, 3000);
    }

    componentDidMount() {
        this.startTicking();
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        const queueTime = this.getQueueTime(new Date(this.props.addedAt));
        const progress = Math.max(0, 100 - 100 * queueTime / QueueTimeBadge.UNACCEPTABLE_WAITING_TIME);
        const colors = gradientColor(progress);
        return (
            <Badge pill color="info" style={{backgroundColor: colors.borderColor}}>
                {queueTime}m
            </Badge>
        );
    }

    private getQueueTime(date: Date) {
        const currentS = new Date().getTime() / 1000;
        const queueS = date.getTime() / 1000;

        const minuteDiff = Math.floor((currentS - queueS) / 60);
        return minuteDiff;
    }
}
