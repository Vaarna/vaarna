import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "state/hook";
import { createSpace, selectSpaceCreateInProgress } from "state/slice";

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
      <p>This is the homescreen. There is no content here yet.</p>
      <p>Add a button to create a new space here.</p>
      <button disabled={inProgress} onClick={f}>
        Create Space
      </button>
    </>
  );
}
