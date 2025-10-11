import Experience from './Experience.js'
import Handler from './abstract/Handler.js'
import * as THREE from 'three'
import GPGPU from './gpgpu/GPGPU.js'
import { getCurrentBreakpoint, isMaxMD } from '@/scripts/utils/breakpoints.js'

const worldConfig = {
  xs: {
    force: 0.6,
    particleSize: 10,
    particleCount: 100,
  },
  sm: {
    force: 0.6,
    particleSize: 15,
    particleCount: 64,
  },
  md: {
    force: 0.6,
    particleSize: 15,
    particleCount: 64,
  },
  lg: {
    force: 0.5,
    particleSize: 15,
    particleCount: 128,
  },
  xl: {
    force: 0.5,
    particleSize: 12,
    particleCount: 128,
  },
  xxl: {
    force: 0.5,
    particleSize: 12,
    particleCount: 150,
  },
  xxxl: {
    force: 0.5,
    particleSize: 15,
    particleCount: 200,
  },
}

export default class Mask extends Handler {
  static instance

  static getInstance() {
    if (!Mask.instance) {
      Mask.instance = new Mask()
    }

    return Mask.instance
  }

  constructor() {
    super(Mask.id)

    this.targetId = 0
    this.isScrolling = false
    this.scrollTimeout = null

    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.renderer = this.experience.renderer
    this.camera = this.experience.camera
    this.mouse = this.experience.mouse
    this.sizes = this.experience.sizes
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.scene.background = new THREE.Color(0x0d0d0d)

    this.params = {
      color: new THREE.Color('#fff'),
      // color: new THREE.Color(0xc18383),
      size: worldConfig[getCurrentBreakpoint()].particleSize,
      minAlpha: 0.7,
      maxAlpha: 1,
      force: worldConfig[getCurrentBreakpoint()].force,
    }

    this.init()
  }

  init() {
    this.setupModels()
    this.setupGPGPU()
    this.setupDebug()
    this.setupListeners()
  }

  setupModels() {
    const contactModel = this.resources.models.text.pop()
    const xpModel = this.resources.models.text.pop()
    const projectsModel = this.resources.models.text.pop()
    this.model = this.resources.models.text[0]
    let { reinald, coding, waveform } = this.resources.models.main

    const actualCodingModel = isMaxMD() ? coding : this.resources.models.textCoding
    this.models = [
      ...this.resources.models.text,
      reinald,
      actualCodingModel,
      waveform,
      projectsModel,
      xpModel,
      contactModel,
    ]

    console.log(this.models)

    // this.scene.add(this.resources.models.text2)
  }

  setupCameraPosition() {
    this.camera.orbitControls._rotateLeft(Math.PI)
  }

  setupGPGPU() {
    this.gpgpu = new GPGPU({
      size: worldConfig[getCurrentBreakpoint()].particleCount,
      camera: this.camera.target,
      renderer: this.renderer.webglRenderer,
      mouse: this.mouse,
      scene: this.scene,
      sizes: this.sizes,
      model: this.model,
      debug: this.debug,
      params: this.params,
      targets: [...this.models],
      particleMask: this.resources.textures.mask,
    })
  }

  setupDebug() {
    if (this.debug.active) {
      const particlesFolder = this.debug.gui.addFolder('particles')
      particlesFolder.addColor(this.gpgpu.material.uniforms.uColor, 'value').name('Color')
      particlesFolder.add(this.gpgpu.material.uniforms.uParticleSize, 'value').name('Size').min(1).max(10).step(0.1)
      particlesFolder.add(this.gpgpu.uniforms.velocityUniforms.uForce, 'value').name('Force').min(0).max(0.8).step(0.01)
      particlesFolder.add(this.gpgpu.material.uniforms.uMinAlpha, 'value').name('Min Alpha').min(0).max(1).step(0.01)
      particlesFolder.add(this.gpgpu.material.uniforms.uMaxAlpha, 'value').name('Max Alpha').min(0).max(1).step(0.01)
    }
  }

  update(state) {
    if (this.gpgpu) this.gpgpu.compute(state)
  }

  setupListeners() {
    // add an appropriate event listener
    document.addEventListener('swap-target', (e) => {
      const { targetId } = e.detail
      this.targetId = targetId
      this.gpgpu.swapTarget(targetId)
    })
  }
}
