import IconButton from '../shared/button/IconButton';
import {LAYER_NAMES} from '../../constants';

function PredefinedDatasourceViews(props) {


    return (<>
        <IconButton icon="cleaning-spray" label={__('Pesticider')}
                    onClick={() => props.applyLayer("calypso_stationer.pesticidoverblik")}/>
        <IconButton icon="no3-solid" label={__('Nitrat')} onClick={()=>props.applyLayer(LAYER_NAMES[0], "1176")}/>
        {/*<IconButton icon="water-wifi-solid" label={__('Mine stationer')}/>*/}
        {/*<IconButton icon="lab-flask-experiment" label={__('Mine favoritter')}/>*/}
    </>);

}

export default PredefinedDatasourceViews;
