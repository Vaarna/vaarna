import styles from "./Header.module.css";
import Link from "next/link";
import classNames from "classnames";
import React from "react";

export type HeaderProps = React.PropsWithChildren<unknown>;

export const Header: React.FC<HeaderProps> = ({ children }: HeaderProps) => {
  return (
    <nav className={styles.container}>
      <div className={classNames([styles.item, styles.title])}>
        <Link href="/">
          <a>GM Screen</a>
        </Link>
      </div>

      <div className={styles.item}>{children}</div>
    </nav>
  );
};
