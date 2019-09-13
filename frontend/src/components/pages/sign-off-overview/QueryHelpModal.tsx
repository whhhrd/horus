import { Component, PureComponent } from "react";
import React from "react";
import { ModalHeader, ModalBody, Modal, Table, Badge } from "reactstrap";

interface QueryHelpModalProps {
    isOpen: boolean;
    onCloseModal: () => void;
}

/**
 * A modal that allows the user to create an announcement.
 */
export default class QueryHelpModal extends Component<QueryHelpModalProps> {
    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
                <ModalHeader toggle={() => this.props.onCloseModal()}>
                    How to use Advanced Search mode
                </ModalHeader>
                <ModalBody>
                    <p>
                        With the Advanced Search mode, you can filter certain
                        groups of students more specifically. This can easily
                        be done by constructing a query which combines labels
                        using the following operators:
                    </p>
                    <Table striped bordered size="sm">
                        <thead>
                            <tr>
                                <th>Operator</th>
                                <th>Meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>&</td>
                                <td>AND</td>
                            </tr>
                            <tr>
                                <td>|</td>
                                <td>OR</td>
                            </tr>
                            <tr>
                                <td>!</td>
                                <td>NOT</td>
                            </tr>
                        </tbody>
                    </Table>
                    <p>
                        In addition, you can use parentheses to make more
                        advanced queries. Example queries:
                    </p>
                    <ul>
                        <li>
                            (
                            <ExampleLabel>
                                <span>label-1</span>
                            </ExampleLabel>{" "}
                            & <ExampleLabel>label-2</ExampleLabel>) |
                            <ExampleLabel>label-3</ExampleLabel>
                        </li>
                        <li>
                            !(
                            <ExampleLabel>
                                <span>label-1</span>
                            </ExampleLabel>{" "}
                            & <ExampleLabel>label-2</ExampleLabel>) &
                            <ExampleLabel>label-3</ExampleLabel>
                        </li>
                        <li>
                            (<ExampleLabel>label-1</ExampleLabel> |{" "}
                            <ExampleLabel>label-2</ExampleLabel>| !
                            <ExampleLabel>label-4</ExampleLabel>) & !{" "}
                            <ExampleLabel>label-3</ExampleLabel>
                        </li>
                    </ul>
                </ModalBody>
            </Modal>
        );
    }
}

/**
 * A very simple and specific class for a label used for
 * QueryHelpModal
 */
// tslint:disable-next-line: max-classes-per-file
class ExampleLabel extends PureComponent {
    render() {
        return (
            <Badge
                pill
                color="dark"
                className={`p-label m-1 mb-1 py-1 px-2 shadow-sm`}
            >
                {this.props.children}
            </Badge>
        );
    }
}
