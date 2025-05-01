import * as THREE from 'three'

import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

export default class GPGPUUtils {
  constructor(mesh, size) {
    this.size = size

    this.number = this.size * this.size

    this.mesh = mesh

    this.sampler = new MeshSurfaceSampler(this.mesh).build()

    this.setupDataFromMesh()
    this.setupVelocitiesData()
  }

  /**
   *  Create compute position DataTexture from the initial provided mesh in the scene
   * */
  setupDataFromMesh() {
    const data = new Float32Array(4 * this.number)
    const positions = new Float32Array(3 * this.number)
    const uvs = new Float32Array(2 * this.number)

    this._position = new THREE.Vector3()

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j

        // Pick random point from Mesh

        this.sampler.sample(this._position)

        // Setup for DataTexture

        data[4 * index] = this._position.x
        data[4 * index + 1] = this._position.y
        data[4 * index + 2] = this._position.z

        // Setup positions attribute for geometry

        positions[3 * index] = this._position.x
        positions[3 * index + 1] = this._position.y
        positions[3 * index + 2] = this._position.z

        // Setup UV attribute for geometry

        uvs[2 * index] = j / (this.size - 1)
        uvs[2 * index + 1] = i / (this.size - 1)
      }
    }

    const positionTexture = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)

    positionTexture.needsUpdate = true

    this.positions = positions

    this.positionTexture = positionTexture

    this.uvs = uvs
  }

  /**
   * Create initial velocity data texture
   */
  setupVelocitiesData() {
    const data = new Float32Array(4 * this.number)

    data.fill(0)

    let velocityTexture = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)

    velocityTexture.needsUpdate = true

    this.velocityTexture = velocityTexture
  }

  /**
   * Creates surface sampled compute position DataTexture from the provided mesh
   * @param {THREE.Mesh} mesh
   * @returns {THREE.DataTexture} a data texture with surface sampled position coordinates
   */
  createTargetDataFromMesh(mesh) {
    const meshSampler = new MeshSurfaceSampler(mesh).build()
    const data = new Float32Array(4 * this.number)

    const samplerPos = new THREE.Vector3()

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j

        // Pick random point from Mesh

        meshSampler.sample(samplerPos)

        // Setup for DataTexture

        data[4 * index] = samplerPos.x
        data[4 * index + 1] = samplerPos.y
        data[4 * index + 2] = samplerPos.z
      }
    }

    const positionTexture = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)

    positionTexture.needsUpdate = true

    return positionTexture
  }

  /**
   * Creates a data texture with exactly the size of the textures in this simulation, used for unique transformations
   * @returns {THREE.DataTexture}
   */
  createRandomData() {
    const data = new Float32Array(4 * this.number)

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j

        // Setup random numbers on x, y, z and w
        data[4 * index] = Math.random()
        data[4 * index + 1] = Math.random()
        data[4 * index + 2] = Math.random()
        data[4 * index + 3] = Math.random()
      }
    }

    const dataTexture = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)

    dataTexture.needsUpdate = true

    return dataTexture
  }

  getPositions() {
    return this.positions
  }

  getUVs() {
    return this.uvs
  }

  getPositionTexture() {
    return this.positionTexture
  }

  getVelocityTexture() {
    return this.velocityTexture
  }
}
