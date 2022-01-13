import { sortableContainer } from "react-sortable-hoc";

const SortableList = sortableContainer((props) => {
  return <ul className="list-group">{props.children}</ul>;
});

export default SortableList;
