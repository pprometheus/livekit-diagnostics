import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import testRoomReducer from "./redux/testRoom/testRoomSlice";
import testRoomSaga from "./redux/testRoom/testRoomSaga";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    testRoom: testRoomReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(testRoomSaga);

export default store;