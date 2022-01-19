import styles from "./SideBySide.module.css";
import { PropsWithExactlyTwoChildren } from "util/react";
import classNames from "classnames";
import { useState } from "react";
import { delay } from "util/timeout";

export type SideBySideProps = PropsWithExactlyTwoChildren<{
  showRight: boolean;
  send: (v: string) => Promise<void>;
}>;

export const SideBySide: React.FC<SideBySideProps> = ({
  showRight,
  send,
  children,
}: SideBySideProps) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const s = () => {
    const trimmed = text.trim();
    if (sending || trimmed.length === 0) return;

    setSending(true);
    send(trimmed)
      .then(delay(2500)) // TODO: remove delay once there is a backend
      .then(() => setText(""))
      .catch((err) => console.error(err))
      .finally(() => setSending(false));
  };

  return (
    <div className={styles.container}>
      <main
        className={classNames(styles.left, {
          [styles.showLeft]: !showRight,
          [styles.showRight]: showRight,
        })}
      >
        {children[0]}
      </main>
      <aside
        className={classNames(styles.right, {
          [styles.showLeft]: showRight,
          [styles.showRight]: !showRight,
        })}
      >
        <div className={styles.logItems}>{children[1]}</div>
        <div className={styles.send}>
          <input
            className={styles.sendInput}
            type="text"
            disabled={sending}
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            onKeyPress={(ev) => (ev.key === "Enter" ? s() : void 0)}
          />
          <button className={styles.sendButton} onClick={() => s()}>
            Send
          </button>
        </div>
      </aside>
    </div>
  );
};
