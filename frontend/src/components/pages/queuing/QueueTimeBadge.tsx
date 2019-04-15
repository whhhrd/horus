import React, { Component } from "react";
import { Badge } from "reactstrap";
import { gradientColor } from "../../util";

interface QueueTimeBadgeProps {
    addedAt: Date;
}

/**
 * A badge like component that displays the number of
 * minutes student has been in the queue. Updates every
 * 30 seconds. The color of the badge depends on the
 * duration of the student being in the queue. 0 minutes is
 * green, 30 minutes is red.
 */
export default class QueueTimeBadge extends Component<QueueTimeBadgeProps> {
    static UNACCEPTABLE_WAITING_TIME = 30;

    timer: number;

    constructor(props: QueueTimeBadgeProps) {
        super(props);
        this.timer = -1;
    }

    /**
     * Forces an update and recalls the ticking method.
     */
    startTicking() {
        this.timer = setTimeout(() => {
            this.forceUpdate();
            this.startTicking();
        }, 30000);
    }

    componentDidMount() {
        this.startTicking();
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        const queueTime = Math.max(
            0,
            this.getQueueTime(new Date(this.props.addedAt)),
        );
        const progress = Math.max(
            0,
            100 - (100 * queueTime) / QueueTimeBadge.UNACCEPTABLE_WAITING_TIME,
        );
        const colors = gradientColor(progress);

        return (
            <Badge
                pill
                color="info"
                style={{ backgroundColor: colors.borderColor }}
            >
                {queueTime}m
            </Badge>
        );
    }

    /**
     * Gets the queue time in minutes.
     * @param date The date on which the student was added to the queue.
     */
    private getQueueTime(date: Date) {
        const currentS = new Date().getTime() / 1000;
        const queueS = date.getTime() / 1000;

        const minuteDiff = Math.floor((currentS - queueS) / 60);
        return minuteDiff;
    }
}
