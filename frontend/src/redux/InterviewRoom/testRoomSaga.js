import { takeLatest, put, call } from "redux-saga/effects";
import { fetchToken, fetchTokenB, setToken, tokenStatus } from "./testRoomSlice";
import {getToken} from "../../utils/helper";
function* handleToken(action) {
  const peer  = action.payload.participantName;
  console.log("Fetching:", peer, action.payload.participantName);
  try {
    const tokenData = yield call(getToken,peer); 
    yield put(setToken({ peer, token: tokenData, roomName:"Testing Room" }));
  } catch (error) {
    yield put(tokenStatus({ peer, status: "error" })); 
    console.error(`Error fetching token for ${peer}:`, error.message);
  }
}

function* testRoomSaga() {
  yield takeLatest(fetchToken.type, handleToken); 
  yield takeLatest(fetchTokenB.type, handleToken); 

}

export default testRoomSaga;
