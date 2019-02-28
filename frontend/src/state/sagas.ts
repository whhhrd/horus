import authSagas from "./auth/sagas";
import assignmentSetSagas from "./assignments/sagas";
import coursesSagas from "./course-selection/sagas";
import navigationBarSagas from "./navigationBar/sagas";
import groupSagas from "./groups/sagas";

export default function* rootSaga() {
    yield* authSagas();
    yield* assignmentSetSagas();
    yield* groupSagas();
    yield* coursesSagas();
    yield* navigationBarSagas();
}
