import { EventEmitter } from 'events'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { OBJExporter } from 'three/examples/jsm/Addons.js'
import { GLTFExporter } from 'three/examples/jsm/Addons.js'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import * as THREE from 'three'

// Assets
import reinaldPath from '@/webgl/assets/models/reinald.glb?url'
import codingPath from '@/webgl/assets/models/coding.glb?url'
import textCoding from '@/webgl/assets/models/text-coding.glb?url'
import textReinald from '@/webgl/assets/models/text-reinald.glb?url'
import textCreative from '@/webgl/assets/models/text-creative.glb?url'
import textSound from '@/webgl/assets/models/text-sound.glb?url'
import textProjects from '@/webgl/assets/models/text-projects.glb?url'
import textXp from '@/webgl/assets/models/text-xp.glb?url'
import textContact from '@/webgl/assets/models/text-contact.glb?url'

import particleTexture from '@/webgl/assets/textures/particle2.png?url'
import fontPath from '@/webgl/assets/fonts/DM_Sans_SemiBold.json?url'
import { getCurrentBreakpoint, isMaxMD } from '@/scripts/utils/breakpoints'
import { modelConfig, textCoding, textCodingConfig, textModelConfig } from './ResourcesConfig'

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
    this.gltfExporter = new GLTFExporter()

    this.models = {
      text: null,
      main: {},
      textCoding: null,
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
      mask: textureLoader.load(particleTexture, () => {
        this.loadModelResources()
      }),
    }

    // fontLoader.load(
    //   fontPath,
    //   (font) => {
    //     this.font = font
    //     this.loadModelResources() // Load model resources after initial resources are loaded
    //   },
    //   this.onResourceProgress.bind(this)
    // )
  }

  loadModelResources() {
    this.createLineMesh() // Create line mesh for waveform

    const modelsToLoad = [
      ['textReinald', textReinald],
      ['textCreative', textCreative],
      ['textSound', textSound],
      ['reinald', reinaldPath],
      ['coding', codingPath],
      ['textProjects', textProjects],
      ['textXp', textXp],
      ['textContact', textContact],
    ]

    modelsToLoad.forEach(([name, path]) => {
      this.loadGLBModel(name, path)
    })
    this.loadGLBModel('reinald', reinaldPath)
    // this.loadGLBModel('coding', codingPath)

    // Load in models based on config
    // Make sure the textCoding model is only used for desktop and larger tablets
    if (isMaxMD()) {
      this.loadGLBModel('coding', codingPath)
    } else {
      this.models.textCoding = this.createText(textCoding, {
        font: this.font,
        depth: 0.02,
        curveSegments: 1,
        bevelEnabled: false,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 1,
        useWordCenterX: false,
        alignRight: true,
        ...textCodingConfig[getCurrentBreakpoint()],
      })
    }

    this.createTextMeshes() // Create text meshes after font is loaded
    this.createLineMesh() // Create line mesh for waveform
  }

  createTextMeshes() {
    // Create text meshes
    const baseTextParams = {
      font: this.font,
      size: 1.2,
      depth: 0.02,
      curveSegments: 1,
      bevelEnabled: false,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 1,
      useWordCenterX: true,
      alignRight: false,
    }

    // Define the texts to create with their parameters
    const texts = textModelConfig[getCurrentBreakpoint()]
    this.models.text = texts.map(([text, config]) => this.createText(text, { ...baseTextParams, ...config }))
  }

  createText(text, params) {
    const { offsets, useWordCenterX, alignRight, ...geometryParams } = params

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
    let currentX = 0

    // Calculate line height from first word's bounding box
    const firstWordGeometry = new TextGeometry(words[0], geometryParams)
    firstWordGeometry.computeBoundingBox()
    const lineHeight = firstWordGeometry.boundingBox.max.y - firstWordGeometry.boundingBox.min.y
    const lineSpacing = lineHeight * 1.5 // 50% spacing between lines
    const tabIndent = 0.5

    // Create and position each word geometry
    for (let i = 0; i < words.length; i++) {
      // Scan for tab indents
      if (words[i].includes('<tab>')) {
        words[i] = words[i].replace('<tab>', '')
        currentX += tabIndent
      }

      if (words[i].includes('<-tab>')) {
        words[i] = words[i].replace('<-tab>', '')
        currentX -= tabIndent
      }

      const wordGeometry = new TextGeometry(words[i], geometryParams)
      wordGeometry.computeBoundingBox()

      // Center each word horizontally
      const wordWidth = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x
      const wordCenterX = (wordGeometry.boundingBox.max.x + wordGeometry.boundingBox.min.x) / 2

      // Position word: centered horizontally (if useWordCenterX), stacked vertically
      // Offset by currentX for tab indents
      wordGeometry.translate(-wordCenterX * Number(useWordCenterX) + currentX, -currentY, 0)

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
    mesh.userData.isTextMesh = true

    const data = this.gltfExporter.parse(
      mesh,
      (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' })
        const link = document.createElement('a')
        link.style.display = 'none'
        document.body.appendChild(link)
        link.href = URL.createObjectURL(blob)
        link.download = 'model.glb'
        link.click()
        // Cleanup
        setTimeout(() => {
          URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }, 100)
      },
      null,
      { binary: true }
    )

    // Offset the geometry's vertex positions by half of its bounding box
    const offset = new THREE.Vector3()
    mergedGeometry.boundingBox.getCenter(offset).negate()
    mergedGeometry.translate(offset.x, offset.y, offset.z)

    // Apply model specific transformations
    mergedGeometry.translate(offsets.x - offset.x * Number(alignRight) * 1.5, offsets.y, offsets.z)

    return mesh
  }

  createLineMesh() {
    // Line material
    const { x, y, z, rotateX, rotateY, rotateZ } = modelConfig[getCurrentBreakpoint()].waveform
    const material = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide })
    const geometry = new THREE.PlaneGeometry(0.2, 10, 1, 1)

    geometry.translate(x, y, z)
    geometry.rotateX(rotateX)
    geometry.rotateY(rotateY)
    geometry.rotateZ(rotateZ)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.hasPlaneRaycast = true
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
      // const loaderBg = document.querySelector('.loading-bg')
      // loaderBg.classList.remove('is-loading')
    }
  }

  onResourceProgress(e) {
    console.log('e', e)
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
