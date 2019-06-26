import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
const THREE = require('three');
const OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
const OrbitControls = require('three-orbit-controls')(THREE);

const ModelUrl = '/static/models/cupModel.obj';
const UVBaseUrl = '/static/imgs/bg_white.jpg';

import './ModelPreview.less';
/**
 * 3D模型展示组件
 */
export default class ModelPreview extends Component {
    constructor(props) {
        super(props);

        this.el = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.meshObj = null;
        this.textureMap = null;

        this.animateID = null;

        this.init = this.init.bind(this);
        this.renderModel = this.renderModel.bind(this);
        this.animateRender = this.animateRender.bind(this);
    }

    componentDidMount() {
        // 获取实例dom
        this.el = ReactDOM.findDOMNode(this);
        
        // 初始化3D模型
        this.init();
    }

    componentDidUpdate() {
        let { UVMap } = this.props;

        // 更新纹理
        let textureLoader = new THREE.TextureLoader();
        UVMap = UVMap || UVBaseUrl;
        this.textureMap = textureLoader.load(UVMap);
        this.renderModel();
    }

    componentWillUnmount() {
        this.controls.dispose();
    }

    init(){
        let { UVMap, model } = this.props;
        let { width, height } = this.el;
        let loaderNum = 0;
        let ambientLight;
        let pointLight;
        let textureLoader;
        let modelLoader;

        // model = model || ModelUrl;
        model = ModelUrl;
        
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({
            autoClear: false,
            autoClearColor: '#fff',
            antialias: true,
            canvas: this.el,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        
        // 场景构建
        this.scene = new THREE.Scene();

        // 相机构建
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        this.camera.position.x = 32;
        this.camera.position.y = 23;
        this.camera.position.z = -4;
        this.scene.add(this.camera);

        // 控制组件
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.autoRotate = true;
        // this.controls.autoRotateSpeed = 1;

        // 光源构建
        //光源1为环境光
        ambientLight = new THREE.AmbientLight( 0xeeeeee, 0.8 );
        //光源2为点光源
        pointLight = new THREE.PointLight( 0xffffff, 0.3 );
        pointLight.position.set( 0, 200, -100);

        this.scene.add(ambientLight);
        this.scene.add(pointLight);

        // UV导入
        textureLoader = new THREE.TextureLoader();
        UVMap = UVMap || UVBaseUrl;
        this.textureMap = textureLoader.load(UVMap);
        
        // 模型导入
        modelLoader = new THREE.OBJLoader();
        loaderNum++;
        modelLoader.load(model, (object) => {
            loaderNum--;
            // this.meshObj = new THREE.Mesh(obj, new THREE.MeshBasicMaterial);
            this.meshObj = object;
            this.scene.add(this.meshObj);
            if (loaderNum === 0) {
                this.renderModel();
            }
        })
    }

    renderModel(){
        if (this.meshObj) {
            this.meshObj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.map = this.textureMap;
                    child.material.side = THREE.DoubleSide;
                }
            })
            this.meshObj.position.y = -5;
            this.animateRender();
        }
    }

    // 持续更新renderer，赋能OrbitControls组件
    animateRender(){
        if(this.animateID) {
            cancelAnimationFrame(this.animateID);
        }
        this.animateID = requestAnimationFrame(this.animateRender);
        this.renderer.render(this.scene, this.camera);
        // 动画需要更新组件状态
        this.controls.update();
    }

    render(){
        return (
            <Fragment>
                <canvas className={`preview-canvas ${this.props.className || ''}`} 
                    width={this.props.width} 
                    height={this.props.height} 
                ></canvas>
            </Fragment>
        );
    }
}