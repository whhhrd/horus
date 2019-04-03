import { Component, Fragment } from "react";
import React from "react";
import { connect } from "react-redux";
import {
    CardBody,
    Card,
    Progress,
    Spinner,
    CardHeader,
    CardTitle,
    Collapse,
} from "reactstrap";
import { BatchJobDto } from "../api/types";
import { ApplicationState } from "../state/state";
import { getJob } from "../state/jobs/selectors";
import {
    JobIdFetchRequestedAction,
    jobIdFetchRequestedAction,
    JobRemoveRequestedAction,
    jobRemoveRequestedAction,
} from "../state/jobs/action";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faTimes,
    faPlusSquare,
    faChevronDown,
    faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getDisplayedDate } from "./util";

interface JobProgressProps {
    jobId: string;
    isLast?: boolean;

    job: (jobId: string) => BatchJobDto | null;
    fetchJob: (jobId: string) => JobIdFetchRequestedAction;
    removeJob: (jobId: string) => JobRemoveRequestedAction;
}

interface JobProgressState {
    pollTimer: number | null;
    canPoll: boolean;
    showError: boolean;
}

class JobProgress extends Component<JobProgressProps, JobProgressState> {
    static defaultProps = { isLast: false };

    constructor(props: JobProgressProps) {
        super(props);
        this.state = {
            pollTimer: null,
            canPoll: false,
            showError: false,
        };
    }

    componentDidMount() {
        this.startPolling();
    }

    componentDidUpdate() {
        if (!this.state.canPoll && this.props.job != null) {
            this.setState(() => ({ canPoll: true }));
        }
    }

    componentWillUnmount() {
        if (this.state.pollTimer != null) {
            clearTimeout(this.state.pollTimer);
        }
    }

    startPolling() {
        const pollTimer = setTimeout(() => {
            const { job, fetchJob, jobId } = this.props;
            const j = job(jobId);

            if (this.state.canPoll && j != null && j.status === "PROCESSING") {
                fetchJob(jobId);
                this.startPolling();
            }

            if (
                this.state.pollTimer != null &&
                j != null &&
                (j.status === "COMPLETED" || j.status === "ABORTED")
            ) {
                clearTimeout(this.state.pollTimer);
            }
        }, 1000);

        this.setState(() => ({ pollTimer }));
    }

    render() {
        const { job, jobId } = this.props;
        const j = job(jobId);

        if (j == null) {
            return null;
        } else {
            let statusIndicator = null;
            let color: string = "";

            switch (j.status) {
                case "COMPLETED":
                    color = "success";
                    statusIndicator = (
                        <span className="text-success font-weight-bold">
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            COMPLETED
                        </span>
                    );
                    break;
                case "ABORTED":
                    color = "danger";
                    statusIndicator = (
                        <span className="text-danger font-weight-bold">
                            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                            ABORTED
                        </span>
                    );
                    break;
                case "CREATED":
                    color = "primary";
                    statusIndicator = (
                        <span className="text-primary font-weight-bold">
                            <FontAwesomeIcon
                                icon={faPlusSquare}
                                className="mr-2"
                            />
                            CREATED
                        </span>
                    );
                    break;
                case "PROCESSING":
                    color = "primary";
                    statusIndicator = (
                        <span className="text-primary font-weight-bold">
                            <Spinner size="sm" className="mr-2" />
                            PROCESSING
                        </span>
                    );
                    break;
            }

            return (
                <Card className={`${!this.props.isLast ? "mb-3" : ""}`}>
                    <CardHeader>
                        <div className="d-flex flex-row flex-nowrap justify-content-between">
                            <CardTitle
                                title={j.description}
                                className="ellipsis mr-2"
                            >
                                {j.description}
                            </CardTitle>
                            <div className="d-flex flex-nowrap flex-shrink-0">
                                <div
                                    title="status"
                                    className="d-flex flex-shrink-0"
                                >
                                    {statusIndicator}
                                </div>
                                {(j.status === "COMPLETED" ||
                                    j.status === "ABORTED") && (
                                    <div
                                        className="cursor-pointer ml-4"
                                        title="Remove job from history"
                                        onClick={() =>
                                            this.props.removeJob(j.id)
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div>
                            <div className="text-muted">
                                Started{" "}
                                {getDisplayedDate(new Date(j.startedAt))}
                            </div>
                            <div className="text-muted">
                                Issued by: {j.issuer.fullName}
                            </div>
                        </div>
                        {j.error != null && (
                            <Fragment>
                                <span
                                    className="cursor-pointer"
                                    onClick={() =>
                                        this.setState((state) => ({
                                            showError: !state.showError,
                                        }))
                                    }
                                >
                                    {this.state.showError ? "Hide" : "Show"}{" "}
                                    error details{" "}
                                    <div
                                        className={`d-inline-block ml-2 mt-2 chevron ${
                                            this.state.showError
                                                ? "chevron-open"
                                                : ""
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </div>
                                </span>
                                <Collapse isOpen={this.state.showError}>
                                    <div className="text-danger">
                                        An error has been encountered: {j.error}
                                    </div>
                                </Collapse>
                            </Fragment>
                        )}
                        <div className={`text-right text-${color}`}>
                            {j.completedTasks}/{j.totalTasks}
                        </div>
                        <Progress
                            animated={j.status === "PROCESSING"}
                            color={color}
                            value={j.completedTasks}
                            max={j.totalTasks}
                        />
                    </CardBody>
                </Card>
            );
        }
    }
}

export default connect(
    (state: ApplicationState) => ({
        job: (jobId: string) => getJob(state, jobId),
    }),
    {
        fetchJob: jobIdFetchRequestedAction,
        removeJob: jobRemoveRequestedAction,
    },
)(JobProgress);
