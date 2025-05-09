import { takeLatest, put, call } from "redux-saga/effects";
import { fetchToken, setToken, tokenStatus } from "./testRoomSlice";
import axios from "axios";
import toast from "react-hot-toast";
export function* handleToken(action) {

  const peer = action.payload.participantName;
  console.log("Fetching:", peer, action.payload.participantName);
  try {
    toast.dismiss();
    const response = yield call(
      axios.get,
      "http://localhost:3000/token/getToken",
      {
        withCredentials: true,
        params: { participantName: peer },
      }
    );

    console.log("Server response", response?.data?.token);

    const token = response.data?.token;

    yield put(setToken({ peer, token, roomName: "Testing Room" }));
  } catch (error) {
    yield put(tokenStatus({ peer, status: "error" }));
    toast.error("Unable to connect to Server");
    console.error(`Error fetching token for ${peer}:`, error.message);
  }
}

function* testRoomSaga() {
  yield takeLatest(fetchToken.type, handleToken);
}

export default testRoomSaga;
