// redux/testRoom/testRoomSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = { token: null, roomName: null, status: null };
const testRoomSlice = createSlice({
  name: "testRoom",
  initialState,
  reducers: {
    fetchToken: (state, action) => {
      state.status = "loading"; 
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
      state.roomName = action.payload.roomName;
      state.status = "success";
    },
    clearToken: (state) => {
      state.token = null;
      state.roomName = null;
      state.status = null;
    },
    tokenStatus: (state, action) => {
      state.status = action.payload.status;
    },
  },
});

export const { fetchToken, setToken, clearToken, tokenStatus } = testRoomSlice.actions;
export const selectToken = (state) => state.testRoom.token;
export default testRoomSlice.reducer;
