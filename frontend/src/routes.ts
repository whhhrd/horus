export const PATH_LOGIN = "/login";
export const PATH_GENERAL_ADMINISTRATION = "/administration";
export const PATH_LOGOUT = "/logout";

export const PATH_COURSES                  = "/courses";
export const PATH_DASHBOARD                = `${PATH_COURSES}/:cid`;
export const PATH_ASSIGNMENT_SETS          = `${PATH_COURSES}/:cid/assignmentsets`;
export const PATH_SIGNOFF                  = `${PATH_COURSES}/:cid/assignmentsets/:asid`;
export const PATH_COURSE_ADMINISTRATION    = `${PATH_COURSES}/:cid/administration`;
export const PATH_ASSIGNMENT_SET_MANAGER   = `${PATH_COURSES}/:cid/administration/assignmentsets`;
export const PATH_CANVAS_TOKEN             = "/canvas/token";
export const PATH_CANVAS_IMPORT            = "/canvas/import";
export const PATH_GROUP_SET_MANAGER        = `${PATH_COURSES}/:cid/administration/groupsets`;
export const PATH_GROUP_SET_GROUPS_MANAGER = `${PATH_COURSES}/:cid/administration/groupsets/:gsid`;