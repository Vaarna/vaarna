import styled, { css } from "styled-components";

type Clickable = { clickable: boolean };

export const Container = styled.div<Clickable>`
  border: 1px solid black;
  margin: 0.1rem;
  display: flex;
  width: fit-content;

  ${(props) =>
    props.clickable
      ? css`
          cursor: pointer;
        `
      : ""}
`;

export const Name = styled.div`
  border-right: 1px solid black;
  background-color: lightgray;
  padding: 0.2rem 0.5rem;
  display: flex;
  align-items: center;
`;

export const Value = styled.div`
  min-height: 4rem;
  min-width: 4rem;
  padding: 0.4rem;
  border: 0.4rem inset lightgray;

  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const ClickableText = styled.span<Clickable>`
  ${(props) =>
    props.clickable
      ? css`
          border-bottom: 1px dotted black;
        `
      : ""}
`;
