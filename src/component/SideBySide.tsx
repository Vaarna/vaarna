import { PropsWithExactlyTwoChildren } from "util/react";
import { useState } from "react";
import { delay } from "util/timeout";
import styled, { css } from "styled-components";

const Container = styled.div`
  width: 100%;
  height: calc(100% - 64px);
  display: flex;
  flex-direction: row;
`;

type HideRight = { hideRight: boolean };

const Left = styled.main<HideRight>`
  flex-grow: 2;
  overflow-y: scroll;
  padding: 0.5rem;

  & > *:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  width: ${(props) => (props.hideRight ? "100%" : "calc(100% * (2 / 3))")};

  @media only screen and (max-width: 801px) {
    ${(props) =>
      props.hideRight &&
      css`
        width: 100%;
      `}
    ${(props) =>
      !props.hideRight &&
      css`
        display: none;
      `}
  }
`;

const Right = styled.aside<HideRight>`
  width: calc(100% / 3);
  flex-grow: 1;

  ${(props) =>
    props.hideRight &&
    css`
      display: none;
    `}

  @media only screen and (max-width: 801px) {
    ${(props) =>
      !props.hideRight &&
      css`
        display: revert;
        width: 100%;
      `}
  }
`;

const LogItems = styled.div`
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  height: calc(100% - 64px);

  & > *:nth-child(odd) {
    background-color: ${({ theme }) => theme.color.main};
  }
`;

const Send = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.5rem;
  font-size: large;

  height: 64px;
`;

const SendInput = styled.input`
  width: 100%;
`;

const SendButton = styled.button`
  margin-left: 0.5rem;
  padding: 0 0.5rem;
`;

export type SideBySideProps = PropsWithExactlyTwoChildren<{
  showRight: boolean;
  send: (v: string) => Promise<void>;
}>;

export const SideBySide: React.FC<SideBySideProps> = ({
  showRight,
  send,
  children,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const s = () => {
    const trimmed = text.trim();
    if (sending || trimmed.length === 0) return;

    setSending(true);
    send(trimmed)
      .then(delay(2500)) // TODO: remove delay once there is a backend
      .then(() => setText(""))
      .catch((err) => console.error(err))
      .finally(() => setSending(false));
  };

  return (
    <Container>
      <Left hideRight={!showRight}>
        <>{children[0]}</>
      </Left>
      <Right hideRight={!showRight}>
        <LogItems>
          <>{children[1]}</>
        </LogItems>
        <Send>
          <SendInput
            type="text"
            disabled={sending}
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            onKeyPress={(ev) => (ev.key === "Enter" ? s() : void 0)}
          />
          <SendButton onClick={() => s()}>Send</SendButton>
        </Send>
      </Right>
    </Container>
  );
};
