import IconButton from '../shared/button/IconButton';

function PredefinedDatasourceViews(props) {

    return (<>
            <IconButton icon="cleaning-spray" label={__('Pesticider')} />
            <IconButton icon="no3-solid" label={__('Nitrat')} />
            <IconButton icon="water-wifi-solid" label={__('Mine stationer')} />
            <IconButton icon="lab-flask-experiment" label={__('Mine favoritter')} />
        </>);

}

export default PredefinedDatasourceViews;
