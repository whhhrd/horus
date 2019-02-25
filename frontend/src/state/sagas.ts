import authSagas from "./auth/sagas";
import assignmentSetSagas from "./assignments/sagas";
import coursesSaga from "./course-selection/sagas";

export default function* rootSaga() {
    yield* authSagas();
    yield* assignmentSetSagas();
    yield* coursesSaga();
}
