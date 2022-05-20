import React, { useMemo } from "react";
import { useAppDispatch } from "state/hook";
import { setItemParameters } from "state/slice";
import styled from "styled-components";
import { GroupDisplay } from "type/space";
import { groupItems, SheetGroupedItems, SheetState } from "util/evalItems";
import { Display, Edit } from "./modes";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const GroupHeader = styled.div`
  font-size: larger;
  border-bottom: 1px solid black;
  margin-bottom: 1rem;
`;

type Reverse = { display: GroupDisplay };

const ItemsContainer = styled.div<Reverse>`
  display: flex;
  gap: 1rem;
  flex-direction: ${(props) => (props.display === "rows" ? "column" : "row")};
`;

type ItemsProps = {
  display: SheetGroupedItems["display"];
  state: SheetGroupedItems["items"];
  edit: boolean;
};

const Items: React.FC<ItemsProps> = ({ display, state, edit }) => {
  const dispatch = useAppDispatch();
  const displayWithDefault = display ?? "rows";

  return (
    <ItemsContainer display={displayWithDefault}>
      {state.map((item) =>
        edit ? (
          <Edit key={item.itemId} state={item}>
            <>{item.valueEvaluated}</>
            <>
              <input
                value={item.value}
                onChange={(ev) =>
                  dispatch(
                    setItemParameters({ itemId: item.itemId, value: ev.target.value })
                  )
                }
              />
            </>
          </Edit>
        ) : (
          <Display key={item.itemId} state={item}>
            {item.valueEvaluated}
          </Display>
        )
      )}
    </ItemsContainer>
  );
};

type GroupProps = {
  state: SheetGroupedItems;
  edit: boolean;
};

const Group: React.FC<GroupProps> = ({ state, edit }) => {
  return (
    <div>
      <GroupHeader>{state.name ?? ""}</GroupHeader>
      <Items display={state.display} state={state.items} edit={edit} />
    </div>
  );
};

export type SheetDisplayProps = {
  state: SheetState;
  edit: boolean;
};

export const SheetDisplay: React.FC<SheetDisplayProps> = ({ state, edit }) => {
  const groups = useMemo(() => groupItems(state), [state]);

  return (
    <Container>
      {groups.map((group) =>
        group.groupId === "" ? (
          <Items display={group.display} state={group.items} edit={edit} />
        ) : (
          <Group state={group} edit={edit} />
        )
      )}
    </Container>
  );
};
