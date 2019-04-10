import { CourseAuthScheme } from "../../api/permissions";

export const SET_LOGIN_REDIRECT_REQUESTED_ACTION = "auth/LOGIN_REDIRECT";
export const LOGIN_REQUESTED_ACTION = "auth/LOGIN_REQUESTED";
export const LOGIN_SUCCEEDED_ACTION = "auth/LOGIN_SUCCEEDED";
export const LOGIN_FAILED_ACTION = "auth/LOGIN_FAILED";

export const LOGOUT_REQUESTED_ACTION = "auth/LOGOUT_REQUESTED";
export const LOGOUT_COMPLETED_ACTION = "auth/LOGOUT_COMPLETED";

export const LOAD_AUTHENTICATION_REQUESTED_ACTION = "auth/LOAD_AUTHENTICATION";

export const AUTHORITIES_UPDATE_REQUESTED_ACTION = "auth/AUTHORITIES_UPDATE_REQUESTED";
export const AUTHORITIES_UPDATED_ACTION = "auth/AUTHORITIES_UPDATED";

// Course permissions
export const courseOwnView = CourseAuthScheme.ownView("COURSE");

// Group set permissions
export const groupSetsAnyList = CourseAuthScheme.anyList("COURSE_GROUPSET");
export const groupSetsAnyView = CourseAuthScheme.anyView("COURSE_GROUPSET");
export const groupSetsAnyCreate = CourseAuthScheme.anyCreate("COURSE_GROUPSET");
export const groupSetsAnyEdit = CourseAuthScheme.anyEdit("COURSE_GROUPSET");
export const groupSetsAnyDelete = CourseAuthScheme.anyDelete("COURSE_GROUPSET");

// Group permissions
export const groupsAnyList = CourseAuthScheme.anyList("COURSE_GROUP");
export const groupsAnyView = CourseAuthScheme.anyView("COURSE_GROUP");
export const groupsAnyCreate = CourseAuthScheme.anyCreate("COURSE_GROUP");
export const groupsAnyEdit = CourseAuthScheme.anyEdit("COURSE_GROUP");
export const groupsAnyDelete = CourseAuthScheme.anyDelete("COURSE_GROUP");

// Assignment set permissions
export const assignmentSetsAnyList = CourseAuthScheme.anyList("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyView = CourseAuthScheme.anyView("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyCreate = CourseAuthScheme.anyCreate("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyEdit = CourseAuthScheme.anyEdit("COURSE_ASSIGNMENTSET");
export const assignmentSetsAnyDelete = CourseAuthScheme.anyDelete("COURSE_ASSIGNMENTSET");

// Sign-off permissions
export const signOffsAnyList = CourseAuthScheme.anyList("COURSE_SIGNOFFRESULT");
export const signOffsAnyView = CourseAuthScheme.anyView("COURSE_SIGNOFFRESULT");
export const signOffsAnyCreate = CourseAuthScheme.anyCreate("COURSE_SIGNOFFRESULT");
export const signOffsAnyEdit = CourseAuthScheme.anyEdit("COURSE_SIGNOFFRESULT");
export const signOffsAnyDelete = CourseAuthScheme.anyDelete("COURSE_SIGNOFFRESULT");

// Comment permissions
export const commentAnyList = CourseAuthScheme.anyList("COURSE_COMMENT_STAFFONLY");
export const commentAnyView = CourseAuthScheme.anyView("COURSE_COMMENT_STAFFONLY");
export const commentAnyCreate = CourseAuthScheme.anyCreate("COURSE_COMMENT_STAFFONLY");
export const commentAnyEdit = CourseAuthScheme.anyEdit("COURSE_COMMENT_STAFFONLY");
export const commentAnyDelete = CourseAuthScheme.anyDelete("COURSE_COMMENT_STAFFONLY");
export const commentOwnEdit = CourseAuthScheme.ownEdit("COURSE_COMMENT_STAFFONLY");

// Label permission
export const labelAnyList = CourseAuthScheme.anyList("COURSE_LABEL");
export const labelAnyView = CourseAuthScheme.anyView("COURSE_LABEL");
export const labelAnyCreate = CourseAuthScheme.anyCreate("COURSE_LABEL");
export const labelAnyEdit = CourseAuthScheme.anyEdit("COURSE_LABEL");
export const labelAnyDelete = CourseAuthScheme.anyDelete("COURSE_LABEL");
export const labelMappingAnyList = CourseAuthScheme.anyList("COURSE_PARTICIPANT_LABEL_MAPPING");
export const labelMappingAnyView = CourseAuthScheme.anyView("COURSE_PARTICIPANT_LABEL_MAPPING");
export const labelMappingAnyCreate = CourseAuthScheme.anyCreate("COURSE_PARTICIPANT_LABEL_MAPPING");
export const labelMappingAnyEdit = CourseAuthScheme.anyEdit("COURSE_PARTICIPANT_LABEL_MAPPING");
export const labelMappingAnyDelete = CourseAuthScheme.anyDelete("COURSE_PARTICIPANT_LABEL_MAPPING");

// Supllementary roles
export const suppRolesAnyList = CourseAuthScheme.anyList("COURSE_SUPPLEMENTARY_ROLE");
export const suppRolesAnyView = CourseAuthScheme.anyView("COURSE_SUPPLEMENTARY_ROLE");
export const suppRolesAnyCreate = CourseAuthScheme.anyCreate("COURSE_SUPPLEMENTARY_ROLE");
export const suppRolesAnyEdit = CourseAuthScheme.anyEdit("COURSE_SUPPLEMENTARY_ROLE");
export const suppRolesAnyDelete = CourseAuthScheme.anyDelete("COURSE_SUPPLEMENTARY_ROLE");

export const suppRolesMappingAnyView = CourseAuthScheme.anyView("COURSE_SUPPLEMENTARY_ROLE_MAPPING");
export const suppRolesMappingAnyCreate = CourseAuthScheme.anyCreate("COURSE_SUPPLEMENTARY_ROLE_MAPPING");
export const suppRolesMappingAnyDelete = CourseAuthScheme.anyDelete("COURSE_SUPPLEMENTARY_ROLE_MAPPING");

// Participant permissions
export const participantsAnyList = CourseAuthScheme.anyList("COURSE_PARTICIPANT");
export const participantsAnyView = CourseAuthScheme.anyView("COURSE_PARTICIPANT");
export const participantsAnyCreate = CourseAuthScheme.anyCreate("COURSE_PARTICIPANT");
export const participantsAnyEdit = CourseAuthScheme.anyEdit("COURSE_PARTICIPANT");
export const participantsAnyDelete = CourseAuthScheme.anyDelete("COURSE_PARTICIPANT");

// Do a participant sync
export const participantsAdmin =
    CourseAuthScheme.every(participantsAnyCreate, participantsAnyEdit, participantsAnyDelete);

// View groups sets admin page
export const groupSetsAdmin = groupSetsAnyList;

// View an individual group sets admin page
export const groupsAdmin = CourseAuthScheme.every(groupSetsAdmin, groupsAnyList, groupsAnyView);

// View assignment sets admin page
export const assignmentsAdmin = CourseAuthScheme.every(assignmentSetsAnyList, assignmentSetsAnyView);

// View the course admin page
export const courseAdmin = CourseAuthScheme.some(groupSetsAdmin, assignmentsAdmin);

// View signoff overview page
export const signoffAssignmentsView = CourseAuthScheme.every(signOffsAnyList, signOffsAnyView,
    assignmentSetsAnyList, assignmentSetsAnyView, groupSetsAnyList, groupSetsAnyView, groupsAnyList, groupSetsAnyView);

// Perform signoff changes
export const signoffAssignmentsPerform = CourseAuthScheme.every(
    signoffAssignmentsView, signOffsAnyView, signOffsAnyEdit, signOffsAnyDelete);

// Sync group sets with Canvas
export const canvasGroupSetsSyncPerform = CourseAuthScheme.every(
    groupSetsAnyCreate, groupSetsAnyEdit, groupSetsAnyDelete);

// Sync groups with Canvas
export const canvasGroupsSyncPerform = CourseAuthScheme.every(groupsAnyCreate, groupsAnyEdit, groupsAnyDelete);

// View comment sidebar
export const viewCommentSidebar = CourseAuthScheme.every(commentAnyList, commentAnyView);

// View label manager
export const canViewListLabels = CourseAuthScheme.every(labelAnyView, labelAnyList);

// Export data
export const canExportData = CourseAuthScheme.every(participantsAnyList, participantsAnyView,
    signOffsAnyList, signOffsAnyView, assignmentSetsAnyList, assignmentSetsAnyView,
    labelMappingAnyList, labelMappingAnyView, groupsAnyList, groupsAnyView);
