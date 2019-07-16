import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { fabric } from 'fabric';
import PropTypes from 'prop-types';

import * as actions from '@/store/designer/action';
import { connect } from 'react-redux';

import ModelPreview from '@/components/ModelPreview/ModelPreview.jsx';

class Fabric extends Component {
    constructor(props) {
        super(props);

        // 设计面图片
        this.imgsArr = [];
        this.imgsMap = new Map();
        // UV背景图
        this.UVBackgroud = null;

        this.imgLoadedNum = 0;
        this.imgNeedNum = 0;
        this.fabricCanvas = new fabric.Canvas();

        this.updateCanvaToUV = this.updateCanvaToUV.bind(this);
        this.renderImgs = this.renderImgs.bind(this);

        this.REDUXFIRE = 'REDUX, FIRE';
        window.fabricCanvas = this.fabricCanvas;
    }

    componentDidMount(){
        let { UV, actions } = this.props;

        // 获取实例dom
        let el = ReactDOM.findDOMNode(this);

        this.fabricCanvas.initialize(el, {
            width: UV.size,
            height: UV.size,
        });
        this.fabricCanvas.clear();
        this.fabricCanvas.setBackgroundColor('#fff');
        // 导入UV背景
        this.imgNeedNum++;
        fabric.Image.fromURL(UV.backgroundImg, (oImg) => {
            // hack, 避免图片重复下载
            if (this.UVBackgroud) {
                return false;
            }
            // 背景图不可选中
            oImg.set({
                selectable: false,
                hoverCursor: 'default',
            });
            // 图片缩放到指定高宽
            oImg.scaleToWidth(UV.size);
            oImg.scaleToHeight(UV.size);
            
            // 构建图像映射
            this.UVBackgroud = oImg;
            this.imgLoadedNum++;
            this.renderImgs();
        });

        // 当选择画布中的对象时，该对象不出现在顶层
        this.fabricCanvas.preserveObjectStacking = true;
        this.fabricCanvas.on('selection:updated', (opt) => {
            if(opt.e.type !== this.REDUXFIRE){
                let activeObj = this.fabricCanvas.getActiveObject();

                actions.selectImgId(this.imgsMap.get(activeObj));
            }
        });
        this.fabricCanvas.on('selection:created', (opt) => {
            if(opt.e.type !== this.REDUXFIRE){
                let activeObj = this.fabricCanvas.getActiveObject();

                actions.selectImgId(this.imgsMap.get(activeObj));
            }
        });
        this.fabricCanvas.on('selection:cleared', (opt) => {
            actions.selectImgId(null);
        });
        this.fabricCanvas.on('mouse:up', () => {
            this.updateCanvaToUV();
        });
    }

    componentDidUpdate(){
        let { faceConfigList, selectedImgId } = this.props;

        // 导入图片对象
        faceConfigList.forEach((config, index) => {
            const URL = config.img;
            let imgObj = this.imgsArr[index];

            if(imgObj){
                if (config.id === selectedImgId) { 
                    // setActiveObject，无法绘制辅助线
                    this.fabricCanvas.setActiveObject(imgObj.oImg, { type: this.REDUXFIRE  });
                    // this.fabricCanvas.renderAll();
                }
            } else {
                this.imgNeedNum++;
                fabric.Image.fromURL(URL, (oImg) => {
                    // hack, 避免图片重复下载
                    if (this.imgsArr[config.id]) {
                        return false;
                    }
                    if (config.matrix) {
                        oImg.set({
                            transformMatrix: config.matrix
                        });
                    } else {
                        // 先旋转变化, 后拉伸变化
                        // 中心旋转
                        oImg.rotate(config.angle);
                        // 配置读取
                        config.scaleX = config.scaleX || config.width / oImg.width;
                        config.scaleY = config.scaleY || config.height / oImg.height;
                        oImg.setOptions({
                            left: config.left,
                            top: config.top,
                            flipX: config.flipX,
                            flipY: config.flipY,
                            scaleX: config.scaleX,
                            scaleY: config.scaleY,
                            // 选中样式
                            borderColor: 'green',
                            borderDashArray: [5,5],
                            cornerColor: '#428bca',
                            transparentCorners: false,
                            padding: '10',
                            // 以中心点作为缩放中心，可直接拖拽翻转
                            // centeredScaling: true,
                        });
                    }
                    
                    // 构建图像映射
                    this.imgsArr[index] = { oImg: oImg, id: config.id };
                    this.imgsMap.set(oImg, config.id);
                    this.imgLoadedNum++;
                    this.renderImgs();
                });
            }
        });
        this.updateCanvaToUV();
    }

    renderImgs(){
        let { selectedImgId } = this.props;
        // 同步加入图片
        if (this.imgLoadedNum === this.imgNeedNum) {
            this.imgLoadedNum = 0;
            this.imgNeedNum = 0;
            this.fabricCanvas.add(this.UVBackgroud);
            this.imgsArr.forEach((imgObj) => {
                this.fabricCanvas.add(imgObj.oImg);
                if (imgObj.id === selectedImgId) {
                    this.fabricCanvas.setActiveObject(imgObj.oImg, { type: this.REDUXFIRE });
                }
            })
            this.updateCanvaToUV();
        }
    }

    updateCanvaToUV(){
        let { showUVBackground, actions } = this.props;
        let texture;
        
        if (this.UVBackgroud) {
            this.UVBackgroud.set({visible: false});
            texture = this.fabricCanvas.toDataURL({ format: 'png' });
            actions.updateUV(texture);
            this.UVBackgroud.set({visible: showUVBackground});
            this.fabricCanvas.renderAll();
        }
    }

    render(){
        return (
            <canvas></canvas>
        );
    }
}

class UVandDesign extends Component {
    constructor(props){
        super(props);
    }

    componentWillMount(){
        // 其中缩放参数，默认为 config.width / img.width
        let faceConfig = [
            {
                name: 'A',
                id: 1,
                img: '/static/imgs/strawberryMilk.png',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 0,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: false,
                // 绘制起点
                left: 90,
                top: 76,
            },
            {
                name: 'B',
                id: 2,
                img: '/static/imgs/water.jpg',
                width: 800,
                height: 300,
                // 旋转角度
                angle: 0,
                // 水平镜像
                flipX: true,
                // 垂直镜像
                flipY: false,
                // 绘制起点
                left: 293,
                top: 60,
            },
            {
                name: 'C',
                id: 3,
                img: '/static/imgs/birdGrenade.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 60,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: true,
                /// 绘制起点
                left: 740,
                top: 767,
                // 水平缩放
                scaleX: 0.13,
                // 垂直缩放
                scaleY: 0.13,
                // matrix: [
                //     0.067,
                //     0.114,
                //     0.114,
                //     -0.066,
                //     727.829,
                //     871.494
                // ]
            },
            {
                name: 'D',
                id: 4,
                img: '/img/print/p4.jpg',
                width: 300,
                height: 300,
                // 旋转角度
                angle: 44,
                // 水平镜像
                flipX: false,
                // 垂直镜像
                flipY: true,
                // 绘制起点
                left: 643,
                top: 96,
                // 水平缩放
                scaleX: 0.13,
                // 垂直缩放
                scaleY: 0.13,
            }
        ];
        this.props.getConfig(faceConfig.slice(0,4));
    }

    consoleFabric(){
        console.log(window.fabricCanvas)
        console.log(window.fabricCanvas.getActiveObject())
    }

    render(){
        let { UV, model, changeUV, selectImgId, updateUV, toggleUVBackground } = this.props;
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
                                        <a>生产面：{face.name}</a>
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
                            <Fabric { 
                                        ...{ 
                                            UV, 
                                            actions: {
                                                updateUV,
                                                selectImgId,
                                            },
                                            faceConfigList: changeUV.faceConfigList, 
                                            selectedImgId: changeUV.selectedImgId,
                                            showUVBackground: changeUV.showUVBackground,
                                        }
                                    }
                            />
                        </div>
                    </div>
                    <div className="oprate-bar pl10">
                        <div className="tc">操作栏</div>
                        <div className="mt10">
                            <a className="main-btn-b" onClick={() => this.consoleFabric()}>打印参数</a>
                        </div>
                        <div className="mt10 mb20">
                            <a className="main-btn-b" onClick={() => toggleUVBackground(!changeUV.showUVBackground)}>{changeUV.showUVBackground ? '隐藏' : '显示'}UV映射关系图</a>
                        </div>
                        <ModelPreview {
                                ...{ 
                                    model, 
                                    UVMap: changeUV.UVMap,
                                    width: 400,
                                    height: 400 
                                }
                              }
                        />
                    </div>
                </div>
            </Fragment>
        );
    }
}
UVandDesign.propTypes = {
    changeUV: PropTypes.shape({
        faceConfigList: PropTypes.array.isRequired,
        selectedImgId: PropTypes.number,
        UVMap: PropTypes.string,
    }).isRequired,
    getConfig: PropTypes.func.isRequired,
    selectImgId: PropTypes.func.isRequired,
    updateUV: PropTypes.func.isRequired, 
    toggleUVBackground: PropTypes.func.isRequired
}

export default connect(
    state => ({
        changeUV: state.changeUV
    }),
    actions,
)(UVandDesign);
