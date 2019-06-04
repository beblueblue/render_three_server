const startTime = Number(new Date());
const WIDTH = 1200;
const HEIGHT = 1200;

const { JSDOM } = require("jsdom");
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
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


const outPath = './src/common/img/output/outDemo.png';
const textureImgUrl = './src/common/img/texture/turtle.png';
const backgroundImg = './src/common/img/background-demo.png';
let URIOfImg = {};
// const png = new PNG({ width: WIDTH, height: HEIGHT });

global.document = document;

render = (dataTexture) =>{
    // Parameters (the missing one is the camera position, see below)
    const width = 600
    const height = 400
    const path = outPath
    const png = new PNG({ width: width, height: height })
    
    // THREE.js business starts here
    let scene = new THREE.Scene() 

    // camera attributes
    const VIEW_ANGLE = 45
    const ASPECT = width / height
    const NEAR = 0.1
    const FAR  = 100

    // set up camera
    let camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)

    scene.add(camera)
    camera.position.set(0, 2, 2)
    camera.lookAt(scene.position)

    // The width / height we set here doesn't matter
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        width: 0,
        height: 0,
        canvas: canvas, // This parameter is usually not specified
        context: gl     // Use the headless-gl context for drawing offscreen
    })

    // add some geometry
    let geometry = new THREE.BoxGeometry( 1, 1, 1 )

    // add a material; it has to be a ShaderMaterial with custom shaders for now 
    // this is a work in progress, some related link / issues / discussions
    //
    // https://github.com/stackgl/headless-gl/issues/26
    // https://github.com/mrdoob/three.js/pull/7136
    // https://github.com/mrdoob/three.js/issues/7085
    let material = new THREE.ShaderMaterial()

    material.vertexShader = `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `
    material.fragmentShader = `
        uniform sampler2D dataTexture;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(dataTexture, vUv);
        }
    `
    material.uniforms = {
        dataTexture: { type: "t", value: dataTexture }
    }

    // Create the mesh and add it to the scene
    let cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Let's create a render target object where we'll be rendering
    let rtTexture = new THREE.WebGLRenderTarget(
        width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
    })

    // render
    renderer.setRenderTarget(rtTexture);
    renderer.render(scene, camera)
    // read render texture into buffer
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
        console.log("Image written: #{ outPath }")
    )
}

var png = new PNG()
var stream = fs.createReadStream(textureImgUrl)
stream.pipe(png)

png.on('parsed', () => {

    console.log('parsed !', width, height)

    var width  = png.width
    var height = png.height
    var data   = png.data

    // console.log(typeof(pixels)) 
    dataTexture = new THREE.DataTexture(data, width, height,
                                        THREE.RGBAFormat )
    dataTexture.needsUpdate = true

    render(dataTexture);
})
