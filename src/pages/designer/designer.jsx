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
        height: 300,
        // 绘制起点
        startPoint: [0, 0],
        // 最终变换矩阵(a, b, c, d, e, f)
        matrix: [
            1, 0, 
            0, 1,
            0, 0
        ]
    },
    {
        name: 'B',
        id: 2,
        img: '/img/print/p2.jpg',
        width: 300,
        height: 300,
        rotate: Math.PI / 4,
        startPoint: [350, 50],
        matrix: [
            1, 0, 
            0, 1,
            0, 0
        ]
    },
    {
        name: 'C',
        id: 3,
        img: '/img/print/p3.jpg',
        width: 300,
        height: 300,
        rotate: Math.PI/2,
        startPoint: [650, 0],
        matrix: [
            1, 0, 
            0, 1,
            0, 0
        ]
    },
    {
        name: 'D',
        id: 4,
        img: '/img/print/p4.jpg',
        width: 300,
        height: 300,
        rotate: 0,
        startPoint: [350, 400],
        matrix: [
            1, 0, 
            0, 1,
            0, 0
        ]
    },
];
class Designer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: 2,
            UV: {
                color: '#ff00ff',
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