import { EventEmitter } from 'events'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import * as THREE from 'three'

// Assets
import reinaldPath from '../assets/models/reinald1.obj?url'
import codingPath from '../assets/models/coding.glb?url'

const modelConfig = {
  reinald: {
    x: -4,
    y: -1.5,
    z: 0,
    rotateX: 0,
    rotateY: Math.PI * 0.25,
    rotateZ: 0,
    scaleX: 2.5,
    scaleY: 2.5,
    scaleZ: 2.5,
  },
  coding: {
    x: 3.5,
    y: -1,
    z: 0,
    rotateX: 0,
    rotateY: Math.PI * -0.25,
    rotateZ: 0,
    scaleX: 10,
    scaleY: 10,
    scaleZ: 10,
  },
}

export default class Resources extends EventEmitter {
  static instance

  static getInstance(assets) {
    return Resources.instance ?? new Resources(assets)
  }

  constructor() {
    super()

    if (Resources.instance) return Resources.instance
    Resources.instance = this

    // Setup model loader
    const THREE_PATH = `https://unpkg.com/three@0.161.0`
    const dracoLoader = new DRACOLoader().setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/`)

    this.gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader)
    this.objLoader = new OBJLoader()

    this.models = {
      text: null,
      main: {},
    }
    this.loadingCount = 0

    // Load fonts
    this.initResources()
  }

  // First load in fonts
  initResources() {
    const loader = new FontLoader()
    // loader.load('/src/webgl/assets/fonts/Outfit_Regular.json', (font) => {
    loader.load('/src/webgl/assets/fonts/DM_Sans_SemiBold.json', (font) => {
      this.font = font
      this.loadModelResources() // Load model resources after initial resources are loaded
      // this.emit('ready')
    })
  }

  loadModelResources() {
    this.createTextMeshes() // Create text meshes after font is loaded
    this.loadOBJModel('reinald', reinaldPath)
    this.loadGLBModel('coding', codingPath)
  }

  createTextMeshes() {
    // Create text meshes
    const params = {
      font: this.font,
      size: 1,
      depth: 0.02,
      curveSegments: 60,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    }
    const texts = [
      "Hi, I'm Reinald",
      'Creative Developer',
      'based in Amsterdam',
      'I love to create',
      'immersive',
      'and',
      'interactive',
      'experiences',
    ]
    this.models.text = texts.map((text) => this.createText(text, params))
  }

  createText(text, params) {
    const geometry = new TextGeometry(text, params)
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    console.log('TextGeometry BoundingBox:', geometry.boundingBox)
    console.log('TextGeometry BoundingSphere:', geometry.boundingSphere)

    const material = new THREE.MeshBasicMaterial({ color: 'white' })
    const mesh = new THREE.Mesh(geometry, material)

    // Notify that this mesh uses a plane mouse interaction
    mesh.userData.hasPlaneRaycast = true

    // Offset the geometry's vertex positions by half of its bounding box
    const offset = new THREE.Vector3()
    geometry.boundingBox.getCenter(offset).negate()
    geometry.translate(offset.x, offset.y, offset.z)

    return mesh
  }

  loadOBJModel(name, path) {
    this.loadingCount++
    this.objLoader.load(
      path,
      (model) => {
        const mesh = model.children[0]
        this.onModelLoad(name, mesh)
      },
      undefined,
      (error) => console.error(`Error loading ${name} model:`, error)
    )
  }

  loadGLBModel(name, path) {
    this.loadingCount++
    this.gltfLoader.load(
      path,
      (model) => {
        const mesh = model.scene.children[0]
        this.onModelLoad(name, mesh)
      },
      undefined,
      (error) => console.error(`Error loading ${name} model:`, error)
    )
  }

  onModelLoad(name, mesh) {
    const config = modelConfig[name]

    // Create a scaling matrix
    const scaleMatrix = new THREE.Matrix4().makeScale(config.scaleX, config.scaleY, config.scaleZ)
    mesh.geometry.applyMatrix4(scaleMatrix)

    // Offset the geometry's vertex positions by half of its bounding box
    const offset = new THREE.Vector3()
    const modelGeometry = mesh.geometry

    modelGeometry.computeBoundingBox()
    modelGeometry.boundingBox.getCenter(offset).negate()
    modelGeometry.translate(offset.x + config.x, offset.y + config.y, offset.z + config.z)
    modelGeometry.rotateX(config.rotateX)
    modelGeometry.rotateY(config.rotateY)
    modelGeometry.rotateZ(config.rotateZ)

    mesh.userData.hasPlaneRaycast = false

    // Add model to available
    this.models.main[name] = mesh
    this.loadingCount--

    // Emit ready when all models are loaded
    if (this.loadingCount === 0) {
      this.emit('ready')
      document.body.classList.remove('is-loading')
    }
  }
}
