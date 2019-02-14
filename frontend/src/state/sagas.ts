import authSagas from "./auth/sagas";
import coursesSaga from "./course-selection/sagas";

export default function* rootSaga() {
    yield* authSagas();
    yield* coursesSaga();
}
