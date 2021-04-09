import { useRouter } from "next/router";

import { useSpaceId } from "store";
import { useItem } from "hook/useItem";
import { ItemEditor } from "component/ItemEditor";
import { Loading } from "component/atom/Loading";

export default function ItemC(): React.ReactNode {
  const router = useRouter();
  const { id } = router.query;

  const [spaceId, _] = useSpaceId<string>();

  const itemProps = useItem(spaceId, id as string | undefined);

  if (itemProps.error) {
    return <div>{JSON.stringify(itemProps.error)}</div>;
  }
  if (itemProps.loading) {
    return <Loading large />;
  }
  if (itemProps.notFound) {
    return <div>Not Found</div>;
  }

  return <ItemEditor {...itemProps} item={itemProps.item} />;
}
