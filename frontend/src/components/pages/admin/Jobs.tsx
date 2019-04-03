import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";

import { Row, Col } from "reactstrap";
import { buildContent } from "../../pagebuilder";
import { ApplicationState } from "../../../state/state";
import { BatchJobDto } from "../../../api/types";
import { Action } from "redux";
import { jobsFetchRequestedAction } from "../../../state/jobs/action";
import { getJobs } from "../../../state/jobs/selectors";
import JobProgress from "../../JobProgress";

interface JobsProps {
    jobs: BatchJobDto[] | null;

    fetchJobs: () => Action;
}

class Jobs extends Component<JobsProps & RouteComponentProps<any>> {
    componentDidMount() {
        this.props.fetchJobs();
    }

    render() {
        return buildContent("Jobs", this.buildContent());
    }

    buildContent() {
        const { jobs } = this.props;

        if (jobs == null) {
            return null;
        }

        const running = jobs
            .filter((j) => j.status === "PROCESSING")
            .sort(this.sortDateDescending);

        const completed = jobs
            .filter((j) => j.status === "COMPLETED")
            .sort(this.sortDateDescending);

        const aborted = jobs
            .filter((j) => j.status === "ABORTED")
            .sort(this.sortDateDescending);

        const created = jobs
            .filter((j) => j.status === "CREATED")
            .sort(this.sortDateDescending);

        return (
            <div>
                {running.length > 0 && (
                    <Row className="px-2 d-flex justify-content-center mb-3">
                        <Col md="12" lg="6">
                            <h4>Running jobs</h4>
                            {running.length > 0 &&
                                running.map((j, i) => (
                                    <JobProgress
                                        isLast={i === running.length - 1}
                                        key={j.id}
                                        jobId={j.id}
                                    />
                                ))}
                            {running.length === 0 && (
                                <span className="text-muted">
                                    No jobs running
                                </span>
                            )}
                        </Col>
                    </Row>
                )}
                {created.length > 0 && (
                    <Row className="px-2 d-flex justify-content-center mb-3">
                        <Col md="12" lg="6">
                            <h4>Pending jobs</h4>
                            {created.length > 0 &&
                                created.map((j, i) => (
                                    <JobProgress
                                        isLast={i === created.length - 1}
                                        key={j.id}
                                        jobId={j.id}
                                    />
                                ))}
                            {created.length === 0 && (
                                <span className="text-muted">
                                    No jobs pending
                                </span>
                            )}
                        </Col>
                    </Row>
                )}
                {completed.length > 0 && (
                    <Row className="px-2 d-flex justify-content-center mb-3">
                        <Col md="12" lg="6">
                            <h4>Completed jobs</h4>
                            {completed.length > 0 &&
                                completed.map((j, i) => (
                                    <JobProgress
                                        isLast={i === completed.length - 1}
                                        key={j.id}
                                        jobId={j.id}
                                    />
                                ))}
                            {completed.length === 0 && (
                                <span className="text-muted">
                                    No jobs completed
                                </span>
                            )}
                        </Col>
                    </Row>
                )}
                {aborted.length > 0 && (
                    <Row className="px-2 d-flex justify-content-center mb-3">
                        <Col md="12" lg="6">
                            <h4>Aborted jobs</h4>
                            {aborted.length > 0 &&
                                aborted.map((j, i) => (
                                    <JobProgress
                                        isLast={i === aborted.length - 1}
                                        key={j.id}
                                        jobId={j.id}
                                    />
                                ))}
                            {aborted.length === 0 && (
                                <span className="text-muted">
                                    No jobs aborted
                                </span>
                            )}
                        </Col>
                    </Row>
                )}
            </div>
        );
    }

    sortDateDescending(a: BatchJobDto, b: BatchJobDto) {
        return new Date(a.startedAt).getTime() < new Date(b.startedAt).getTime()
            ? 1
            : -1;
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            jobs: getJobs(state),
        }),
        {
            fetchJobs: jobsFetchRequestedAction,
        },
    )(Jobs),
);
