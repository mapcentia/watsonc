import styled from "styled-components";
import Title from "../shared/title/Title";
import { sortableHandle } from "react-sortable-hoc";

const SortHandleComponent = (props) => {
  return (
    <HeaderActionItem>
      <IconContainer>
        <Icon name="drag-handle" size={16} />
      </IconContainer>
      <Title marginLeft={8} level={6} text={__("Flyt")} />
    </HeaderActionItem>
  );
};

const HeaderActionItem = styled.div`
  margin-right: ${(props) => props.theme.layout.gutter / 2}px;
  vertical-align: middle;
  cursor: all-scroll;
`;

const IconContainer = styled.div`
  height: ${(props) => (props.theme.layout.gutter * 3) / 4}px;
  width: ${(props) => (props.theme.layout.gutter * 3) / 4}px;
  background: ${(props) => props.theme.colors.gray[4]};
  display: inline-block;
  border-radius: 50%;
  padding: ${(props) => props.theme.layout.gutter / 8}px;
  vertical-align: middle;
`;

export default sortableHandle(SortHandleComponent);
