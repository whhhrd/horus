import React, { Component } from "react";
import { CommentThreadDtoFull, CommentDto, CommentThreadDtoBrief } from "../../state/types";

import Comment from "../comments/Comment";
import { connect } from "react-redux";
import { getCommentThread } from "../../state/comments/selectors";
import { ApplicationState } from "../../state/state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    IconDefinition,
    faUser,
    faPencilRuler,
    faUsers,
    faTasks,
    faPlus,
    faEye,
    faEyeSlash,
    faInfo,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Collapse, Alert, ListGroup, Card, CardTitle, Badge } from "reactstrap";
import CommentCreatorModal from "./CommentCreatorModal";
import { CommentThreadRequestedAction, commentThreadRequestedAction } from "../../state/comments/action";
import CardBody from "reactstrap/lib/CardBody";
import CommentThreadCreatorModal from "./CommentThreadCreatorModal";

export enum CommentThreadType {
    Participant,
    Group,
    Assignment,
    Signoff,
}

interface CommentThreadProps {
    linkedEntityId: number;
    linkedEntityType: CommentThreadType;
    commentThreadBrief: CommentThreadDtoBrief | null;
    commentThreadSubject: string;
    showCommentThreadContent: boolean;
    needToFetchThread: boolean;

    commentThread: (ctid: number) => CommentThreadDtoFull | null;
    fetchCommentThread: (ctid: number) => CommentThreadRequestedAction;
}

interface CommentThreadState {
    commentCreatorModalOpen: boolean;
    commentThreadCreatorModalOpen: boolean;
    showCommentThreadContent: boolean;
}

/**
 * Usage:
 *
 * In order to use a CommentThread, you have to specify certain props, namely:
 * 1. linkedEntityId: this is the ID of the participant, group, assignment or signoff result
 * 2. linkedEntityType: this is the type of the entity. Use CommentThreadType to specify it to your needs
 * 3. commentThreadBrief: this is the CommentThreadDtoBrief that is also part of the entity (simply put
 *        commentThread!), I check for null.
 * 4. commendThreadSubject: What is this comment thread about? This will be the highlighted part of the comment thread
 *        title.
 * 5. showCommentThreadContent: do you want the collapse to be open or closed (when the component mounts)?
 *        'true' for open, 'false' for closed
 * 6. needToFetchThread: fetching the comments before making the comment thread can be more performant when you want to
 *        fetch multiple comment threads. If you have done so, you can set this to 'false'. Otherwise, if you want a
 *        seperate call for fetching this comment thread, set this to 'true'.
 *
 * Example comment thread:
 * <CommentThread linkedEntityId={participantX.id}
 *                linkedEntityType={CommentThreadType.Participant}
 *                commentThreadBrief={participantX.commentThread}
 *                commentThreadSubject="Justin Praas"
 *                showCommentThreadContent={true}
 *                needToFetchThread={true} />
 */
class CommentThread extends Component<CommentThreadProps, CommentThreadState> {

    constructor(props: CommentThreadProps) {
        super(props);
        this.state = {
            commentCreatorModalOpen: false,
            commentThreadCreatorModalOpen: false,
            showCommentThreadContent: props.showCommentThreadContent,
        };
        this.toggleCreateCommentThreadModal = this.toggleCreateCommentThreadModal.bind(this);
        this.toggleCreateCommentModal = this.toggleCreateCommentModal.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    componentDidMount() {
        const { commentThreadBrief, needToFetchThread } = this.props;
        if (needToFetchThread &&
            commentThreadBrief != null &&
            this.props.commentThread(commentThreadBrief.id) == null) {
            this.props.fetchCommentThread(commentThreadBrief.id);
        }
    }

    toggleCreateCommentModal() {
        this.setState((state) => ({ commentCreatorModalOpen: !state.commentCreatorModalOpen }));
    }

    toggleCreateCommentThreadModal() {
        this.setState((state) => ({ commentThreadCreatorModalOpen: !state.commentThreadCreatorModalOpen }));
    }

    toggleCollapse() {
        this.setState((state) => ({ showCommentThreadContent: !state.showCommentThreadContent }));
    }

    render() {
        let borderColor: string;
        let titleEntityPrefix: string;
        switch (this.props.linkedEntityType) {
            case CommentThreadType.Assignment:
                borderColor = `thread-border-assignment`;
                titleEntityPrefix = "Assignment";
                break;
            case CommentThreadType.Participant:
                borderColor = `thread-border-participant`;
                titleEntityPrefix = "Student";
                break;
            case CommentThreadType.Signoff:
                borderColor = `thread-border-signoff`;
                titleEntityPrefix = "Signoff";
                break;
            case CommentThreadType.Group:
                borderColor = `thread-border-group`;
                titleEntityPrefix = "Group";
                break;
        }

        return (
            <div>
                <Card className={`m-0 my-3 mw-100 ${borderColor!}`}>
                    <CardBody>
                        <div className="d-flex justify-content-between flex-row flex-nowrap">
                            <CardTitle className="my-auto d-flex mr-2">
                                {this.buildCommentThreadTitle(titleEntityPrefix!)}
                            </CardTitle>
                            <Button color="primary" size="sm" onClick={() => this.toggleCollapse()}>
                                {this.state.showCommentThreadContent ? "Hide" : "Show"}
                            </Button>
                        </div>
                        <Collapse isOpen={this.state.showCommentThreadContent}>
                            {this.buildCommentThreadContent()}
                        </Collapse>
                    </CardBody>
                </Card>
            </div>
        );
    }

    buildCommentThreadTitle(titlePrefix: string) {
        let iconElement: IconDefinition | undefined;
        switch (this.props.linkedEntityType) {
            case (CommentThreadType.Participant): iconElement = faUser; break;
            case (CommentThreadType.Group): iconElement = faUsers; break;
            case (CommentThreadType.Assignment): iconElement = faPencilRuler; break;
            case (CommentThreadType.Signoff): iconElement = faTasks; break;
        }

        const numberOfComments = this.props.commentThreadBrief !== null ?
            (this.props.commentThread(this.props.commentThreadBrief.id) !== null ?
                this.props.commentThread(this.props.commentThreadBrief.id)!.comments.length : 0) : 0;

        return (
            <mark className="px-2">
                <abbr title={`Comment thread about ${titlePrefix}: ${this.props.commentThreadSubject}`}>
                    <FontAwesomeIcon className="mr-2" icon={iconElement!} />
                    {this.props.commentThreadSubject}
                    {numberOfComments > 0 ?
                        <small>
                            <Badge pill color="primary" className="ml-2">{numberOfComments}</Badge>
                        </small> : null}
                </abbr>
            </mark>
        );
    }

    buildComments(comments: CommentDto[], commentsVisible: boolean) {
        const visibilityIcon = commentsVisible ?
            <FontAwesomeIcon icon={faEye} size="lg" /> :
            <FontAwesomeIcon icon={faEyeSlash} size="lg" />;

        if (comments.length > 0) {
            return (<div>
                <Alert color={commentsVisible ? "warning" : "success"} className="my-3 d-flex">
                    <div className="my-auto mr-3">
                        <span>{visibilityIcon}</span>
                    </div>
                    <div>
                        Comments in this thread are {commentsVisible ?
                            "visible to designated students" : "hidden from students"}.
                    </div>
                </Alert>
                <ListGroup className="my-3">
                    {
                        comments.map((comment) =>
                            <Comment key={comment.id} comment={comment} />)
                    }
                </ListGroup>
            </div>
            );
        } else {
            return (
                <Alert color="info" className="mt-3 d-flex">
                    <div className="my-auto mr-3">
                        <FontAwesomeIcon icon={faInfo} size="lg" />
                    </div>
                    <div>Empty comment thread.</div>
                </Alert>
            );
        }
    }

    buildCommentThreadContent() {
        if (this.props.commentThreadBrief == null) {
            return (
                <div>
                    <Alert color="info" className="mt-3 d-flex">
                        <div className="my-auto mr-3">
                            <FontAwesomeIcon icon={faInfo} size="lg" />
                        </div>
                        <div>Empty comment thread.</div>
                    </Alert>
                    <Button outline block
                        color="primary"
                        size="md"
                        onClick={() => this.toggleCreateCommentThreadModal()}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />Add comment
                    </Button>
                    <CommentThreadCreatorModal
                        onCloseModal={this.toggleCreateCommentThreadModal}
                        linkedEntityId={this.props.linkedEntityId}
                        linkedEntityType={this.props.linkedEntityType}
                        isOpen={this.state.commentThreadCreatorModalOpen} />
                </div>
            );
        } else if (this.props.commentThread(this.props.commentThreadBrief.id) == null) {
            return (
                <Alert color="warning" className="mt-4 d-flex">
                    <div className="my-auto mr-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                    </div>
                    <div>Deleted comment thread.
                        Please <a href="#"
                            onClick={() => window.location.reload()}>refresh</a> in order to create a new one.
                    </div>
                </Alert>
            );

        } else {
            const { comments, id, type } = this.props.commentThread(this.props.commentThreadBrief.id)!;
            const commentsVisible = type === "PUBLIC";
            return (
                <div>
                    {this.buildComments(comments, commentsVisible)}
                    <Button outline block color="primary" size="md" onClick={() => this.toggleCreateCommentModal()}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />Add comment
                    </Button>
                    <CommentCreatorModal
                        commentThreadId={id}
                        commentThreadType={type}
                        onCloseModal={this.toggleCreateCommentModal}
                        isOpen={this.state.commentCreatorModalOpen} />
                </div>
            );
        }
    }
}

export default connect((state: ApplicationState) => ({
    commentThread: (ctid: number) => getCommentThread(state, ctid),
}), { fetchCommentThread: commentThreadRequestedAction })(CommentThread);
