import authSagas from "./auth/sagas";
import assignmentSetSagas from "./assignments/sagas";
import coursesSagas from "./course-selection/sagas";
import navigationBarSagas from "./navigationBar/sagas";

export default function* rootSaga() {
    yield* authSagas();
    yield* assignmentSetSagas();
    yield* coursesSagas();
    yield* navigationBarSagas();
}
