import React, {Component, SyntheticEvent} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {ApplicationState} from "../../../state/state";
import Autosuggest from "react-autosuggest";
import {connect} from "react-redux";
import {GroupAssignmentSetSearchResultDto, GroupDtoSearch} from "../../../state/types";
import {NotificationProps} from "../../../state/notifications/types";
import {getSignOffSearchResults} from "../../../state/search/selectors";
import {signOffSearchQueryAction} from "../../../state/search/action";
import {push} from "connected-react-router";

interface SignOffSearchProps {
    searchResult: GroupAssignmentSetSearchResultDto | undefined;
    doSearchQuery: (courseID: number, query: string) => {
        type: string,
    };
    redirectTo: (url: string) => {};
}

interface SignOffSearchState {
    searchQuery: string;
}

class SignOffSearch extends Component<SignOffSearchProps & RouteComponentProps<any> & NotificationProps,
    SignOffSearchState> {

    constructor(props: SignOffSearchProps & RouteComponentProps<any> & NotificationProps) {
        super(props);

        this.state = {
            searchQuery: "",
        };
    }

    render() {
        return (
            <Autosuggest
                suggestions={this.props.searchResult !== undefined ? this.props.searchResult.groups : []}
                onSuggestionsFetchRequested={(value: any) => {
                    this.props.doSearchQuery(this.props.match.params.cid, value.value);
                }}
                onSuggestionsClearRequested={() => {
                    return;
                }}
                getSuggestionValue={(suggestion: GroupDtoSearch) => {
                    return suggestion.name;
                }}
                renderSuggestion={(suggestion: GroupDtoSearch) => {
                    let memberString: string;
                    if (suggestion.memberNames.length === 0) {
                        memberString = "";
                    } else {
                        memberString = " (";
                        memberString += suggestion.memberNames[0];
                        for (let i = 1; i < suggestion.memberNames.length; i++) {
                            memberString += ", " + suggestion.memberNames[i];
                        }
                        memberString += ")";
                    }

                    const suggestionName = suggestion.name + memberString;
                    return (
                        <div>
                            {suggestionName}
                        </div>
                    );
                }}
                onSuggestionSelected={(_: any, suggestion: any) => {
                    const groupSearchResult: GroupDtoSearch = suggestion.suggestion;
                    const newURL = "/courses/" + this.props.match.params.cid + "/assignmentsets/" +
                        this.props.match.params.asid + "/signoff?g=" + groupSearchResult.id;
                    this.props.redirectTo(newURL);
                }}
                inputProps={{
                    placeholder: "Input something",
                    value: this.state.searchQuery,
                    onChange: (_: SyntheticEvent, newValue: any) => {
                        this.setState(() => ({searchQuery: newValue.newValue}));
                    },
                }}
            />
        );
    }

}

export default withRouter(connect((state: ApplicationState) => ({
    searchResult: getSignOffSearchResults(state),
}), {
    doSearchQuery: (courseID: number, query: string) => signOffSearchQueryAction(courseID, query),
    redirectTo: (url: string) => push(url),
})(SignOffSearch));
