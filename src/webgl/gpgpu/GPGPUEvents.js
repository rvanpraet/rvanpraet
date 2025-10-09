import * as THREE from 'three'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'

export default class GPGPUEvents {
  constructor(mouse, camera, mesh, uniforms) {
    this.camera = camera
    this.mouse = mouse
    this.geometry = mesh.geometry
    this.uniforms = uniforms
    this.mesh = mesh

    // Mouse

    this.mouseSpeed = 0

    this.init()
  }

  init() {
    // Remember initial camera position
    // console.log(this.camera)
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
    window.addEventListener('wheel', (e) => {
      this.verticalDrift = Math.sign(e.deltaY)
    })
  }

  update() {
    if (!this.mouse.cursorPosition) return // Don't update if cursorPosition is undefined

    this.mouseSpeed *= 0.95
    this.verticalDrift *= 0.7
    this.entropy = window.entropy

    // Velocity uniform updates
    if (this.uniforms.velocityUniforms.uMouseSpeed) this.uniforms.velocityUniforms.uMouseSpeed.value = this.mouseSpeed
    if (this.uniforms.velocityUniforms.uEntropy) this.uniforms.velocityUniforms.uEntropy.value = this.entropy
    if (this.uniforms.velocityUniforms.uVerticalDrift) {
      this.uniforms.velocityUniforms.uVerticalDrift.value = this.verticalDrift || 0
    }

    // Position uniform updates
    if (this.uniforms.positionUniforms.uEntropy) this.uniforms.positionUniforms.uEntropy.value = this.entropy

    // On mouse move, gently nudge the camera
    const { x: mouseX, y: mouseY } = this.mouse.cursorPosition
    this.camera.position.x = mouseX * 0.02
    this.camera.position.y = mouseY * 0.02
  }

  updateRaycasterMesh(mesh) {
    // const isRaycasterPlane = true
    console.log('updateRaycasterMesh', mesh)
    const isRaycasterPlane = mesh.userData.hasPlaneRaycast
    this.geometry = isRaycasterPlane ? new THREE.PlaneGeometry(20, 20) : mesh.geometry

    this.geometry.boundsTree = new MeshBVH(this.geometry)
    this.raycasterMesh.clear()
    this.raycasterMesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({}))

    // isRaycasterPlane && this.raycasterMesh.translateZ(8.999)
  }
}
