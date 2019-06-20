import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FabricJS from 'fabric';
import PropTypes from 'prop-types';

import { getConfig, selectImgId } from '@/store/designer/action';
import { connect } from 'react-redux';

let FabricCanvas = new FabricJS.fabric.Canvas();

class Fabric extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        let {UV} = this.props;
        // 获取实例dom
        let el = ReactDOM.findDOMNode(this);

        FabricCanvas.initialize(el, {
            width: UV.size,
            height: UV.size
        });
    }

    render(){
        return (
            <canvas></canvas>
        );
    }
}

class UVandDesign extends Component {
    componentDidMount(){
        let faceConfig = [
            {
                name: 'A',
                id: 1,
                img: '/img/print/p1.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 0,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: false,
                // 绘制起点
                left: 0,
                top: 0
            },
            {
                name: 'B',
                id: 2,
                img: '/img/print/p2.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 0,
                // 水平镜像
                flipX: true,
                // 垂直镜像
                flipY: false,
                // 绘制起点
                left: 310,
                top: 0
            },
            {
                name: 'C',
                id: 3,
                img: '/img/print/p3.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 0,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: true,
                // 绘制起点
                left: 0,
                top: 310
            },
            {
                name: 'D',
                id: 4,
                img: '/img/print/p4.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 60,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: false,
                // 绘制起点
                left: 350,
                top: 350
            },
        ];
        this.props.getConfig(faceConfig);
    }

    /**
     * 渲染最终的UV映射图
     * 核心方法是canvas的drawImage()
     *  */
    // renderUV(){
    //     let {UV, faceConfigList} = this.props;
    //     let controlCanvas = this.state.controlCanvas;

    //     faceConfigList.map((config) => {
    //         const URL = config.img;
            
    //         fabric.Image.fromURL(URL, function(oImg){
    //             controlCanvas.add(oImg);
    //             oImg.rotate(config.angle);
    //         }, {
    //             left: config.left,
    //             top: config.top,
    //             width: config.width,
    //             height: config.height,
    //             flipX: config.flipX,
    //             flipY: config.flipY,
    //         });
    //     });

    // }

    render(){
        let {UV, changeUV, selectImgId} = this.props;

        return (
            <div className="UV-mix-wrap display-flex mt10">
                <div className="face-config-bar">
                    <p>请选择需要操作的面</p>
                    {
                        changeUV.faceConfigList.map((face) => {
                            return (
                                <div 
                                    className={(face.id === changeUV.selectedImgId ? "selected" : "") + " face-id-box"} 
                                    onClick = {
                                        () => selectImgId(face.id)
                                    }
                                    key={face.id}
                                >
                                    <a>设计面：{face.name}</a>
                                    <img 
                                        className="design-img-box" 
                                        src={face.img} 
                                        alt={'设计面：' + face.name}
                                    />
                                </div>
                            );
                        })
                    }
                </div>
                <div className="show-UV-bar">
                    <div className="relative set-UV-box">
                        <Fabric {...{UV, changeUV}}/>
                    </div>
                </div>
                <div className="oprate-bar">
                    操作栏
                </div>
            </div>
        );
    }
}
UVandDesign.propTypes = {
    changeUV: PropTypes.object.isRequired,
}

export default connect(
    state => ({
        changeUV: state.changeUV
    }),
    {
        getConfig,
        selectImgId
    }
)(UVandDesign);
