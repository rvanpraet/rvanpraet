import * as THREE from 'three'
import GPGPUUtils from './GPGPUUtils.js'
import GPGPUEvents from './GPGPUEvents.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import simFragment from './shaders/simFragment.glsl?raw'
import simFragmentVelocity from './shaders/simFragmentVelocity.glsl?raw'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'
import { getCurrentBreakpoint, isSM } from '@/scripts/utils/breakpoints.js'

const noiseMultiplierMap = {
  xs: 0.05,
  sm: 0.15,
  md: 0.5,
  lg: 1.0,
  xl: 1.0,
  xxl: 1.0,
  xxxl: 1.0,
}

/**
 * GPGPU (General-Purpose computing on Graphics Processing Units)
 * GPGPU allows us to simulate a large number of particles using the GPU, using a compute shader and swapping textures
 * It is used to create a particle system that can be attracted to different targets in the scene
 *
 * @param {Object} options - Configuration options for the GPGPU system.
 */
export default class GPGPU {
  constructor({ size, camera, renderer, mouse, scene, model, sizes, debug, targets, params, particleMask }) {
    this.camera = camera // Camera
    this.renderer = renderer // Renderer
    this.mouse = mouse // Mouse, our cursor position
    this.scene = scene // Global scene
    this.sizes = sizes // Sizes of the scene, canvas, pixel ratio
    this.size = size // Amount of GPGPU particles
    this.model = model // Mesh from which we will sample the particles
    this.debug = debug // Debug
    this.params = params // Parameters for the GPGPU
    this.targets = targets // Different attraction targets
    this.particleMask = particleMask // Particle mask

    this.init()
  }

  init() {
    this.utils = new GPGPUUtils(this.model, this.size) // Setup GPGPUUtils

    this.initGPGPU()
    this.createTargets()
    this.createParticles()

    this.events = new GPGPUEvents(this.mouse, this.camera, this.model, this.uniforms, this.materialUniforms)
  }

  // The GPUComputationRenderer allows us to create multiple shaders and have these influence each other
  // During the computation, we can swap textures and update the particles' positions and velocities
  initGPGPU() {
    this.gpgpuCompute = new GPUComputationRenderer(this.sizes.width, this.sizes.width, this.renderer)

    const positionTexture = this.utils.getPositionTexture()
    const velocityTexture = this.utils.getVelocityTexture()
    const randomInfoTexture = this.utils.createRandomData()

    // Store the random info texture for use as random starting positions
    this.randomInfoTexture = randomInfoTexture

    // Create simulation variables

    this.positionVariable = this.gpgpuCompute.addVariable('uCurrentPosition', simFragment, positionTexture)
    this.velocityVariable = this.gpgpuCompute.addVariable('uCurrentVelocity', simFragmentVelocity, velocityTexture)

    this.gpgpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable])
    this.gpgpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable])

    this.uniforms = {
      positionUniforms: this.positionVariable.material.uniforms,
      velocityUniforms: this.velocityVariable.material.uniforms,
    }

    // Position uniforms
    this.uniforms.positionUniforms.uEntropy = { value: 0 }
    this.uniforms.positionUniforms.uTime = { value: 0 }
    this.uniforms.positionUniforms.uInfo = { value: randomInfoTexture }

    // Velocity uniforms
    this.uniforms.velocityUniforms.uOriginalPosition = {
      value: positionTexture,
    } // Original position texture
    this.uniforms.velocityUniforms.uEntropy = { value: 0 } // Entropy value for moving shape
    this.uniforms.velocityUniforms.uWaveform = { value: 0 } // Waveform value for moving shape
    this.uniforms.velocityUniforms.uInfo = { value: randomInfoTexture } // Random info texture for particles
    this.uniforms.velocityUniforms.uMouse = {
      value: { x: 0.0, y: 0.0, z: 0.0 },
    } // Mouse position in world space
    this.uniforms.velocityUniforms.uMouseSpeed = { value: 0 } // Mouse speed, set by GPGPUEvents
    this.uniforms.velocityUniforms.uVerticalDrift = { value: 0 } // Vertical drift for particles when scrolling
    this.uniforms.velocityUniforms.uTime = { value: 0 } // Time uniform for animation
    this.uniforms.velocityUniforms.uForce = { value: this.params.force } // Force applied to particles
    this.uniforms.velocityUniforms.uTarget = {
      value: null,
    } // Target position for particles to attract to
    // this.uniforms.velocityUniforms.uResponsiveMultiplier = { value: 0.0 } // Responsive multiplier for mobile devices
    this.uniforms.velocityUniforms.uCodingMultiplier = { value: 1.0 } // Responsive multiplier for mobile devices
    this.uniforms.velocityUniforms.uResponsiveMultiplier = { value: noiseMultiplierMap[getCurrentBreakpoint()] } // Responsive multiplier for mobile devices

    // Set wrapping mode for the textures
    this.gpgpuCompute.init()
  }

  // Create target coordinates from the meshes
  // This will be used to attract the particles towards the target meshes
  createTargets() {
    this.targetsPositions = [
      this.utils.positionTexture,
      ...this.targets.map((mesh) => {
        return this.utils.createTargetDataFromMesh(mesh)
      }),
    ]

    // Set initial target to the first target
    this.uniforms.velocityUniforms.uTarget.value = this.targetsPositions[0]
  }

  // Create particles using a ShaderMaterial
  // The particles will be rendered as points in the scene
  createParticles() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPositionTexture: {
          value: this.gpgpuCompute.getCurrentRenderTarget(this.positionVariable).texture,
        },
        uVelocityTexture: {
          value: this.gpgpuCompute.getCurrentRenderTarget(this.velocityVariable).texture,
        },
        uResolution: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height),
        },
        uMask: { value: this.particleMask },
        uParticleSize: { value: this.params.size },
        uColor: { value: this.params.color },
        uMinAlpha: { value: this.params.minAlpha },
        uMaxAlpha: { value: this.params.maxAlpha },
        uInfo: { value: this.uniforms.positionUniforms.uInfo.value },
        uTime: { value: 0 },
        uResponsiveMultiplier: { value: noiseMultiplierMap[getCurrentBreakpoint()] },
        uCodingMultiplier: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })

    // Setup Particles Geometry

    const geometry = new THREE.BufferGeometry()

    // Get positions, uvs data for geometry attributes

    const positions = this.utils.getPositions()
    const uvs = this.utils.getUVs()

    // Set geometry attributes

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    // Setup Points

    this.materialUniforms = this.material.uniforms

    // this.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    this.mesh = new THREE.Points(geometry, this.material)
    this.scene.add(this.mesh)
  }

  compute(state) {
    this.gpgpuCompute.compute()
    this.events.update(state)
    this.uniforms.velocityUniforms.uTime.value = state.time
    this.uniforms.positionUniforms.uTime.value = state.time
    // this.material.uniforms.uTime.value = state.time
  }

  swapTarget(targetIndex) {
    this.uniforms.velocityUniforms.uTarget.value = this.targetsPositions[targetIndex + 1] // +1 because the first texture is the random one
    this.events.updateRaycasterMesh(this.targets[targetIndex]) // Update raycaster mesh to the new target
  }
}
