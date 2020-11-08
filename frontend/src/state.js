import { createStore, applyMiddleware, compose } from "redux";
import { produce } from "immer";
import { createLogger } from "redux-logger";

const SHOW_ASSET = "SHOW_ASSET";
export function showAsset(data) {
  return {
    type: SHOW_ASSET,
    data,
  };
}

const SET_ASSET_LIST = "SET_ASSET_LIST";
export function setAssetList(data) {
  return {
    type: SET_ASSET_LIST,
    data,
  };
}

function reducer(state = {}, action) {
  switch (action.type) {
    case SHOW_ASSET:
      return produce(state, (draft) => {
        draft.showAsset = action.data;
      });

    case SET_ASSET_LIST:
      return produce(state, (draft) => {
        draft.assets = action.data;
      });

    default:
      return state;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(createLogger()))
);

export { store };
