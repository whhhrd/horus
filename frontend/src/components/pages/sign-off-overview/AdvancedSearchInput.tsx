import React, { Component } from "react";
import { Badge, ListGroup, ListGroupItem } from "reactstrap";
import {
    Editor,
    EditorState,
    DraftHandleValue,
    ContentState,
    Modifier,
    ContentBlock,
    CompositeDecorator,
    SelectionState,
    getDefaultKeyBinding,
} from "draft-js";

import Label from "../../Label";

import { LabelDto } from "../../../api/types";

import { findAllMatches } from "../../util";

interface AdvancedSearchInputProps {
    value?: string;
    labels: LabelDto[] | null;
    onEnterPress?: (query: string) => void;
    isLoading: boolean;
}

interface AdvancedSearchInputState {
    editorState: EditorState;
    suggestions: {
        selectedIndex: number;
        open: boolean;
        items: LabelDto[];
    };
}

const DISALLOWED_CHARS_REGEX = /[^0-9a-z-\|&\(\)!]/g;
const OP_REGEX = /[\|&\(\)!]/g;
const LABEL_REGEX = /[0-9a-z-]+/g;

export default class AdvancedSearchInput extends Component<AdvancedSearchInputProps, AdvancedSearchInputState> {

    editor: Editor | null = null;
    decorator: CompositeDecorator;

    constructor(props: AdvancedSearchInputProps) {
        super(props);
        this.decorator = new CompositeDecorator([
            {
                strategy: this.opStrategy,
                component: this.OpDecorElem,
            },
            {
                strategy: this.labelAvailableStrategy,
                component: this.LabelAvailableDecorElem,
            },
            {
                strategy: this.labelUnavailableStrategy,
                component: this.LabelUnavailableDecorElem,
            },
        ]);
        this.state = {
            editorState: EditorState.set(EditorState.createEmpty(), { decorator: this.decorator }),
            suggestions: {
                selectedIndex: 0,
                open: false,
                items: [],
            },
        };
    }

    componentDidMount() {
        // Set initial value upon mount
        const { value } = this.props;
        if (value != null && value.length > 0) {
            this.setFromQuery(value);
        }
        this.focusEditor();
    }

    componentDidUpdate(prevProps: AdvancedSearchInputProps) {
        // Set initial value when prop query changes or when labels are first set
        const { value, labels } = this.props;
        if (value !== prevProps.value || (prevProps.labels == null && labels != null)) {
            this.setFromQuery(value != null ? value : "");
        }
    }

    render() {
        const editor = <div
                    id="AdvancedSearchInput"
                    // This styling prevents it from overflowing like a normal div,
                    // and hence appears as a single line input.
                    style={{ minWidth: "200px", whiteSpace: "nowrap", overflow: "hidden" }}
                    className="form-control rounded mr-2 mb-2"
                    onClick={this.focusEditor}>
                        <Editor
                            ref={this.setEditor}
                            stripPastedStyles={true}
                            handlePastedText={this.handlePaste}
                            handleBeforeInput={this.handleBeforeInput}
                            editorState={this.state.editorState}
                            onChange={this.onChange}
                            handleKeyCommand={this.handleKeyCommand}
                            keyBindingFn={this.keyBindingFn}
                            handleReturn={this.handleReturn}
                            ariaMultiline={false}
                    />
                </div>;
        const suggestions = this.renderSuggestions();
        return <React.Fragment>
                {editor}
                {suggestions}
            </React.Fragment>;
    }

    private renderSuggestions = (): JSX.Element | void => {
        const { open, items, selectedIndex } = this.state.suggestions;
        const windowSelection = window.getSelection();
        const parent = windowSelection && windowSelection.focusNode && windowSelection.focusNode.parentElement;
        if (open && parent) {
            const left = parent.offsetLeft;
            return <div
                style={{
                    position: "absolute",
                    top: 40,
                    left,
                    zIndex: 100,
                }}
            >
                <ListGroup>
               {
                    items.map(
                       (label, index) =>
                       <ListGroupItem
                            action
                            tag="button"
                            active={index === selectedIndex}
                            onClick={() => this.insertSuggestion(this.state.editorState, index)}
                            key={label.id}>
                           <Label label={label}/>
                       </ListGroupItem>,
                    )
               }
               </ListGroup>
            </div>;
        }
    }

    /**
     * Strategy for applying a decorator to a label that is NOT available
     * in the labels list of the props.
     */
    private labelUnavailableStrategy = (
        block: ContentBlock,
        callback: (start: number, end: number) => void,
        _: ContentState) => {
        const labels = this.props.labels ? this.props.labels : [];
        const text = block.getText();
        const matches = findAllMatches(LABEL_REGEX, text);
        matches.forEach( (matchArr) => {
            const start = matchArr.index;
            if (!labels.some((l) => matchArr != null && l.name === matchArr[0])) {
                callback(start, start + matchArr[0].length);
            }
        });
    }

    /**
     * Strategy for applying a decorator to a label that is available
     * in the labels list of the props.
     */
    private labelAvailableStrategy = (
        block: ContentBlock,
        callback: (start: number, end: number) => void,
        _: ContentState) => {
        const labels = this.props.labels ? this.props.labels : [];
        const text = block.getText();
        const matches = findAllMatches(LABEL_REGEX, text);
        matches.forEach( (matchArr) => {
            const start = matchArr.index;
            if (labels.some((l) => matchArr != null && l.name === matchArr[0])) {
                callback(start, start + matchArr[0].length);
            }
        });
    }

    /**
     * Strategy for applying a decorator to an operator.
     */
    private opStrategy = (
        block: ContentBlock,
        callback: (start: number, end: number) => void,
        _: ContentState) => {
        const text = block.getText();
        const matches = findAllMatches(OP_REGEX, text);
        matches.forEach( (matchArr) => {
            const start = matchArr.index;
            callback(start, start + matchArr[0].length);
        });
    }

    /**
     * Provides "decoration" to labels that are not available in labels list.
     * These labels are the ones that are probably invalid/not found.
     */
    private LabelUnavailableDecorElem = (props: any) => {
        return <Badge
            pill
            className="p-label-search mr-1 mb-1 py-1 px-2 shadow-sm"
            style={{ border: "1px #F00 solid", backgroundColor: "#FFF", color: "#000" }}
        >
            {props.children}
        </Badge>;
    }

    /**
     * Provides "decoration" to labels that are available in labels list.
     */
    private LabelAvailableDecorElem = (props: any) => {
        const labels = this.props.labels ? this.props.labels : [];
        const text = props.decoratedText;
        const label = labels.find((l) => l.name === text);
        const labelColor = label != null ? label.color : "FF0000";
        const color = Label.textColor(labelColor);
        return <Badge
            pill
            className="p-label-search mr-1 mb-1 py-1 px-2 shadow-sm"
            style={{ backgroundColor: `#${labelColor}`, color }}
        >
            {props.children}
        </Badge>;
    }

    /**
     * Provides "decoration" to operators.
     */
    private OpDecorElem = (props: any) => {
        const text = props.decoratedText;
        return <span className={`search-op${text === "!" ? "-not" : ""}`}>{props.children}</span>;
    }

    /**
     * Handles an editor state change and updates suggestions accordingly.
     */
    private onChange = (editorState: EditorState, closeSuggestions: boolean = false) => {
        const labels = this.props.labels ? this.props.labels : [];
        const selection = editorState.getSelection();
        const nearestLabel = this.getNearestLabel(editorState);
        const showSuggestions = selection.getHasFocus()
        && selection.isCollapsed()
        && nearestLabel != null;
        const newState = { editorState, suggestions: {
            selectedIndex: 0,
            open: showSuggestions && nearestLabel != null && !closeSuggestions,
            items: nearestLabel != null && !closeSuggestions ?
                 labels.filter((label) => label.name.search(nearestLabel[0]) >= 0) : [],
        } };
        this.setState(newState);
    }

    private setEditor = (editor: Editor) => {
        this.editor = editor;
    }

    private focusEditor = () => {
        if (this.editor) {
          this.editor.focus();
        }
    }

    private handleBeforeInput = (chars: string): DraftHandleValue => {
        if (chars.match(DISALLOWED_CHARS_REGEX)) {
            return "handled";
        }
        return "not-handled";
    }

    private handlePaste = (text: string, _: string | undefined, editorState: EditorState): DraftHandleValue => {
        const sanitized = text.replace(DISALLOWED_CHARS_REGEX, "");
        const selection = editorState.getSelection();
        const content = editorState.getCurrentContent();
        let nextEditorState = EditorState.createEmpty();
        if (selection.isCollapsed()) {
        const nextContentState = Modifier.insertText(content, selection, sanitized);
        nextEditorState = EditorState.push(
            editorState,
            nextContentState,
            "insert-characters",
        );
        } else {
        const nextContentState = Modifier.replaceText(content, selection, sanitized);
        nextEditorState = EditorState.push(
            editorState,
            nextContentState,
            "insert-characters",
        );
        }
        this.onChange(nextEditorState, true);
        return "handled";
    }

    private handleReturn = (_: React.KeyboardEvent<{}>, editorState: EditorState): DraftHandleValue => {
        if (this.state.suggestions.open && this.state.suggestions.items.length > 0) {
            this.insertSuggestion(editorState, this.state.suggestions.selectedIndex);
        } else if (this.props.onEnterPress && this.props.labels) {
            const labelIds: Map<string, number> = new Map();
            this.props.labels.forEach((label) => {
                labelIds.set(label.name, label.id);
            });
            const query = editorState.getCurrentContent().getPlainText()
            // @ts-ignore
                .replace(LABEL_REGEX, (name) => {
                    const id = labelIds.get(name);
                    return id ? id : 0;
                });
            this.props.onEnterPress(query);
        }
        return "handled";
    }

    private insertSuggestion = (editorState: EditorState, suggestionIndex: number) => {
        const content = editorState.getCurrentContent();
        const { open, items } = this.state.suggestions;
        const nearestLabel = this.getNearestLabel(editorState);
        if (open && items.length > suggestionIndex && nearestLabel != null) {
            // Insert suggestion text.
            const suggestion = items[suggestionIndex];
            const nearestLabelRange = SelectionState.createEmpty(content.getFirstBlock().getKey())
                .set("anchorOffset", nearestLabel.index)
                .set("focusOffset", nearestLabel.index + nearestLabel[0].length) as SelectionState;
            const replacement = Modifier.replaceText(content, nearestLabelRange , suggestion.name);
            const replacedEditorState = EditorState.push(
                editorState,
                replacement,
                "change-block-data",
            );
            // Set caret to end of inserted suggestion.
            const newFocus = nearestLabel.index + suggestion.name.length;
            const nextEditorState = EditorState.forceSelection(
                replacedEditorState,
                editorState.getSelection()
                    .set("hasFocus", true)
                    .set("focusOffset", newFocus)
                    .set("anchorOffset", newFocus) as SelectionState,
            );
            this.onChange(nextEditorState, true);
        }
    }

    private handleKeyCommand = (command: string): DraftHandleValue => {
        switch (command) {
            case "up":
                this.setState((state) => ({
                    ...state,
                    suggestions: {
                        ...state.suggestions,
                        selectedIndex: state.suggestions.open ?
                            (state.suggestions.items.length
                                + state.suggestions.selectedIndex - 1) % state.suggestions.items.length
                            : state.suggestions.selectedIndex,
                    },
                }));
                return "handled";
            case "down":
                this.setState((state) => ({
                    ...state,
                    suggestions: {
                        ...state.suggestions,
                        selectedIndex: state.suggestions.open ?
                            (state.suggestions.selectedIndex + 1) % state.suggestions.items.length
                            : state.suggestions.selectedIndex,
                    },
                }));
                return "handled";
            case "esc":
                this.setState((state) => ({
                    ...state,
                    suggestions: {
                        ...state.suggestions,
                        open: false,
                    },
                }));
                return "handled";
        }
        return "not-handled";
    }

    private keyBindingFn = (e: React.KeyboardEvent<{}>): string | null => {
        switch (e.key) {
            case "Up":
            case "ArrowUp":
                e.preventDefault();
                return "up";
            case "Down":
            case "ArrowDown":
                e.preventDefault();
                return "down";
            case "Esc":
            case "Escape":
                e.preventDefault();
                return "esc";
        }
        return getDefaultKeyBinding(e);
    }

    private setFromQuery = (text: string) => {
        if (this.props.labels != null) {
            const sanitized = text.replace(DISALLOWED_CHARS_REGEX, "");
            const labelNames: Map<string, string> = new Map();
            this.props.labels.forEach((label) => {
                labelNames.set(`${label.id}`, label.name);
            });
            const replaced = sanitized
                // @ts-ignore
                    .replace(LABEL_REGEX, (id) => {
                        const name = labelNames.get(id);
                        return name ? name : "unknown-label";
                    });
            const newEditorState = EditorState.moveFocusToEnd(
                EditorState.createWithContent(
                    ContentState.createFromText(replaced),
                        this.decorator,
                ),
            );

            this.onChange(newEditorState, true);
        }
    }

    private getNearestLabel = (editorState: EditorState): RegExpExecArray | null => {
        const cursorOffset = editorState.getSelection().getFocusOffset();
        const text = editorState.getCurrentContent().getPlainText();
        return findAllMatches(LABEL_REGEX, text)
            .reverse()
            .find((match) => match.index < cursorOffset && match.index + match[0].length >= cursorOffset) || null;
    }

}
