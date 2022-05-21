import Link from "next/link";
import React from "react";
import styled from "styled-components";

const Container = styled.nav`
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: baseline;
  padding: 0.5rem;
  border-bottom: 1px solid black;
`;

const Title = styled.div`
  font-size: xx-large;
  font-weight: 700;

  &:not(:last-child) {
    padding-right: 1rem;
  }
`;

const Children = styled.div`
  &:not(:last-child) {
    padding-right: 1rem;
  }
`;

export type HeaderProps = React.PropsWithChildren<unknown>;

export const Header: React.FC<HeaderProps> = ({ children }: HeaderProps) => {
  return (
    <Container>
      <Title>
        <Link href="/">
          <a>GM Screen</a>
        </Link>
      </Title>

      <Children>{children}</Children>
    </Container>
  );
};
