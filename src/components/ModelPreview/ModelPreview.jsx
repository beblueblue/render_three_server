import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
const OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

const ModelUrl = '/static/models/cupModel.obj';
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
        this.meshObj = null;
        this.textureMap = null;

        this.init = this.init.bind(this);
        this.renderModel = this.renderModel.bind(this);
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
        this.textureMap = textureLoader.load(UVMap);
        this.renderModel();
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
            antialias: true,
            canvas: this.el,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        // 相机构建
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        this.camera.position.z = 1200;

        // 场景构建
        this.scene = new THREE.Scene();

        // 光源构建
        //光源1为环境光
        ambientLight = new THREE.AmbientLight( 0xeeeeee, 0.8 );
        //光源2为点光源
        pointLight = new THREE.PointLight( 0xffffff, 0.3 );
        this.scene.add(ambientLight);
        this.scene.add(pointLight);

        // UV导入
        textureLoader = new THREE.TextureLoader();
        this.textureMap = textureLoader.load(UVMap);
        
        // 模型导入
        modelLoader = new THREE.OBJLoader();
        modelLoader.load(model, (obj) => {
            loaderNum--;
            // this.meshObj = new THREE.Mesh(obj, new THREE.MeshBasicMaterial);
            this.meshObj = obj.children[0];
            if (loaderNum === 0) {
                this.renderModel();
            }
            this.scene.add(this.meshObj);
        })
    }

    renderModel(){
        console.log('map', this.textureMap)
        if (this.meshObj) {
            this.meshObj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.map = this.textureMap;
                    child.material.side = THREE.DoubleSide;
                }
            })
        }
        this.renderer.render(this.scene, this.camera);
    }

    render(){
        return (
            <canvas className={`${this.props.className || ''}`}></canvas>
        );
    }
}