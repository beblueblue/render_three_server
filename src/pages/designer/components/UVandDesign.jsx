import React, {Component, useEffect} from 'react';
import PropTypes from 'prop-types';
import { CubeTexture } from 'three';

export default class UVandDesign extends Component {
    constructor(props) {
        super(props);
        // 利用createRef获取canvas
        this.UV_design_render = React.createRef();
        this.draw_design_img = React.createRef();
        // 获取img对象
        this.imgs = [];

        this.needLoadImgNum = 0;
        this.loadedImgNum = 0;
        this.handelImgLoad = this.handelImgLoad.bind(this);
        this.renderUV = this.renderUV.bind(this);
        this.maskRendUv = this.maskRendUv.bind(this);

        this.didRender = false;
        this.loadAllImgs = false;
    }

    componentDidMount() {
        this.didRender = true;
        this.maskRendUv();
    }

    componentDidUpdate() {
        this.renderUV();
    }

    handelImgLoad(){
        this.loadedImgNum++ ;
        if(this.loadedImgNum === this.needLoadImgNum) {
            this.loadAllImgs = true;
            this.maskRendUv();
        }
    }

    maskRendUv(){
        if(this.didRender && this.loadAllImgs) {
            this.renderUV();
        }
    }

    renderUV(){
        // 输出纹理图的画布
        let renderCanvas = this.UV_design_render.current;
        let width = renderCanvas.width;
        let height = renderCanvas.height;
        let renderContext = renderCanvas.getContext('2d');
        // 处理单个图片的画布
        let imgDataCanvas = this.draw_design_img.current;
        let imgDataContext = imgDataCanvas.getContext('2d');
        let imgCanvasWidth = imgDataCanvas.width;
        let imgCanvasHeight = imgDataCanvas.height;

        let {faceConfig, UV} = this.props;
        const baseColor = UV.color;


        
        renderContext.clearRect(0, 0, width, height);
        renderContext.fillStyle = baseColor;
        renderContext.fillRect(0, 0, width, height);
        this.imgs.map((imgObj, index) => {
            let config = faceConfig[index];
            let imgWidth = imgObj.img.naturalWidth;
            let imgHeight = imgObj.img.naturalHeight;
            // Pattern填充方案失败！
            // let pattern = renderContext.createPattern(imgObj.img, 'no-repeat');
            // let region = new Path2D();

            // region.moveTo(faceConfig[index].destinationPoints.a.x, faceConfig[index].destinationPoints.a.y);
            // region.lineTo(faceConfig[index].destinationPoints.b.x, faceConfig[index].destinationPoints.b.y);
            // region.lineTo(faceConfig[index].destinationPoints.c.x, faceConfig[index].destinationPoints.c.y);
            // region.lineTo(faceConfig[index].destinationPoints.d.x, faceConfig[index].destinationPoints.d.y);
            // region.closePath();

            // renderContext.fillStyle = pattern;
            // renderContext.fill(region);

            // 额外canvas处理单个元素方案, bingo!
            imgDataContext.clearRect(0, 0, width, height);
            imgDataContext.save();
            imgDataContext.translate(imgCanvasWidth/2, imgCanvasHeight/2);
            imgDataContext.rotate(Math.PI / 4);
            imgDataContext.scale(0.5, 0.5);
            imgDataContext.translate(-imgCanvasWidth/2, -imgCanvasHeight/2);

            imgDataContext.drawImage(
                imgObj.img, 
                (imgCanvasWidth - imgWidth)/2, 
                (imgCanvasHeight - imgHeight)/2,
                imgWidth, 
                imgHeight,
            );
            // imgDataContext.transform(1, 0, 0, 1, 0, 0);
            console.log(imgObj.img, imgHeight)
            imgDataContext.setTransform(1, 0, 0, 1, 0, 0);
            renderContext.drawImage(
                imgDataCanvas, 
                config.destinationPoints.a.x, 
                config.destinationPoints.a.y, 
                config.width, 
                config.height
            );
            imgDataContext.restore();
        });
    }

    render(){
        let {faceConfig, UV} = this.props;

        return (
            <div className="UV-mix-wrap display-flex mt10">
                <div className="face-config-bar">
                    {
                        faceConfig.map((face) => {
                            this.needLoadImgNum++ ;
                            return (
                                <div className="mt10" key={face.id}>
                                    <a>设计面：{face.name}</a>
                                    <img 
                                        ref={(img) => {this.imgs.push({id: face.id, img})}} 
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
                        <canvas ref={this.draw_design_img} width={UV.size} height={UV.size} style={{width: '100%', height: '100%'}}></canvas>
                        <canvas ref={this.UV_design_render} width={UV.size} height={UV.size} style={{width: '100%', height: '100%'}}></canvas>
                        
                        <canvas style={{width: '100%', height: '100%'}}></canvas>
                    </div>
                </div>
                <div className="oprate-bar">
                    操作栏
                </div>
            </div>
        );
    }
}
