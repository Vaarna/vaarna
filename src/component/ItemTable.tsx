import { Item, Items } from "type/item";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";

const formatTime = (v: number) => formatDistanceToNowStrict(v, { addSuffix: true });

type RowProps = { item: Item };

const Row: React.FC<RowProps> = ({ item }: RowProps) => {
  return (
    <tr>
      <td>{item.spaceId}</td>
      <td>
        <Link href={`/item/${item.itemId}`}>{item.itemId}</Link>
      </td>
      <td>{item.path}</td>
      <td>{formatTime(item.created)}</td>
      <td>{formatTime(item.updated)}</td>
      <td style={{ textAlign: "right" }}>{item.version}</td>
    </tr>
  );
};

export type ItemTableProps = { items: Items };

export const ItemTable: React.FC<ItemTableProps> = ({ items }: ItemTableProps) => {
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>SpaceID</th>
            <th>ItemID</th>
            <th>Path</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          {items
            .sort((lhs, rhs) => lhs.path.localeCompare(rhs.path))
            .map((v) => (
              <Row key={v.itemId} item={v} />
            ))}
        </tbody>
      </table>
    </div>
  );
};
