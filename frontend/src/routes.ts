export const PATH_LOGIN = "/login";
export const PATH_GENERAL_ADMINISTRATION = "/administration";
export const PATH_LOGOUT = "/logout";

export const PATH_COURSES                  = "/courses";
export const PATH_COURSE_OPTIONS           = "/courses/options";
export const PATH_DASHBOARD                = `${PATH_COURSES}/:cid`;
export const PATH_ASSIGNMENT_SETS          = `${PATH_COURSES}/:cid/assignmentsets`;
export const PATH_SIGNOFF_OVERVIEW         = `${PATH_COURSES}/:cid/assignmentsets/:asid`;
export const PATH_SIGNOFF                  = `${PATH_COURSES}/:cid/signoff`;
export const PATH_COURSE_ADMINISTRATION    = `${PATH_COURSES}/:cid/administration`;
export const PATH_JOBS                     = `/self/jobs`;
export const PATH_JOBS_ALT                 = `${PATH_COURSES}/:cid/self/jobs`;
export const PATH_COURSE_LABEL_MANAGER     = `${PATH_COURSES}/:cid/administration/labels`;
export const PATH_COURSE_ROLES_MANAGER     = `${PATH_COURSES}/:cid/administration/roles`;
export const PATH_ASSIGNMENT_SET_MANAGER   = `${PATH_COURSES}/:cid/administration/assignmentsets`;
export const PATH_CANVAS_TOKEN             = "/canvas/token";
export const PATH_CANVAS_IMPORT            = "/canvas/import";
export const PATH_GROUP_SET_MANAGER        = `${PATH_COURSES}/:cid/administration/groupsets`;
export const PATH_GROUP_SET_GROUPS_MANAGER = `${PATH_COURSES}/:cid/administration/groupsets/:gsid`;
export const PATH_SIGNOFF_TABLE            = `${PATH_COURSES}/:cid/assignmentsets/:asid/signoff/table`;
export const PATH_ROOMS                    = `${PATH_COURSES}/:cid/rooms`;
export const PATH_QUEUE                    = `${PATH_COURSES}/:cid/rooms/:rid`;
export const PATH_PROJECTOR_PROMPT         = `/projector`;
export const PATH_PROJECTOR_MODE           = `${PATH_PROJECTOR_PROMPT}/:rid`;

export const PATH_HOME                     = PATH_COURSES;

export const PATH_MANUAL                   = "/manual.pdf";
