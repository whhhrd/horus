import { ApplicationState } from "../state";

export const getStudentDashboardData = (state: ApplicationState) =>
    state.studentDashboard == null ? null : state.studentDashboard;
