import React from "react";
import { Item } from "@gm-screen/all/dist/type/space";
import { PropsWithExactlyTwoChildren } from "../../util";
import { ClickableText, Container, Name, Value } from "./common";

export type DisplayProps = React.PropsWithChildren<{
  state: Item;
}>;

export const Display: React.FC<DisplayProps> = ({
  state: { itemId, name, onclickEnabled },
  children,
}) => {
  // TODO: implement click
  // const dispatch = useAppDispatch();

  return (
    <Container
      clickable={onclickEnabled}
      onClick={
        onclickEnabled
          ? () => console.log("CLICK", { itemId })
          : () => {
              return;
            }
      }
    >
      <Name>
        <ClickableText clickable={onclickEnabled}>{name}</ClickableText>
      </Name>
      <Value>{children}</Value>
    </Container>
  );
};

export type EditProps = PropsWithExactlyTwoChildren<{
  state: Pick<Item, "name" | "readOnly">;
}>;

export const Edit: React.FC<EditProps> = ({ state: { name, readOnly }, children }) => (
  <Container clickable={false}>
    <Name>
      <ClickableText clickable={false}>{name}</ClickableText>
    </Name>
    <Value>{readOnly ? children[0] : children[1]}</Value>
  </Container>
);
