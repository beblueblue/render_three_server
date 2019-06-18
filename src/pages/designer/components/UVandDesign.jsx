import React, {Component, useEffect} from 'react';
import {Vector2, Matrix3} from 'three';
import PropTypes from 'prop-types';

export default class UVandDesign extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedImgId: 1,

        };

        // 利用createRef获取canvas
        this.UV_design_render = React.createRef();
        this.UV_design_helper = React.createRef();
        // 获取img对象
        this.imgs = {};
        this.needLoadImgNum = 0;
        this.loadedImgNum = 0;
        this.didRender = false;
        this.loadAllImgs = false;

        this.handelImgLoad = this.handelImgLoad.bind(this);
        this.renderUV = this.renderUV.bind(this);
        this.maskRendUv = this.maskRendUv.bind(this);
        
    }

    componentDidMount() {
        console.log('mount')
        this.didRender = true;
        this.maskRendUv();
    }
    
    componentWillUnmount() {
        console.log('unmount')
    }

    componentDidUpdate() {
        console.log('update')
        this.renderUV();
    }

    handelImgLoad(){
        console.log('load')
        this.loadedImgNum++ ;
        if(this.loadedImgNum === this.needLoadImgNum) {
            this.loadAllImgs = true;
            this.maskRendUv();
        }
    }
    // 图片onload且DOM渲染后，进行canvas绘制
    maskRendUv(){
        if(this.didRender && this.loadAllImgs) {
            this.renderUV();
        }
    }
    /**
     * 渲染最终的UV映射图
     * 核心方法是canvas的drawImage()
     *  */
    renderUV(){
        // 输出纹理图的画布
        let renderCanvas = this.UV_design_render.current;
        let renderContext = renderCanvas.getContext('2d');
        const width = renderCanvas.width;
        const height = renderCanvas.height;
        // 输出辅助线的画布
        let helperCanvas = this.UV_design_helper.current;
        let helperCanvasContex = helperCanvas.getContext('2d');
        const helperWidth = helperCanvas.width;
        const helperHeight = helperCanvas.height;

        let {faceConfig, UV} = this.props;
        const baseColor = UV.color;
        
        renderContext.clearRect(0, 0, width, height);
        renderContext.fillStyle = baseColor;
        renderContext.fillRect(0, 0, width, height);
        faceConfig.map((config) => {
            const centerPoint = [];
            const img = this.imgs[config.id];
            centerPoint[0] = config.startPoint[0] + config.width /2;
            centerPoint[1] = config.startPoint[1] + config.height /2;
            
            renderContext.save();
            // 直接计算矩阵
            // renderContext.translate(centerPoint[0], centerPoint[1]);
            // renderContext.rotate(config.rotate);
            // renderContext.translate(-centerPoint[0], -centerPoint[1]);
            renderContext.transform(...config.matrix);
            renderContext.drawImage(
                img, 
                config.startPoint[0], config.startPoint[1], 
                config.width, config.height
            );
            renderContext.restore();

            // 绘制辅助线
            if(this.state.selectedImgId === config.id){
                helperCanvasContex.clearRect(0, 0, helperWidth, helperHeight);
                renderContext.save();
                renderContext.restore();
            }
        });
    }

    render(){
        let {faceConfig, UV} = this.props;

        return (
            <div className="UV-mix-wrap display-flex mt10">
                <div className="face-config-bar">
                    <p>请选择需要操作的面</p>
                    {
                        faceConfig.map((face) => {
                            this.needLoadImgNum++ ;
                            return (
                                <div 
                                    className={(face.id === this.state.selectedImgId ? "selected" : "") + " face-id-box"} 
                                    onClick = {
                                        () => {
                                            this.setState({selectedImgId: face.id})
                                        }
                                    } 
                                    key={face.id}
                                >
                                    <a>设计面：{face.name}</a>
                                    <img 
                                        ref={(img) => {this.imgs[face.id] = img}} 
                                        className="design-img-box" 
                                        src={face.img} 
                                        onLoad={this.handelImgLoad} 
                                        alt={'设计面：' + face.name}
                                    />
                                </div>
                            );
                        })
                    }
                </div>
                <div className="show-UV-bar">
                    <div className="relative set-UV-box">
                        <canvas ref={this.draw_design_img} width={600} height={600} style={{width: '100%', height: '100%'}}></canvas>
                        <canvas ref={this.UV_design_render} width={UV.size} height={UV.size} style={{width: '100%', height: '100%'}}></canvas>
                        <canvas ref={this.UV_design_helper} width={UV.size} height={UV.size} style={{width: '100%', height: '100%'}}></canvas>
                    </div>
                </div>
                <div className="oprate-bar">
                    操作栏
                </div>
            </div>
        );
    }
}
