import classnames from "classnames";
import s from "./Loading.module.css";

export const Loading: React.FC<{
  small?: boolean;
  large?: boolean;
  fast?: boolean;
  slow?: boolean;
  hidden?: boolean;
}> = ({ small, large, fast, slow, hidden }) => (
  <div
    className={classnames(s.center, {
      [s.small]: small,
      [s.large]: large,
      [s.fast]: fast,
      [s.slow]: slow,
    })}
    style={{ visibility: hidden ? "hidden" : undefined }}
  >
    <div className={s.loading} />
  </div>
);
