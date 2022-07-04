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
  background-color: ${({ theme }) => theme.color.main};
  padding: ${({ theme }) => theme.margin.text};
  display: flex;
  align-items: center;
`;

export const Value = styled.div`
  min-height: 3rem;
  min-width: 3rem;
  padding: ${({ theme }) => theme.margin.small};
  border: ${({ theme }) => theme.margin.small} inset ${({ theme }) => theme.color.main};

  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const ClickableText = styled.span<Clickable>`
  ${(props) =>
    props.clickable &&
    css`
      border-bottom: 1px dotted black;
    `}
`;
