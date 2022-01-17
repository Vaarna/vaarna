import styles from "./Header.module.css";
import Link from "next/link";
import classNames from "classnames";

export const Header: React.FC = () => {
  return (
    <nav className={styles.container}>
      <div className={classNames([styles.item, styles.title])}>
        <Link href="/">
          <a>GM Screen</a>
        </Link>
      </div>

      <div className={styles.item}>
        <Link href="/space/dd43fbda-40f0-49e7-8012-9485168262c1">
          <a>Sheet</a>
        </Link>
      </div>
    </nav>
  );
};
