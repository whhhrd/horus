import { Component } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Label,
    FormGroup,
} from "reactstrap";
import React from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import { Formik, Field } from "formik";
import {
    CanvasGroupSetImportRequestedAction,
    canvasGroupSetImportRequestedAction,
} from "../../../../../state/canvas-settings/actions";

interface GroupSetImportModalProps {
    isOpen: boolean;

    onCloseModal: () => void;

    importGroupSets: (
        courseId: number,
        formData: FormData,
    ) => CanvasGroupSetImportRequestedAction;
}

interface ImportValues {
    name: string;
    excessGroups: number;
    file: File | null;
}

class GroupSetImportModal extends Component<
    GroupSetImportModalProps & RouteComponentProps<any>
> {
    isValid() {
        return true;
    }

    onSubmit(values: ImportValues) {
        if (values.file != null) {
            const formData = new FormData();
            formData.append("file", values.file);
            formData.append("name", values.name);
            formData.append("excessGroups", String(values.excessGroups));
            this.props.onCloseModal();
            this.props.importGroupSets(this.props.match.params.cid, formData);
        } else {
            return;
        }
    }

    render() {
        const { isOpen, onCloseModal } = this.props;
        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={() => onCloseModal()}>
                    Importing group set from CSV
                </ModalHeader>
                <Formik
                    initialValues={{
                        name: "",
                        excessGroups: 0,
                        file: null,
                    }}
                    onSubmit={(result: ImportValues) => this.onSubmit(result)}
                >
                    {({ handleSubmit, values }) => (
                        <div>
                            <ModalBody>
                                <FormGroup>
                                    <Label>Group set name</Label>
                                    <Input
                                        tag={Field}
                                        name="name"
                                        autoComplete="off"
                                        autoFocus
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Number of excess groups</Label>
                                    <Input
                                        tag={Field}
                                        type="number"
                                        name="excessGroups"
                                        autoFocus
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>CSV file</Label>
                                    <Input
                                        type="file"
                                        name="file"
                                        accept=".csv"
                                        onChange={(e: any) => {
                                            values.file = e.target.files[0];
                                        }}
                                    />
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    block
                                    outline
                                    onClick={() => onCloseModal()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    block
                                    disabled={!this.isValid()}
                                    onClick={() => handleSubmit()}
                                >
                                    Start importing
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </Formik>
            </Modal>
        );
    }
}

export default withRouter(
    connect(
        () => ({}),
        {
            importGroupSets: canvasGroupSetImportRequestedAction,
        },
    )(GroupSetImportModal),
);
