import styles from "./Header.module.css";
import { useSpaceId } from "store";
import Link from "next/link";
import React from "react";

export const Header: React.FC = () => {
  const [spaceId, setSpaceId] = useSpaceId<string>();

  return (
    <div className={styles.header}>
      <Link href="/">
        <a className={styles.title}>GM Screen</a>
      </Link>
      <Link href="/item">Items</Link>
      <Link href="/asset">Assets</Link>
      <Link href="/table">Table</Link>
      <label>
        Space ID:{" "}
        <input
          className={styles.spaceSelector}
          value={spaceId}
          onChange={(ev) => setSpaceId(ev.target.value)}
        />
      </label>
      <button
        onClick={() => {
          const url = new URL(location.href);
          url.searchParams.set("spaceId", spaceId ?? "");
          navigator.clipboard.writeText(url.toString());
        }}
      >
        Copy
      </button>
    </div>
  );
};
