import Experience from './Experience.js'
import Handler from './abstract/Handler.js'
import * as THREE from 'three'
import GPGPU from './gpgpu/GPGPU.js'
import { isMobileDevice } from '@/scripts/utils.js'

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
      size: isMobileDevice() ? 15.0 : 15.0,
      minAlpha: 0.8,
      maxAlpha: 1,
      force: 0.5,
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
    this.model = this.resources.models.text[0]
    this.models = [...this.resources.models.text, ...Object.values(this.resources.models.main), xpModel, contactModel]

    console.log(this.models)
  }

  setupCameraPosition() {
    this.camera.orbitControls._rotateLeft(Math.PI)
  }

  setupGPGPU() {
    this.gpgpu = new GPGPU({
      size: isMobileDevice() ? 75 : 150,
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
    window.addEventListener('wheel', (event) => {
      if (this.isScrolling) return

      // CONSTANTS
      const POS_SCROLL_VALUE = 40
      const SCROLL_DURATION = 1000
      const MAX = this.models.length - 1

      //   document.documentElement.style.overflow = 'auto'

      // INTERCEPT SCROLL WHEN AT LAST TEXT MODEL
      //   if (this.targetId === MAX - 1) {
      //     console.log('ended locked phase')
      //     document.documentElement.style.overflow = 'auto'
      //     this.params.force = 0.25

      //     // const nextEl = document.querySelector('.introduction-general')
      //     // nextEl.scrollIntoView({
      //     //     block: 'start',
      //     //     behavior: 'smooth',
      //     // })

      //     return
      //   }

      // if (Math.abs(event.deltaY) >= POS_SCROLL_VALUE) {
      //     console.log('start scroll animation')
      //     this.isScrolling = true

      //     console.log(this.targetId)

      //     this.targetId =
      //         event.deltaY > 0
      //             ? (this.targetId + 1) % MAX
      //             : (this.targetId - 1 + MAX) % MAX

      //     this.gpgpu.swapTarget(this.targetId)

      //     clearTimeout(this.scrollTimeout)
      //     this.scrollTimeout = setTimeout(() => {
      //         this.isScrolling = false
      //     }, SCROLL_DURATION)
      // }
    })

    // add an appropriate event listener
    document.addEventListener('swap-target', (e) => {
      const { targetId } = e.detail
      this.targetId = targetId
      this.gpgpu.swapTarget(targetId)
    })
  }
}
