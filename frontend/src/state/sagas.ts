import authSagas from "./auth/sagas";
import assignmentSetSagas from "./assignments/sagas";
import coursesSagas from "./course-selection/sagas";
import navigationBarSagas from "./navigationBar/sagas";
import canvasSaga from "./canvas-settings/sagas";
import groupSagas from "./groups/sagas";
import searchSaga from "./search/sagas";

export default function* rootSaga() {
    yield* authSagas();
    yield* assignmentSetSagas();
    yield* groupSagas();
    yield* coursesSagas();
    yield* navigationBarSagas();
    yield* canvasSaga();
    yield* searchSaga();
}
