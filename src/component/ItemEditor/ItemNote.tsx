import { Loading } from "component/atom/Loading";
import { ItemNoteProps } from "./internal";

export const ItemNoteEditor: React.FC<ItemNoteProps> = ({
  item,
  setItem,
  save,
  inflight,
}: ItemNoteProps) => (
  <form
    onSubmit={(ev) => {
      ev.preventDefault();
      save();
    }}
  >
    <label>
      Path
      <input
        name="path"
        value={item.path}
        disabled={inflight}
        onChange={(ev) => setItem({ ...item, path: ev.target.value })}
      />
    </label>

    <label>
      Public
      <textarea
        name="public"
        style={{
          minWidth: "100%",
          minHeight: "40ex",
          boxSizing: "border-box",
        }}
        value={item.public}
        disabled={inflight}
        onChange={(ev) => setItem({ ...item, public: ev.target.value })}
      />
    </label>

    <label>
      Private
      <textarea
        name="private"
        style={{
          minWidth: "100%",
          minHeight: "40ex",
          boxSizing: "border-box",
        }}
        value={item.private}
        disabled={inflight}
        onChange={(ev) => setItem({ ...item, private: ev.target.value })}
      />
    </label>

    <button disabled={inflight} onClick={save}>
      Save <Loading hidden={!inflight} small fast />
    </button>
  </form>
);
