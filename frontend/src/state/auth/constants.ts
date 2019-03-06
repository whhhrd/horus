import { CourseAuthScheme } from "../../api/permissions";

export const SET_LOGIN_REDIRECT_REQUESTED_ACTION = "auth/LOGIN_REDIRECT";
export const LOGIN_REQUESTED_ACTION = "auth/LOGIN_REQUESTED";
export const LOGIN_SUCCEEDED_ACTION = "auth/LOGIN_SUCCEEDED";
export const LOGIN_FAILED_ACTION = "auth/LOGIN_FAILED";

export const LOGOUT_REQUESTED_ACTION = "auth/LOGOUT_REQUESTED";
export const LOGOUT_COMPLETED_ACTION = "auth/LOGOUT_COMPLETED";

export const LOAD_AUTHENTICATION_REQUESTED_ACTION = "auth/LOAD_AUTHENTICATION";

export const AUTHORITIES_UPDATED_ACTION = "auth/AUTHORITIES_UPDATED";

export const groupSetsAnyList = CourseAuthScheme.anyList("COURSE_GROUPSET");
export const groupSetsAnyView = CourseAuthScheme.anyView("COURSE_GROUPSET");
export const groupsSetsAnyCreate = CourseAuthScheme.anyCreate("COURSE_GROUPSET");
export const groupsSetsAnyEdit = CourseAuthScheme.anyEdit("COURSE_GROUPSET");
export const groupSetsAnyDelete = CourseAuthScheme.anyDelete("COURSE_GROUPSET");

export const groupsAnyList = CourseAuthScheme.anyList("COURSE_GROUP");
export const groupsAnyView = CourseAuthScheme.anyView("COURSE_GROUP");
export const groupsAnyCreate = CourseAuthScheme.anyCreate("COURSE_GROUP");
export const groupsAnyEdit = CourseAuthScheme.anyEdit("COURSE_GROUP");
export const groupsAnyDelete = CourseAuthScheme.anyDelete("COURSE_GROUP");

// View groups sets admin page
export const groupSetsAdmin = groupSetsAnyList;

// View an individual group sets admin page
export const groupsAdmin = CourseAuthScheme.every(groupSetsAdmin, groupsAnyList, groupsAnyView);

export const assignmentSetsAnyList = CourseAuthScheme.anyList("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyView = CourseAuthScheme.anyView("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyCreate = CourseAuthScheme.anyCreate("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyEdit = CourseAuthScheme.anyEdit("COURSE_ASSIGNMENTSET");
export const assignmentetsAnyDelete = CourseAuthScheme.anyDelete("COURSE_ASSIGNMENTSET");

// View assignment sets admin page
export const assignmentsAdmin = CourseAuthScheme.every(assignmentSetsAnyList, assignmentSetsAnyView);

// View the course admin page
export const courseAdmin = CourseAuthScheme.some(groupSetsAdmin, assignmentsAdmin);

export const signOffsAnyList = CourseAuthScheme.anyList("COURSE_SIGNOFFRESULT");
export const signOffsAnyView = CourseAuthScheme.anyView("COURSE_SIGNOFFRESULT");
export const signOffsAnyCreate = CourseAuthScheme.anyCreate("COURSE_SIGNOFFRESULT");
export const signOffsAnyEdit = CourseAuthScheme.anyEdit("COURSE_SIGNOFFRESULT");
export const signOffsAnyDelete = CourseAuthScheme.anyDelete("COURSE_SIGNOFFRESULT");

// View view signoff page
export const signoffAssignmentsView = CourseAuthScheme.every(signOffsAnyList, signOffsAnyView);

// Perform signoff changes
export const signoffAssignmentsPerform = CourseAuthScheme.every(
    signoffAssignmentsView, signOffsAnyView, signOffsAnyEdit, signOffsAnyDelete);
