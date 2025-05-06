import { takeLatest, put, call } from "redux-saga/effects";
import {
  fetchToken,
  fetchTokenB,
  setToken,
  tokenStatus,
} from "./testRoomSlice";
import axios from "axios";
import { Cookies } from "react-cookie";
function* handleToken(action) {
  const cookies = new Cookies();

  const peer = action.payload.participantName;
  console.log("Fetching:", peer, action.payload.participantName);
  try {
    yield call(axios.get, "http://localhost:3000/token/getToken", {
      withCredentials: true,
      params: { participantName: peer },
    });

    const token = cookies.get("token" + peer);

    yield put(setToken({ peer, token, roomName: "Testing Room" }));
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
