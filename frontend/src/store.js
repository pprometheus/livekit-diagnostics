import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import testRoomSaga from "./redux/InterviewRoom/testRoomSaga";
import testRoomReducer from "./redux/InterviewRoom/testRoomSlice"; 


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