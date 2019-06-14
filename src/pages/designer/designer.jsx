import React, {Component, Fragment} from 'react';
import ModelPreview from '../../components/ModelPreview/ModelPreview.jsx';

import './designer.less';

class Designer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: 2,
            UV: 2
        };
    }
    render(){
        return (
            <div className="ma designer-box">
                {this.state.model && this.state.UV 
                    ? <OpratePart />
                    : <ExportPart /> 
                }
            </div>
        );
    }
}

class ExportPart extends Component {
    render(){
        return (
            <Fragment>
                <h1>模型导入与UV图导入</h1>
                <div className="mt10"><a className="export-model-btn main-btn-b">模型导入</a></div>
                <div className="mt10"><a className="export-model-btn main-btn-b">纹理图导入</a></div>
            </Fragment>    
        );
    }
}

class OpratePart extends Component {
    render() {
        return (
            <Fragment>
                <ChangeUVandModel />
                <UVandDesign />
                <ModelPreview />
            </Fragment>
        );
    }
}

class ChangeUVandModel extends Component {
    render(){
        return (
            <div className="change-btn-box">
                <a className="export-model-btn main-btn-b">更换模型</a>
                <a className="ml20 export-model-btn main-btn-b">更换纹理图</a>
            </div>
        );
    }
}

class UVandDesign extends Component {
    render(){
        return (
            <div className="UV-mix-wrap flex">
                <div className="face-config-bar"></div>
                <div className="show-UV-bar"></div>
                <div className="oprate-bar"></div>
            </div>
        );
    }
}

export default Designer;