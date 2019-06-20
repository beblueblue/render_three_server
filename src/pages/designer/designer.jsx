import './designer.less';

import React, {Component, Fragment} from 'react';
import ModelPreview from '../../components/ModelPreview/ModelPreview.jsx';
import UVandDesign from './components/UVandDesign.jsx';

class Designer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: 2,
            UV: {
                color: '#ff00ff',
                size: 1024
            },
            UVmap: null
        };
    }
    render(){
        return (
            <div className="designer-box mt20">
                <h1 className="pl20">模型导入与设置预览</h1>
                {
                    this.state.model && this.state.UV 
                        ? <OpratePart {...{
                            UV: this.state.UV,
                            model: this.state.model
                        }} />
                        : <Fragment>
                            <div className="mt10 ml20"><a className="export-model-btn main-btn-b">模型导入</a></div>
                            <div className="mt10 ml20"><a className="export-model-btn main-btn-b">纹理图导入</a></div>
                        </Fragment>
                }
            </div>
        );
    }
}

function OpratePart(props) {
    let {UV, model, UVmap} = props;
    return (
        <Fragment>
            <div className="change-btn-box ma">
                <a className="main-btn-b">更换模型</a>
                <a className="ml20 main-btn-b">更换纹理图</a>
            </div>
            <UVandDesign {...{UV}} />
            <ModelPreview {...{model, UVmap}}/>
        </Fragment>
    );
}

export default Designer;