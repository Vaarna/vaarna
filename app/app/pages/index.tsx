import {
  createSpace,
  selectSpaceCreateInProgress,
  useAppDispatch,
  useAppSelector,
} from "@vaarna/state";
import { useRouter } from "next/router";

export default function Index(): React.ReactNode {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const inProgress = useAppSelector(selectSpaceCreateInProgress);

  const f = () =>
    dispatch(createSpace({ name: "" }))
      .unwrap()
      .then((v) => router.push(`/space/${v.spaceId}`));

  return (
    <>
      <button disabled={inProgress} onClick={f}>
        Create Space
      </button>
    </>
  );
}
