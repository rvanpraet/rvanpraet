import { EventEmitter } from 'events'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import * as THREE from 'three'

// Assets
import reinaldPath from '/webgl/assets/models/reinald1.obj?url'
import codingPath from '/webgl/assets/models/coding.glb?url'
import particleTexture from '/webgl/assets/textures/particle2.png?url'
import fontPath from '/webgl/assets/fonts/DM_Sans_SemiBold.json?url'
import { getCurrentBreakpoint } from '@/scripts/utils/breakpoints'
import { modelConfig, textModelConfig } from './ResourcesConfig'

// Calculate total progress, total of all resource sizes
const TOTAL_PROGRESS = 165190 + 4045609 + 7886300

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
    this.textures = {}
    this.loadingCount = 0

    // Load fonts
    this.initResources()
  }

  // First load in fonts
  initResources() {
    this.loadingPercentage = document.querySelector('.loading-percentage')
    this.loadedProgress = []
    this.loadingProgress = 0
    this.totalLoadingProgress = 300
    const fontLoader = new FontLoader()
    const textureLoader = new THREE.TextureLoader()
    this.textures = {
      mask: textureLoader.load(particleTexture),
    }

    fontLoader.load(
      fontPath,
      (font) => {
        this.font = font
        this.loadModelResources() // Load model resources after initial resources are loaded
        // this.emit('ready')
      },
      this.onResourceProgress.bind(this)
    )
  }

  loadModelResources() {
    this.createTextMeshes() // Create text meshes after font is loaded
    this.createLineMesh2() // Create line mesh for waveform
    this.loadOBJModel('reinald', reinaldPath)
    this.loadGLBModel('coding', codingPath)
  }

  createTextMeshes() {
    // Create text meshes
    const baseTextParams = {
      font: this.font,
      size: 1.2,
      depth: 0.02,
      curveSegments: 60,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    }

    // Define the texts to create with their parameters
    const texts = textModelConfig[getCurrentBreakpoint()]
    this.models.text = texts.map(([text, config]) => this.createTextV2(text, { ...baseTextParams, ...config }))
  }

  createText(text, params) {
    const { offsets, ...geometryParams } = params
    const geometry = new TextGeometry(text, geometryParams)

    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    const material = new THREE.MeshBasicMaterial({ color: 'white' })
    const mesh = new THREE.Mesh(geometry, material)

    // Notify that this mesh uses a plane mouse interaction
    mesh.userData.hasPlaneRaycast = true

    // Offset the geometry's vertex positions by half of its bounding box
    const offset = new THREE.Vector3()
    geometry.boundingBox.getCenter(offset).negate()
    geometry.translate(offset.x, offset.y, offset.z)

    // Apply model specific transformations
    geometry.translate(offsets.x, offsets.y, offsets.z)

    return mesh
  }

  createTextV2(text, params) {
    const { offsets, ...geometryParams } = params

    // Split text by newlines to handle multi-line text
    const words = text.split(/\n+/).filter((word) => word.length > 0)

    if (words.length === 0) {
      // Return empty mesh if no text
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.MeshBasicMaterial({ color: 'white' })
      return new THREE.Mesh(geometry, material)
    }

    // Create geometries for each word
    const wordGeometries = []
    let currentY = 0

    // Calculate line height from first word's bounding box
    const firstWordGeometry = new TextGeometry(words[0], geometryParams)
    firstWordGeometry.computeBoundingBox()
    const lineHeight = firstWordGeometry.boundingBox.max.y - firstWordGeometry.boundingBox.min.y
    const lineSpacing = lineHeight * 1.5 // 50% spacing between lines

    // Create and position each word geometry
    for (let i = 0; i < words.length; i++) {
      const wordGeometry = new TextGeometry(words[i], geometryParams)
      wordGeometry.computeBoundingBox()

      // Center each word horizontally
      const wordWidth = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x
      const wordCenterX = (wordGeometry.boundingBox.max.x + wordGeometry.boundingBox.min.x) / 2

      // Position word: centered horizontally, stacked vertically
      wordGeometry.translate(-wordCenterX, -currentY, 0)

      wordGeometries.push(wordGeometry)

      // Move to next line position
      currentY += lineSpacing
    }

    // Merge all word geometries into a single geometry
    const mergedGeometry = BufferGeometryUtils.mergeGeometries(wordGeometries)

    // Compute bounding box and sphere for the merged geometry
    mergedGeometry.computeBoundingBox()
    mergedGeometry.computeBoundingSphere()

    const material = new THREE.MeshBasicMaterial({ color: 'white' })
    const mesh = new THREE.Mesh(mergedGeometry, material)

    // Notify that this mesh uses a plane mouse interaction
    mesh.userData.hasPlaneRaycast = true

    // Offset the geometry's vertex positions by half of its bounding box
    const offset = new THREE.Vector3()
    mergedGeometry.boundingBox.getCenter(offset).negate()
    mergedGeometry.translate(offset.x, offset.y, offset.z)

    // Apply model specific transformations
    mergedGeometry.translate(offsets.x, offsets.y, offsets.z)

    return mesh
  }

  createLineMesh() {
    // Line material

    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 0.5, // in world units with size attenuation, pixels otherwise
      worldUnits: true,
      // vertexColors: true,

      // alphaToCoverage: true,
    })

    // Position and THREE.Color Data

    const positions = []
    const colors = []
    const points = []
    for (let i = -15; i < 15; i++) {
      const t = i / 3
      points.push(new THREE.Vector3(-3, t, 0))
    }

    const spline = new THREE.CatmullRomCurve3(points)
    const divisions = Math.round(3 * points.length)
    const point = new THREE.Vector3()
    const color = new THREE.Color()

    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l

      spline.getPoint(t, point)
      positions.push(point.x, point.y, point.z)

      // color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace)
      // colors.push(color.r, color.g, color.b)
    }

    const lineGeometry = new LineGeometry()
    lineGeometry.setPositions(positions)
    // lineGeometry.setColors(colors)

    const line = new Line2(lineGeometry, matLine)
    // line.computeLineDistances()
    line.scale.set(1, 1, 1)

    this.models.main.waveform = line
  }

  createLineMesh2() {
    // Line material
    const config = modelConfig[getCurrentBreakpoint()].waveform
    const material = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide })
    const geometry = new THREE.PlaneGeometry(0.2, 10, 1, 1)

    geometry.translate(-4, 0, 0)

    // geometry.computeBoundingBox()

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.hasPlaneRaycast = true
    // mesh.position.set(-4, 0, 0)
    this.models.main.waveform = mesh
  }

  loadOBJModel(name, path) {
    this.loadingCount++
    this.objLoader.load(
      path,
      (model) => {
        const mesh = model.children[0]
        this.onModelLoad(name, mesh)
      },
      this.onResourceProgress.bind(this),
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
      this.onResourceProgress.bind(this),
      (error) => console.error(`Error loading ${name} model:`, error)
    )
  }

  onModelLoad(name, mesh) {
    const breakpoint = getCurrentBreakpoint()
    const config = modelConfig[breakpoint][name]
    // const config = modelConfig[name]

    // Create a scaling matrix
    const scaleMatrix = new THREE.Matrix4().makeScale(config.scaleX, config.scaleY, config.scaleZ)
    mesh.geometry.applyMatrix4(scaleMatrix)

    // Offset the geometry's vertex positions by half of its bounding box
    const offset = new THREE.Vector3()
    const modelGeometry = mesh.geometry

    modelGeometry.computeBoundingBox()
    modelGeometry.boundingBox.getCenter(offset).negate()

    // Apply model specific transformations
    modelGeometry.translate(offset.x + config.x, offset.y + config.y, offset.z + config.z)
    modelGeometry.rotateX(config.rotateX)
    modelGeometry.rotateY(config.rotateY)
    modelGeometry.rotateZ(config.rotateZ)

    // Notify that this mesh does not use a plane mouse interaction
    mesh.userData.hasPlaneRaycast = false

    // Add model to available
    this.models.main[name] = mesh
    this.loadingCount--

    // Emit ready when all models are loaded
    if (this.loadingCount === 0) {
      this.emit('ready')
      const loaderBg = document.querySelector('.loading-bg')
      loaderBg.classList.remove('is-loading')
    }
  }

  onResourceProgress(e) {
    if (e.loaded === e.total) {
      this.loadedProgress.push(e.loaded)
      this.loadingPercentage.textContent = `${Math.round((this.getLoadedProgress() / TOTAL_PROGRESS) * 100)}`
    } else {
      this.loadingPercentage.textContent = `${Math.round(((this.getLoadedProgress() + e.loaded) / TOTAL_PROGRESS) * 100)}`
    }
  }

  getLoadedProgress() {
    return this.loadedProgress.reduce((accumulator, currentValue) => {
      return accumulator + currentValue
    }, 0)
  }
}
