import authSagas from './auth/sagas';

export default function* rootSaga() {
	yield* authSagas();
}
