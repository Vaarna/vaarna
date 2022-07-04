import styled, { css } from "styled-components";
import { PropsWithExactlyTwoChildren } from "../util/react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid black;
  box-shadow: 4px 4px 4px 0 ${({ theme }) => theme.color.dropShadow};
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.margin.normal};
  border-radius: ${({ theme }) => theme.borderRadiusTop};
  background-color: ${({ theme }) => theme.color.main};
`;

const Body = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.margin.normal};
  gap: ${({ theme }) => theme.margin.normal};

  ${(props) =>
    props.collapsed &&
    css`
      height: 0.5rem;
      overflow: clip;
    `}
`;

export type CollapsibleGroupProps = PropsWithExactlyTwoChildren<{
  collapsed?: boolean;
}>;

export const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  collapsed,
  children,
}) => {
  return (
    <Container>
      <Header>{children[0]}</Header>
      <Body collapsed={collapsed ?? false}>{children[1]}</Body>
    </Container>
  );
};
