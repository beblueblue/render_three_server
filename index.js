const startTime = Number(new Date());
const WIDTH = 1024;
const HEIGHT = 1024;

const { JSDOM } = require("jsdom");
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    resources: 'usable'
});
const window = dom.window;
const document = window.document;
const canvas = document.createElement('canvas');

const fs = require('fs');
const path = require('path');
const THREE = require('three');
const JSONLoader = require('./src/common/loaders/JSONLoader');
const PNG = require('pngjs').PNG;
const gl = require('gl')(WIDTH, HEIGHT, {
    preserveDrawingBuffer: true,
    antialias: true
});


const outPath = './src/common/img/output/out.png';
const backgroundImg = './src/common/img/background-demo.png';
const modelPath = './src/static/models/textureObj2.js';
const png = new PNG({ width: WIDTH, height: HEIGHT });

global.document = document;
global.window = window;

// 渲染器变量
// 观察距离（待研究）
const viewPositionY = -1300;
const viewPositionX = 0;
const viewPositionZ = 0;
// renderer构建
let renderer;
function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        preserveDrawingBuffer: true,
        context: gl
    });
}
// 相机构建
let camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
    // camera.position.x = 500;
    // camera.position.y = 500;
    camera.position.z = 1200;
}
// 场景构建
let scene;
function initScene() {
    scene = new THREE.Scene();
}
// 光源构建
let lights = [];
function initLight() {
  //光源1为环境光
  let ambientLight = new THREE.AmbientLight( 0xeeeeee, 0.8 );
  //光源2为点光源
  let pointLight = new THREE.PointLight( 0xffffff, 0.3 );
  pointLight.position.set( 2000, 2000, 0);
  lights.push(ambientLight, pointLight);
  scene.add(ambientLight);
  scene.add(pointLight);
}
// 初始化辅助线和背景图
function initDebug() {
  //模型辅助线
  let axisHelper = new THREE.AxesHelper(500);
  
  //给场景添加天空盒子纹理
  let cubeTextureLoader = new THREE.CubeTextureLoader();
  cubeTextureLoader.setPath( './src/common/img/textures/' );
  //六张图片分别是朝前的（posz）、朝后的（negz）、朝上的（posy）、朝下的（negy）、朝右的（posx）和朝左的（negx）。
  let cubeTexture = cubeTextureLoader.load( [
      'right.jpg', 'left.jpg',
      'top.jpg', 'bottom.jpg',
      'front.jpg', 'back.jpg'
  ] );

  scene.add(axisHelper);
  scene.background = cubeTexture;
}
// 初始化模型（带纹理）
let meshObj;
let texture;
function initObject() {
    let loader;
    let curPng = new PNG();
    let loaderNum = 0;

    // texture载入，在node中利用Data URI格式来载入图片纹理
    // three.js中TextureLoader载入的图片纹理，都调用了DOM中的<img>对象，在node中不适用。
    // 解决思路一：search node中实现img对象的中间件
    // 解决思路二：利用自定义纹理材质来变形导入图片纹理，见模型的load

    // 获得突破，通过DataTexture来导入纹理图片
    loaderNum++;
    fs.createReadStream(backgroundImg)
        .pipe(curPng)
        .on('parsed', () => {
            let width = curPng.width;
            let height = curPng.height;
            let data = curPng.data;
            
            texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
            texture.generateMipmaps = true;
            texture.flipY = true;
            texture.unpackAlignment = 4;
            texture.needsUpdate = true;
            console.log(`parsed: ${backgroundImg}`)

            loaderNum--;
            if(loaderNum === 0){
                render();
            }
        });

    // 模型导入
    loader = new JSONLoader( );
    loaderNum++;
    loader.load( modelPath, function ( geometry, materials ) {
        meshObj = new THREE.Mesh( geometry, materials );
        console.log(`loaded: ${modelPath}`)

        loaderNum--;
        if(loaderNum === 0){
            render();
        }
    });
}

// 渲染调用
function render() {
    // Let's create a render target object where we'll be rendering
    let rtTexture = new THREE.WebGLRenderTarget(
        WIDTH, HEIGHT, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
    })
    meshObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            // 设置纹理映射
            child.material[0].map = texture;
            child.material[0].side = THREE.DoubleSide;
            child.material[0].transparent = true;
            console.log('mesh, finised')
        }
    });
    meshObj.position.y = viewPositionY;
    meshObj.position.x = viewPositionX;
    meshObj.position.z = viewPositionZ;
    scene.add( meshObj );
    renderer.setRenderTarget(rtTexture);
    renderer.render(scene, camera);
    exportImg();
}
// 初始化动作
function init(debug){
    // 必须先初始化场景
    initScene();
    initRenderer();
    initCamera();
    if (debug) {
      initDebug();
    }
    initLight();
    initObject();
}
// 导出图片
function exportImg(){
    let newGl = renderer.getContext()

    let pixels = new Uint8Array(4 * WIDTH * HEIGHT)

    newGl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    for(let j = 0; j < HEIGHT; j++){
        for(let i = 0; i < WIDTH; i++){
            const k = j * WIDTH + i
            const r = pixels[4*k]
            const g = pixels[4*k + 1]
            const b = pixels[4*k + 2]
            const a = pixels[4*k + 3]

            const m = (HEIGHT - j + 1) * WIDTH + i
            png.data[4*m]     = r
            png.data[4*m + 1] = g
            png.data[4*m + 2] = b
            png.data[4*m + 3] = a
        }
    }

    let stream = fs.createWriteStream(outPath)
    png.pack().pipe(stream)

    stream.on('close', () => {
        const endTime = Number(new Date());
        console.log(`mage written: ${ outPath }`)
        console.log(`The process execute: ${endTime - startTime}ms`)
    }
    )
}

init();
