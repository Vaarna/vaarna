import { useSpaceId } from "store";
import Link from "next/link";
import React, { useRef, useState } from "react";
import classNames from "classnames";

export const Header: React.FC = () => {
  const [spaceId, setSpaceId] = useSpaceId<string>();
  const [showMenu, setShowMenu] = useState(false);
  const navbarBurger = useRef<HTMLAnchorElement>(null);

  return (
    <nav className="navbar has-background-primary">
      <div className="navbar-brand">
        <Link href="/">
          <a className="navbar-item has-text-white is-size-3">GM Screen</a>
        </Link>

        <a
          role="button"
          className={classNames("navbar-burger", { "is-active": showMenu })}
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarMenu"
          ref={navbarBurger}
          onClick={() => {
            setShowMenu((prev) => !prev);
          }}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbarMenu"
        className={classNames("navbar-menu", { "is-active": showMenu })}
      >
        <div className="navbar-start">
          <Link href="/item">
            <a className="navbar-item">Items</a>
          </Link>
          <Link href="/asset">
            <a className="navbar-item">Assets</a>
          </Link>
          <Link href="/table">
            <a className="navbar-item">Table</a>
          </Link>
        </div>

        <div className="navbar-end">
          <form>
            <div className="field has-addons p-3">
              <div className="control">
                <button className="button is-static">Space ID</button>
              </div>
              <div className="control">
                <input
                  id="spaceId"
                  className="input"
                  style={{ minWidth: "23rem" }}
                  value={spaceId}
                  onChange={(ev) => setSpaceId(ev.target.value)}
                />
              </div>
              <div className="control">
                <button
                  className="button is-link"
                  onClick={() => {
                    const url = new URL(location.href);
                    url.searchParams.set("spaceId", spaceId ?? "");
                    navigator.clipboard.writeText(url.toString());
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};
