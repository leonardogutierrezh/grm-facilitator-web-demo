import { createStore } from "redux";
import reducers from "./ducks";

// Web build: no Reactotron (native-only dev tool). Plain Redux store.
const store = createStore(reducers);

export default store;
