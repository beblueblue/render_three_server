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
const THREE = require('three');
const OBJLoader = require('./src/common/loaders/OBJLoader_node');
const MTLLoader = require('./src/common/loaders/MTLLoader_node');
const PNG = require('pngjs').PNG;
const gl = require('gl')(WIDTH, HEIGHT, {
    preserveDrawingBuffer: true,
    antialias: true,
});

const png = new PNG({ width: WIDTH, height: HEIGHT });

global.document = document;
global.window = window;

const lightIntensity = {
    aroundPoint: 0.2,
    ambient: 1,
    autoPoint: 4,
}

const paramsCache = {
    gl,
    canvas,
    WIDTH,
    HEIGHT,
    // 合成图片输出地址
    outPath: './src/common/img/output/out-zb.png',
    // 相机视角
    copyPosition: new THREE.Vector3(-9, 27, 40),
    copyLookAt: new THREE.Vector3(0, 0, 0),
    modelPath: './src/static/models/zb2.obj',
    mtlPath: './src/static/models/zb2.mtl',
    colorMapPath: './src/static/imgs/map_green.png',
    normalMapPath: './src/static/imgs/map_normal.png',
    backUrls: [
        'HDR_r.jpg', 'HDR_l.jpg',
        'HDR_u.jpg', 'HDR_d.jpg',
        'HDR_f.jpg', 'HDR_b.jpg'
    ],
    autoPointIntensity: lightIntensity.autoPoint,
    lights: [
        {
            type: 'AmbientLight',
            color: '#fff',
            intensity: lightIntensity.ambient,
        },
        {
            type: 'PointLight',
            color: '#fff',
            intensity: lightIntensity.aroundPoint,
            position: [0, 200, 0]
        },
        {
            type: 'PointLight',
            color: '#fff',
            intensity: lightIntensity.aroundPoint,
            position: [0, -200, 0]
        },
        {
            type: 'PointLight',
            color: '#fff',
            intensity: lightIntensity.aroundPoint,
            position: [200, 0, 0]
        },
        {
            type: 'PointLight',
            color: '#fff',
            intensity: lightIntensity.aroundPoint,
            position: [-200, 0, 0]
        },
        {
            type: 'PointLight',
            color: '#fff',
            intensity: lightIntensity.aroundPoint,
            position: [0, 0, 200]
        },
        {
            type: 'PointLight',
            color: '#fff',
            intensity: lightIntensity.aroundPoint,
            position: [0, 0, -200]
        },
    ],
}

/**
 * 服务端测试脚本
 */
class renderObject {
    constructor(options) {
        this.defaultOpt = {}
        this.options = {}

        Object.assign(this.options, this.defaultOptions, options)

        this.componentCache = {
            renderer: null,
            scene: null,
            camera: null,
            model: null,
            colorMap: null,
            normalMap: null,
            envMap: null,
            loadedNum: 0,
            needLoadNum: 6,
            autoPointLight: null,
        }
    }
    /**
     * 开始绘制
     */
    draw() {
        // 同步任务
        this.initRenderer()
        this.initScene()
        this.initCamera()
        this.initLights()

        // 异步任务
        Promise.all([
            this.loadColorMap(),
            this.loadNormalMap(),
            this.loadModel(),
        ]).then(
            () => {
                const { colorMap, normalMap, model } = this.componentCache
                this.initModel()
            }
        )
    }
    /**
     * 渲染器构建
     */
    initRenderer() {
        const { options, componentCache } = this
        const { canvas, gl } = options
        componentCache.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            preserveDrawingBuffer: true,
            context: gl,
        });
    }
    /**
     * 场景构建
     */
    initScene() {
        const { componentCache } = this

        componentCache.scene = new THREE.Scene();
    }
    /**
     * 相机构建
     */
    initCamera() {
        const { options: { WIDTH, HEIGHT, copyPosition, copyLookAt }, componentCache } = this

        const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
        camera.position.copy(copyPosition);
	    camera.lookAt(copyLookAt);
	    camera.updateMatrixWorld()
        componentCache.scene.add(camera)

        componentCache.camera = camera
    }
    /**
     * 灯光构建
     */
    initLights() {
        const { 
                componentCache: { scene, camera }, 
                options: { lights, autoPointIntensity } 
            } = this

        //增加一个相机位置的点光源
        const autoPointLight = new THREE.PointLight( '#fff', autoPointIntensity )
        autoPointLight.position.copy(camera.position)
        scene.add(autoPointLight)

        lights.forEach(ele => {
            let light = null
            switch(ele.type) {
                case 'PointLight':
                    light = new THREE.PointLight( ele.color, ele.intensity )
                    light.position.set(ele.position[0], ele.position[1], ele.position[2])
                break;
                case 'RectAreaLight':
                    light = new THREE.DirectionalLight( ele.color, ele.intensity, ele.width, ele.height )
                    light.position.set(ele.position[0], ele.position[1], ele.position[2])
                    light.lookAt(ele.lookAt[0], ele.lookAt[1], ele.lookAt[2])
                break;
                case 'AmbientLight':
                    light = new THREE.AmbientLight( ele.color, ele.intensity )
                break;
            }
            scene.add(light)
        });
    }
    /**
     * 加载模型和材质
     */
    async loadModel() {
        const {
            options: { modelPath, mtlPath },
            componentCache,
        } = this
        const manager = new THREE.LoadingManager();
        const mtlLoaderCache = new MTLLoader( manager )
        const OBJLoaderCache = new OBJLoader( manager )

        const materials = await mtlLoaderCache.load( mtlPath )
        materials.preload();
        OBJLoaderCache.setMaterials( materials )
        componentCache.model = await OBJLoaderCache.load( modelPath )
    }
    /**
     * 加载颜色纹理
     */
    async loadColorMap(...arg){
        const { options, componentCache, _loadTexture } = this

        try {
            const texture = await _loadTexture(options.colorMapPath, ...arg);
            texture.magFilter = THREE.LinearFilter
            texture.minFilter = THREE.LinearMipMapLinearFilter
            // texture.repeat.set( 5, 5 );
            componentCache.colorMap = texture;
        }
        catch (err) {
            console.log('加载颜色纹理失败：', err);
        }
    }
    /**
     * 加载法线纹理
     */
    async loadNormalMap(...arg){
        const { options, componentCache, _loadTexture } = this

        try {
            const texture = await _loadTexture(options.normalMapPath, ...arg);
            texture.magFilter = THREE.LinearFilter
            texture.minFilter = THREE.LinearMipMapLinearFilter
            // texture.repeat.set( 5, 5 );
            componentCache.normalMap = texture;
        }
        catch (err) {
            console.log('加载颜色纹理失败：', err);
        }
    }
    /**
     *  纹理加载器
     * @param {String} path 图片地址
     * @param {Number} width 纹理宽度，默认为1024
     * @param {Number} height 纹理高度，默认为1024
     */
    _loadTexture(path, format =  THREE.RGBAFormat) {
        // return new Promise((resolve, reject) => {
        //     fs.readFile(path, (err, data) => {
        //         if (err) {
        //             reject(err)
        //         }
        //         const texture = new THREE.DataTexture(data, width, height, format);
        //         texture.generateMipmaps = true;
        //         texture.flipY = true;
        //         texture.unpackAlignment = 4;
        //         texture.needsUpdate = true;
        //         texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        //         console.log(`load texture: ${path}`)
        //         resolve(texture)
        //     })
        // })
        return new Promise((resolve, reject) => {
            const pngCache = new PNG();
            fs.createReadStream(path)
            .pipe(pngCache)
            .on('parsed', () => {
                const { width, height, data } = pngCache
                
                const texture = new THREE.DataTexture(data, width, height, format);
                texture.generateMipmaps = true;
                texture.flipY = true;
                texture.unpackAlignment = 4;
                texture.needsUpdate = true;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                console.log(`loaded texture: ${path}`)
                resolve(texture)
            })
            .on('error', (error) => {
                reject(error)
            })
        })
    }
    /**
     * 组装模型
     */
    initModel() {
        const { 
            componentCache: { model, colorMap, cubeTexture, normalMap, renderer, camera, scene }
        } = this
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                switch(child.name) {
                    case '发光球':
                        // child.material.emissiveMap = HDRMap;
                        child.material.emissive = new THREE.Color('#fff');
                        child.material.envMap = cubeTexture;
                        break;
                    case '金属球':
                        // child.material.emissive = new THREE.Color('rgba(189, 148, 68, 1)');
                        child.material.envMap = cubeTexture
                        // 高度程度， 默认30
                        // child.material.shininess = 15
                        // 粗糙度, 
                        // child.material.roughness = 1
                        break;
                    case '布料':
                        // 颜色贴图和漫反射，纯色背景通过mtl解析生成
                        child.material.map = colorMap
                        // child.material.color = new THREE.Color('#eee')
                        
                        // 粗糙度
                        child.material.roughness = 0.95
                        // 非金属程度
                        child.material.metalness = 1
                        
                        // 使用蒙皮效果
                        child.material.skinning = true
                        
                        // 把环境贴图加进去
                        // child.material.envMap = cubeTexture
                        // child.material.envMapIntensity  = 0.05
                        
                        // 法线贴图
                        child.material.normalMap = normalMap;
                        child.material.normalScale = new THREE.Vector2(0.2, 0.2);
                        

                        // 将发光颜色设置成自身颜色，自身来着mtl的Kd
                        // child.material.emissive = child.material.color
                        // 将发光贴图设置为颜色贴图
                        // child.material.emissiveMap = textureMap

                        // 环境贴图和颜色贴图的混合方式设定, 设置为mix模式
                        // child.material.combine = THREE.MixOperation
                        
                        // 高光贴图属性, 只针对Phong材质
                        // child.material.specular = new THREE.Color('#000')
                        // 高光程度， 默认30, （暂时不影响渲染效果）
                        // child.material.shininess = 3
                        
                        // child.material.reflectivity = 0.9
                        // child.material.refractionRatio = 0.8
                        break;
                    default :
                        child.material.map = colorMap
                }
                // child.material.side = THREE.DoubleSide;
            }
        })
        console.log('start render')
        // Let's create a render target object where we'll be rendering
        const rtTexture = new THREE.WebGLRenderTarget(
            WIDTH, HEIGHT, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
        })
        scene.add( model );
        renderer.setRenderTarget(rtTexture);
        renderer.render(scene, camera);

        this.exportImg()
    }
    /**
     * 导出图片
     */
    exportImg(){
        const { 
            componentCache: { renderer, },
            options: { WIDTH, HEIGHT, outPath, gl }
        } = this
        const newGl = renderer.getContext()

        const pixels = new Uint8Array(4 * WIDTH * HEIGHT)

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
        const stream = fs.createWriteStream(outPath)
            png.pack().pipe(stream)

            stream.on('close', () => {
                const endTime = Number(new Date());
                console.log(`mage written: ${ outPath }`)
                console.log(`The process execute: ${endTime - startTime}ms`)
            }
        )
    }
}
const renderInit = new renderObject(paramsCache)

renderInit.draw()
