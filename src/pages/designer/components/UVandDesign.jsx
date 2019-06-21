import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { fabric } from 'fabric';
import PropTypes from 'prop-types';

import { getConfig, selectImgId, updateUV } from '@/store/designer/action';
import { connect } from 'react-redux';

import ModelPreview from '@/components/ModelPreview/ModelPreview.jsx';

class Fabric extends Component {
    constructor(props) {
        super(props);

        this.imgs = {};
        this.imgsMap = new Map();
        this.fabricCanvas = new fabric.Canvas();

        this.updateCanvaToUV = this.updateCanvaToUV.bind(this);
    }

    componentDidMount(){
        let { UV, selectImgId } = this.props;

        // 获取实例dom
        let el = ReactDOM.findDOMNode(this);

        this.fabricCanvas.initialize(el, {
            width: UV.size,
            height: UV.size
        });
        this.fabricCanvas.clear();

        // 当选择画布中的对象时，该对象不出现在顶层
        this.fabricCanvas.preserveObjectStacking = true;
        this.fabricCanvas.on('selection:updated', () => {
            let activeObj = this.fabricCanvas.getActiveObject();

            selectImgId(this.imgsMap.get(activeObj));
        });
        this.fabricCanvas.on('selection:created', () => {
            let activeObj = this.fabricCanvas.getActiveObject();

            selectImgId(this.imgsMap.get(activeObj));
        });
        this.fabricCanvas.on('selection:cleared', () => {
            selectImgId(null);
        });
        this.fabricCanvas.on('mouse:up', () => {
            this.updateCanvaToUV();
        })
    }

    componentDidUpdate(){
        let { faceConfigList, selectedImgId } = this.props;
        let self = this;

        // 导入图片对象
        faceConfigList.map((config) => {
            const URL = config.img;
            let imgObj = self.imgs[config.id];

            if(imgObj){
                if (config.id === selectedImgId) { 
                    // setActiveObject，无法绘制辅助线
                    self.fabricCanvas.setActiveObject(imgObj);
                }
            } else {
                fabric.Image.fromURL(URL, (oImg) => {
                    if (self.imgs[config.id]) {
                        return false;
                    }
                    // 图片缩放到指定高宽
                    oImg.scaleToWidth(config.width);
                    oImg.scaleToHeight(config.height);
                    // 配置读取
                    oImg.set({
                        left: config.left,
                        top: config.top,
                        flipX: config.flipX,
                        flipY: config.flipY,
                    });
                    // 中心旋转
                    oImg.rotate(config.angle);
                    
                    // 构建图像映射
                    self.imgs[config.id] = oImg;
                    self.imgsMap.set(oImg, config.id);

                    self.fabricCanvas.add(oImg);
                    if (config.id === selectedImgId) {
                        self.fabricCanvas.setActiveObject(oImg);
                    }
                });
            }
        });
        this.updateCanvaToUV();
    }

    updateCanvaToUV(){
        let { updateUV } = this.props;
        let texture = this.fabricCanvas.toDataURL({ format: 'png' });
        updateUV(texture);
    }

    render(){
        return (
            <canvas></canvas>
        );
    }
}

class UVandDesign extends Component {
    componentWillMount(){
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
                top: 0,
                // 水平缩放
                scaleX: 0.5,
                // 垂直缩放
                scaleY: 1,
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
                left: 300,
                top: 0
            },
            {
                name: 'C',
                id: 3,
                img: '/img/print/p3.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 60,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: true,
                // 绘制起点
                left: 600,
                top: 0
            },
            {
                name: 'D',
                id: 4,
                img: '/img/print/p4.jpg',
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
                top: 300
            }
        ];
        this.props.getConfig(faceConfig);
    }

    render(){
        let { UV, changeUV, selectImgId, model, updateUV } = this.props;

        return (
            <Fragment>
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
                            <Fabric { ...{ UV, 
                                            faceConfigList: changeUV.faceConfigList, 
                                            selectedImgId: changeUV.selectedImgId,
                                            selectImgId,
                                            updateUV,
                                        }
                                    }
                            />
                        </div>
                    </div>
                    <div className="oprate-bar">
                        操作栏
                    </div>
                </div>
                <ModelPreview {...{ model, UVmap: changeUV.UVmap }}/>
            </Fragment>
        );
    }
}
UVandDesign.propTypes = {
    changeUV: PropTypes.shape({
        faceConfigList: PropTypes.array.isRequired,
        selectedImgId: PropTypes.number
    }),
    getConfig: PropTypes.func.isRequired,
    selectImgId: PropTypes.func.isRequired,
    updateUV: PropTypes.func.isRequired, 
}

export default connect(
    state => ({
        changeUV: state.changeUV
    }),
    {
        getConfig,
        selectImgId,
        updateUV
    }
)(UVandDesign);
