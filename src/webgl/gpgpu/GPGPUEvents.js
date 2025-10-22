import { isTouchDevice } from '@/scripts/utils/device'
import * as THREE from 'three'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'
import { damp } from 'three/src/math/MathUtils.js'

export default class GPGPUEvents {
  constructor(mouse, camera, mesh, uniforms, materialUniforms) {
    this.camera = camera
    this.mouse = mouse
    this.geometry = mesh.geometry
    this.uniforms = uniforms
    this.mesh = mesh
    this.materialUniforms = materialUniforms

    // Mouse

    this.mouseSpeed = 0

    this.init()
  }

  init() {
    // Remember initial camera position
    this.initialCameraPosition = this.camera.position

    this.setupMouse()
    this.setupScroll()
  }

  setupEntropy() {
    this.entropy = window.entropy
  }

  setupMouse() {
    const geometry = new THREE.PlaneGeometry(20, 20)

    THREE.Mesh.prototype.raycast = acceleratedRaycast

    geometry.boundsTree = new MeshBVH(geometry)
    this.geometry.boundsTree = new MeshBVH(this.geometry)

    this.raycaster = new THREE.Raycaster()
    this.raycaster.firstHitOnly = true
    this.raycasterMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial())

    this.mouse.on('mousemove', (cursorPosition) => {
      // On mouse move, do raycasting to get a position that can relate to the 3D world
      this.raycaster.setFromCamera(cursorPosition, this.camera)

      const intersects = this.raycaster.intersectObjects([this.raycasterMesh])

      if (intersects.length > 0) {
        const worldPoint = intersects[0].point.clone()

        this.mouseSpeed = 1

        this.uniforms.velocityUniforms.uMouse.value = worldPoint
      }
    })
  }

  setupScroll() {
    this.verticalDrift = 0
    this.scrollDrift = 0 // Used for desktop scroll

    window.addEventListener('wheel', (e) => {
      this.scrollDrift = Math.sign(e.deltaY)
    })
  }

  update(state) {
    if (!this.mouse.cursorPosition) return // Don't update if cursorPosition is undefined

    this.verticalDrift = isTouchDevice() ? window.scrollVelocity * 0.075 : this.scrollDrift

    // Velocity uniform updates
    if (this.uniforms.velocityUniforms.uMouseSpeed) this.uniforms.velocityUniforms.uMouseSpeed.value = this.mouseSpeed
    if (this.uniforms.velocityUniforms.uForce) this.uniforms.velocityUniforms.uForce.value = window.particleForce
    if (this.uniforms.velocityUniforms.uEntropy) this.uniforms.velocityUniforms.uEntropy.value = window.entropy
    if (this.uniforms.velocityUniforms.uWaveform) this.uniforms.velocityUniforms.uWaveform.value = window.waveform
    if (this.uniforms.velocityUniforms.uCodingMultiplier)
      this.uniforms.velocityUniforms.uCodingMultiplier.value = window.codingMult
    if (this.uniforms.velocityUniforms.uVerticalDrift) {
      this.uniforms.velocityUniforms.uVerticalDrift.value = this.verticalDrift || 0
    }

    // Position uniform updates
    if (this.uniforms.positionUniforms.uEntropy) this.uniforms.positionUniforms.uEntropy.value = window.entropy

    // Material uniform updates
    if (this.materialUniforms?.uCodingMultiplier) this.materialUniforms.uCodingMultiplier.value = window.codingMult

    // On mouse move, gently nudge the camera
    const { x: mouseX, y: mouseY } = this.mouse.cursorPosition
    this.camera.position.x = damp(this.camera.position.x, -mouseX * 0.05, 0.5, state.delta)
    this.camera.position.y = damp(this.camera.position.y, -mouseY * 0.05, 0.5, state.delta)

    this.mouseSpeed *= 0.95
    this.scrollDrift *= 0.4
  }

  updateRaycasterMesh(mesh) {
    const isRaycasterPlane = mesh.userData.hasPlaneRaycast
    this.geometry = isRaycasterPlane ? new THREE.PlaneGeometry(20, 20) : mesh.geometry

    this.geometry.boundsTree = new MeshBVH(this.geometry)
    this.raycasterMesh.clear()
    this.raycasterMesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({}))

    // isRaycasterPlane && this.raycasterMesh.translateZ(8.999)
  }
}
