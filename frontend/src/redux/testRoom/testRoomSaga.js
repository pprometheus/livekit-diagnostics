// redux/testRoom/testRoomSaga.js
import { takeLatest, put, call } from "redux-saga/effects";
import { fetchToken, setToken, tokenStatus } from "./testRoomSlice";
import { getToken } from "../../utils/helper";

function* handleToken(action) {
  try {
    const tokenData = yield call(getToken);
    yield put(setToken({ token: tokenData.token, roomName: action.payload.roomName }));
  } catch (error) {
    yield put(tokenStatus({ status: "error" })); 
    console.error("Error fetching token:", error.message);
  }
}

function* testRoomSaga() {
  yield takeLatest(fetchToken.type, handleToken); 
}

export default testRoomSaga;
