import {sortableContainer} from 'react-sortable-hoc';

const SortableList = sortableContainer((props) => {
    return (<ul className='list-group row'>{props.children}</ul>);
});

export default SortableList;
