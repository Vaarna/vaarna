import { useContext } from "react";
import { Context } from "store";
import { debounce } from "lodash";

export default function SpaceSelector() {
  const [state, dispatch] = useContext(Context);
  const setSpaceId = (spaceId: string) =>
    dispatch({ type: "SET_SPACE_ID", spaceId });

  return (
    <>
      <p>{state.spaceId}</p>
      <input onChange={debounce((ev) => setSpaceId(ev.target.value), 500)} />
    </>
  );
}
