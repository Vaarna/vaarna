import styles from "./ItemList.module.css";
import { Item, Items } from "type/item";
import Link from "next/link";

type Props = {
  items: Items;
};

function ItemComponent({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.itemId}`}>
      <div className={styles.item}>
        <p>Space ID: {item.spaceId}</p>
        <p>Item ID: {item.itemId}</p>
        <p>Version: {item.version}</p>
        <p>Path: {item.path}</p>
        <p>Created: {item.created}</p>
        <p>Updated: {item.updated}</p>
      </div>
    </Link>
  );
}

export default function ItemList({ items }: Props) {
  return (
    <div className={styles.items}>
      {items
        .sort((lhs, rhs) => lhs.path.localeCompare(rhs.path))
        .map((v) => (
          <ItemComponent key={v.itemId} item={v} />
        ))}
    </div>
  );
}
