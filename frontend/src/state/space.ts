import Stream from "mithril/stream";

export const State = () => ({ space: Stream("") });
export type State = ReturnType<typeof State>;

export const Actions = (state: State) => ({
  setSpace: (space: string) => state.space(space),
});

export type Actions = ReturnType<typeof Actions>;
