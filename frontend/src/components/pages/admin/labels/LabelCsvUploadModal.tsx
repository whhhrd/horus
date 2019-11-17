import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import {
    Form,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label,
    FormGroup,
    Input,
} from "reactstrap";

import { ApplicationState } from "../../../../state/state";
import {
    LabelCsvUploadAction,
    labelCsvUploadAction,
} from "../../../../state/labels/action";

import { Formik, Field } from "formik";

interface LabelCsvUploadModalProps {
    isOpen: boolean;
    courseId: number;

    labelCsvUpload: (
        courseId: number,
        formData: FormData,
    ) => LabelCsvUploadAction;

    onCloseModal: () => void;
}

interface LabelCsvUploadValues {
    file: File | null;
    wipeAll: boolean;
    wipeOccurring: boolean;
}

const labelCsvUploadDefaultValues: LabelCsvUploadValues = {
    file: null,
    wipeAll: false,
    wipeOccurring: false,
};

/**
 * A modal that allows the permitted user to create a label
 * with a name and a self-defined colour.
 */
class LabelCsvUploadModal extends Component<LabelCsvUploadModalProps> {
    onSubmit = (labelCsvUploadValues: LabelCsvUploadValues) => {
        const { file, wipeAll, wipeOccurring } = labelCsvUploadValues;

        if (file != null) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("wipeAll", String(wipeAll));
            formData.append("wipeOccurring", String(wipeOccurring));
            this.props.onCloseModal();
            this.props.labelCsvUpload(this.props.courseId, formData);
        } else {
            return;
        }
    }

    isValid(labelCsvUploadValues: LabelCsvUploadValues) {
        const { file } = labelCsvUploadValues;
        return file != null;
    }

    render() {
        const { isOpen, onCloseModal } = this.props;
        return (
            <Modal autoFocus={false} isOpen={isOpen}>
                <ModalHeader toggle={onCloseModal}>
                    {"Assign labels via CSV"}
                </ModalHeader>
                {isOpen && (
                    <Formik
                        initialValues={labelCsvUploadDefaultValues}
                        onSubmit={this.onSubmit}
                    >
                        {({ handleSubmit, values }) => (
                            <Fragment>
                                <ModalBody>
                                    <Form>
                                        <FormGroup>
                                            <Label>CSV file</Label>
                                            <Input
                                                type="file"
                                                name="file"
                                                accept=".csv"
                                                onChange={(e: any) => {
                                                    values.file =
                                                        e.target.files[0];
                                                    this.forceUpdate();
                                                }}
                                            />
                                        </FormGroup>
                                        <FormGroup check>
                                            <Label check>
                                                <Input
                                                    className=""
                                                    tag={Field}
                                                    type="checkbox"
                                                    name="wipeOccurring"
                                                    onClick={() => {
                                                        values.wipeAll = false;
                                                    }}
                                                />{" "}
                                                Replace existing labels for
                                                students in CSV
                                            </Label>
                                            <div className="ml-4">
                                                <Label check>
                                                    <Input
                                                        ref={"cb_wipeAll"}
                                                        tag={Field}
                                                        checked={values.wipeAll}
                                                        type="checkbox"
                                                        name="wipeAll"
                                                        disabled={
                                                            !values.wipeOccurring
                                                        }
                                                    />{" "}
                                                    Wipe existing labels for all
                                                    students
                                                </Label>
                                            </div>
                                        </FormGroup>
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        block
                                        size="md"
                                        color="secondary"
                                        outline
                                        onClick={onCloseModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        block
                                        size="md"
                                        color="primary"
                                        disabled={!this.isValid(values)}
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        Assign labels
                                    </Button>
                                </ModalFooter>
                            </Fragment>
                        )}
                    </Formik>
                )}
            </Modal>
        );
    }
}

export default connect((_: ApplicationState) => ({}), {
    labelCsvUpload: labelCsvUploadAction,
})(LabelCsvUploadModal);
