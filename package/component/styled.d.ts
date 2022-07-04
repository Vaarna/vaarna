import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    borderRadius: string;
    borderRadiusTop: string;

    margin: {
      small: string;
      normal: string;
      large: string;
      text: string;
    };

    fontFamily: {
      sansSerif: string;
      serif: string;
      monospace: string;
    };

    color: {
      main: string;
      secondary: string;
      dropShadow: string;
    };
  }
}
