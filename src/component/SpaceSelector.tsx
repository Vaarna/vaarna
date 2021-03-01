import { useSpaceId } from "store";
import { debounce } from "lodash";

export default function SpaceSelector() {
  const [spaceId, setSpaceId] = useSpaceId();

  return (
    <>
      <p>{spaceId}</p>
      <input onChange={debounce((ev) => setSpaceId(ev.target.value), 500)} />
    </>
  );
}
