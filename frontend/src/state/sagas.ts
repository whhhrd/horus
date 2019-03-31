import authSagas from "./auth/sagas";
import assignmentSetSagas from "./assignments/sagas";
import coursesSagas from "./courses/sagas";
import navigationBarSagas from "./navigationBar/sagas";
import canvasSaga from "./canvas-settings/sagas";
import groupSagas from "./groups/sagas";
import signOffSagas from "./sign-off/sagas";
import commentsSagas from "./comments/sagas";
import searchSaga from "./search/sagas";
import overviewSagas from "./overview/saga";
import studentDashboardSagas from "./student-dashboard/sagas";
import participantSagas from "./participants/sagas";
import labelsSaga from "./labels/sagas";
import rolesSagas from "./roles/sagas";
import queuingSagas from "./queuing/sagas";
import roomsSagas from "./rooms/sagas";

export default function* rootSaga() {
    yield* authSagas();
    yield* assignmentSetSagas();
    yield* groupSagas();
    yield* coursesSagas();
    yield* commentsSagas();
    yield* navigationBarSagas();
    yield* canvasSaga();
    yield* signOffSagas();
    yield* searchSaga();
    yield* overviewSagas();
    yield* studentDashboardSagas();
    yield* participantSagas();
    yield* labelsSaga();
    yield* rolesSagas();
    yield* queuingSagas();
    yield* roomsSagas();
}
