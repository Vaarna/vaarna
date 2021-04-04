import { ItemProps, ItemNoteEditor } from "./internal";

export const ItemEditor: React.FC<ItemProps> = (props) => {
  const { item } = props;

  if (item.type === "note") return <ItemNoteEditor {...props} item={item} />;

  return (
    <>
      <h1>{item.path}</h1>
      <p>This item cannot be edited at this time.</p>
      <ul>
        <li>Space ID: {item.spaceId}</li>
        <li>Item ID: {item.itemId}</li>
        <li>Created: {item.created}</li>
        <li>Updated: {item.updated}</li>
        <li>Type: {item.type}</li>
      </ul>
    </>
  );
};
