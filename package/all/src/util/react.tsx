import React from "react";

export type PropsWithExactlyTwoChildren<T> = T & {
  children: [React.ReactNode, React.ReactNode];
};
