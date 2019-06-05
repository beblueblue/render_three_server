const startTime = Number(new Date());
const WIDTH = 2048;
const HEIGHT = 2048;

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
const TextureLoader = require('./src/common/loaders/TextureLoader');
const PNG = require('pngjs').PNG;
const gl = require('gl')(WIDTH, HEIGHT, {
    preserveDrawingBuffer: true,
    antialias: true
});


const outPath = './src/common/img/output/out.png';
const backgroundImg = './src/common/img/background-demo.png';
let URIOfImg = {};
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
function initObject() {
    let onProgress;
    let onError;
    let manager;
    let textureLoader;
    let texture;
    let loader;
    let curPng = new PNG();

    // model载入过程监控
    onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    // model载入失败监控
    onError = function ( xhr ) {
        console.log('model:' + xhr + '引入失败');
    };
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( url, loaded, total ) {
        console.log(url, loaded, total);
    };

    // texture载入，在node中利用Data URI格式来载入图片纹理
    // three.js中TextureLoader载入的图片纹理，都调用了DOM中的<img>对象，在node中不适用。
    // 解决思路一：search node中实现img对象的中间件
    // 解决思路二：利用自定义纹理材质来变形导入图片纹理，见模型的load

    // 获得突破，通过DataTexture来导入纹理图片
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
            console.log(`parsed, ${backgroundImg}`)
        });

    // 模型导入
    loader = new JSONLoader( manager );
    loader.load( './src/common/models/textureObj2.js', function ( geometry, materials ) {
        // console.log(geometry)
        // console.log(materials)
        let meshObj = new THREE.Mesh( geometry, materials );
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
        render();
    }, onProgress, onError );
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
// 构建自定义着色器材质
function initShaerMatriel(path, geometry) {
    let material = new THREE.ShaderMaterial();
    let dataTexture;
    let meshObj;
    let curPng = new PNG();

    material.vertexShader = `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `;
    material.fragmentShader = `
        uniform sampler2D dataTexture;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(dataTexture, vUv);
        }
    `;
    // material.lights = true;

    fs.createReadStream(path)
        .pipe(curPng)
        .on('parsed', () => {
            let width = curPng.width;
            let height = curPng.height;
            let data = curPng.data;
            
            dataTexture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
            dataTexture.needUpdate = true;
            material.uniforms = {
                dataTexture: { type: "t", value: dataTexture }
            }
            // meshObj = new THREE.Mesh(geometry, material);
            meshObj = new THREE.Mesh(geometry);
            meshObj.position.y = viewPositionY;
            meshObj.position.x = viewPositionX;
            meshObj.position.z = viewPositionZ;
            console.log(data, width, height);
            scene.add( meshObj );
            render();
            console.log('parsed', width, height);
        });
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

    stream.on('close', () =>
        console.log(`mage written: ${ outPath }`)
    )
    const endTime = Number(new Date());
    console.log(endTime - startTime)
}

init();
