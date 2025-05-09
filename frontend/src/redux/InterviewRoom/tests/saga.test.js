import { runSaga } from "redux-saga";
import axios from "axios";
import { Cookies } from "react-cookie";
import { handleToken } from "../testRoomSaga"; 
import { setToken, tokenStatus } from "../testRoomSlice";

jest.mock("axios");

jest.mock("react-cookie", () => {
  const mCookies = {
    get: jest.fn(),
  };
  return { Cookies: jest.fn(() => mCookies) };
});

describe("handleToken Saga", () => {
  const peer = "Alice";
  const token = "mocked-token";
  const roomName = "Testing Room";
  const action = {
    type: "FETCH_TOKEN",
    payload: { participantName: peer },
  };

  let dispatchedActions = [];

  beforeEach(() => {
    dispatchedActions = [];
    jest.clearAllMocks();
  });

  it("dispatches setToken on successful token fetch", async () => {
    axios.get.mockResolvedValue({});

    const mCookiesInstance = new Cookies();
    mCookiesInstance.get.mockReturnValue(token);

    await runSaga(
      {
        dispatch: (action) => dispatchedActions.push(action),
      },
      handleToken,
      action
    ).toPromise();

    expect(axios.get).toHaveBeenCalledWith("http://localhost:3000/token/getToken", {
      withCredentials: true,
      params: { participantName: peer },
    });

    expect(mCookiesInstance.get).toHaveBeenCalledWith("token" + peer);

    expect(dispatchedActions).toContainEqual(
      setToken({ peer, token, roomName })
    );
  });

  it("dispatches tokenStatus on token fetch failure", async () => {
    const errorMessage = "API error";
    axios.get.mockRejectedValue(new Error(errorMessage));

    await runSaga(
      {
        dispatch: (action) => dispatchedActions.push(action),
      },
      handleToken,
      action
    ).toPromise();

    expect(axios.get).toHaveBeenCalledWith("http://localhost:3000/token/getToken", {
      withCredentials: true,
      params: { participantName: peer },
    });

    expect(dispatchedActions).toContainEqual(
      tokenStatus({ peer, status: "error" })
    );
  });
});
