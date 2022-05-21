import { DefaultTheme } from "styled-components";

export const defaultTheme: DefaultTheme = {
  borderRadius: "4px",
  borderRadiusTop: "4px 4px 0 0",

  margin: {
    small: "0.25rem",
    normal: "0.5rem",
    large: "1rem",
    text: "0.25rem 0.5rem",
  },

  fontFamily: {
    sansSerif:
      "-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif",
    serif:
      "Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid Serif, Times, Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
    monospace: "Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace",
  },

  color: {
    main: "hsl(28 100% 70%)",
    secondary: "hsl(222 70% 70%)",
    dropShadow: "rgba(0 0 0 / 0.3)",
  },
};
