import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { MotionBloomPass } from './MotionBloomPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { Vector2 } from 'three'
import rgbShiftVertex from './shaders/rgbShiftVertex.glsl?raw'
import rgbShiftFragment from './shaders/rgbShiftFragment.glsl?raw'
import { ShaderPass } from 'three/examples/jsm/Addons.js'

export default class PostProcessing {
  static instance

  static getInstance(args) {
    if (!PostProcessing.instance) {
      PostProcessing.instance = new PostProcessing(args)
    }

    return PostProcessing.instance
  }

  constructor({ renderer, scene, camera, sizes, debug }) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.sizes = sizes
    this.debug = debug

    this.shiftAmount = 0.0 // Vertical drift for the RGB Shift effect

    this.params = {
      // Bloom pass
      threshold: 0.35,
      strength: 0.15,
      radius: 0.05,
      directionX: 0.1,
      directionY: 0.1,
      // After Image pass
      damp: 0.75,
      // RGB Shift pass
      amount: 0.0,
      angle: 0.0,
    }

    // Debug

    if (this.debug.active) this.debugFolder = this.debug.gui.addFolder('Post Processing')

    this.init()
  }

  init() {
    this.setupEffect()
    this.setupDebug()
    this.setupListeners()
  }

  setupEffect() {
    const renderScene = new RenderPass(this.scene, this.camera.target)

    this.bloomPass = new MotionBloomPass(new Vector2(this.sizes.width, this.sizes.height), 1.5, 0.4, 0.85)
    this.bloomPass.threshold = this.params.threshold
    this.bloomPass.strength = this.params.strength
    this.bloomPass.radius = this.params.radius

    this.afterImagePass = new AfterimagePass(this.params.damp)
    this.afterImagePass.uniforms.damp.value = this.params.damp

    this.rgbShiftPass = this.createRGBShiftPass()

    const outputPass = new OutputPass()

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderScene)
    // this.composer.addPass(this.afterImagePass)
    this.composer.addPass(this.bloomPass)
    this.composer.addPass(this.rgbShiftPass)
    this.composer.addPass(outputPass)
  }

  createRGBShiftPass() {
    const RGBShiftShader = {
      uniforms: {
        tDiffuse: { value: null },
        verticalDrift: { value: 0 },
        amount: { value: 0 },
        angle: { value: Math.PI / 4 }, // Default angle in radians
      },
      vertexShader: rgbShiftVertex,
      fragmentShader: rgbShiftFragment,
    }

    const rgbShiftPass = new ShaderPass(RGBShiftShader)
    rgbShiftPass.renderToScreen = true
    return rgbShiftPass
  }

  setupDebug() {
    if (this.debug.active) {
      // RGB Shift Pass Debug
      const rgbShiftFolder = this.debugFolder.addFolder('RGB Shift')
      rgbShiftFolder.add(this.params, 'amount', 0.0, 0.5, 0.001).onChange((value) => {
        this.rgbShiftPass.uniforms.amount.value = Number(value)
      })
      rgbShiftFolder.add(this.params, 'angle', 0.0, Math.PI * 2, Math.PI / 180).onChange((value) => {
        this.rgbShiftPass.uniforms.angle.value = Number(value)
      })

      // After Image Pass Debug
      const afterImageFolder = this.debugFolder.addFolder('After Image')
      afterImageFolder.add(this.params, 'damp', 0.0, 1.0).onChange((value) => {
        this.afterImagePass.uniforms.damp.value = Number(value)
      })

      // Bloom Pass Debug
      const bloomFolder = this.debugFolder.addFolder('bloom')

      bloomFolder.add(this.params, 'threshold', 0.0, 1.0).onChange((value) => {
        this.bloomPass.threshold = Number(value)
      })

      bloomFolder.add(this.params, 'strength', 0.0, 3.0).onChange((value) => {
        this.bloomPass.strength = Number(value)
      })

      bloomFolder
        .add(this.params, 'radius', 0.0, 1.0)
        .step(0.01)
        .onChange((value) => {
          this.bloomPass.radius = Number(value)
        })

      bloomFolder
        .add(this.params, 'directionX', 0.0, 10.0)
        .step(0.01)
        .onChange((value) => {
          this.bloomPass.BlurDirectionX.x = Number(value)
        })

      bloomFolder
        .add(this.params, 'directionY', 0.0, 10.0)
        .step(0.01)
        .onChange((value) => {
          this.bloomPass.BlurDirectionX.x = Number(value)
        })
    }
  }

  resize() {
    if (this.composer) {
      this.composer.setSize(this.sizes.width, this.sizes.height)
      this.composer.setPixelRatio(this.sizes.pixelRatio)
    }
  }

  update() {
    this.shiftAmount *= 0.975 // Dampen the vertical drift effect

    if (this.rgbShiftPass.uniforms.amount) {
      this.rgbShiftPass.uniforms.amount.value = this.shiftAmount
    }

    if (this.composer) this.composer.render()
  }

  dispose() {
    if (this.composer) this.composer.dispose()
  }

  setupListeners() {
    window.addEventListener('wheel', (e) => {
      // shift amount should be 0 whenever entropy is other than 0
      this.shiftAmount = Math.sign(e.deltaY) * (entropy > 0 ? 0 : 1)

      // this.shiftAmount = e.deltaY * 0.01 // Adjust the vertical drift based on scroll speed

      // this.rgbShiftPass.uniforms.amount.value = Math.abs(e.deltaY * 0.0002)
      // this.rgbShiftPass.uniforms.angle.value = this.rgbShiftPass.uniforms.angle.value * Math.sign(e.deltaY)
    })
  }
}
