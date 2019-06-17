import './designer.less';

import React, {Component, Fragment} from 'react';
import ModelPreview from '../../components/ModelPreview/ModelPreview.jsx';
import ChangeUVandModel from './components/ChangeUVandModel.jsx';
import UVandDesign from './components/UVandDesign.jsx';


// 面数据
let faceConfig = [
    {
        name: 'A',
        id: 1,
        img: '/img/print/p1.jpg',
        width: 300,
        height: 400,
        destinationPoints: {
            a: {
                x: 0,
                y: 0
            },
            b: {
                x: 300,
                y: 0
            },
            c: {
                x: 300,
                y: 400
            },
            d: {
                x: 0,
                y: 400
            }
        }
    },
    {
        name: 'B',
        id: 2,
        img: '/img/print/p2.jpg',
        width: 300,
        height: 400,
        destinationPoints: {
            a: {
                x: 350,
                y: 50
            },
            b: {
                x: 650,
                y: 0
            },
            c: {
                x: 650,
                y: 400
            },
            d: {
                x: 350,
                y: 450
            }
        }
    },
];
class Designer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: 2,
            UV: {
                color: '#ff0000',
                size: 1024
            }
        };
    }
    render(){
        return (
            <div className="designer-box mt20">
                <h1 className="pl20">模型导入与设置预览</h1>
                {this.state.model && this.state.UV 
                    ? <OpratePart {...{
                        faceConfig,
                        UV: this.state.UV
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
    let {faceConfig, UV} = props;
    return (
        <Fragment>
            <ChangeUVandModel />
            <UVandDesign {...{faceConfig, UV}} />
            <ModelPreview />
        </Fragment>
    );
}

export default Designer;