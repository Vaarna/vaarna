import { createContext, useEffect, useReducer, useState } from "react";
import * as t from "zod";

export const State = t.object({
  spaceId: t.string().optional(),
});
export type State = t.infer<typeof State>;

export const emptyState: State = {};

export type Action =
  | { type: "SET_SPACE_ID"; spaceId: string }
  | { type: "CLEAR_SPACE_ID" };

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_SPACE_ID":
      return { ...state, spaceId: action.spaceId };
    case "CLEAR_SPACE_ID":
      return { ...state, spaceId: undefined };
  }
};

export const Context = createContext<[State, React.Dispatch<Action>]>(
  (undefined as unknown) as [State, React.Dispatch<Action>]
);

type Props = { initialState?: State };

export const Store: React.FC<Props> = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(reducer, initialState ?? emptyState);

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};
