import * as THREE from 'three'
import type { Updatable } from './types.ts'

export class ThirdPersonCamera implements Updatable {
  readonly camera: THREE.PerspectiveCamera
  private target: THREE.Object3D | null = null
  private offset: THREE.Vector3

  constructor(offset = new THREE.Vector3(0, 7, 9), fov = 75) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.offset = offset.clone()

    window.addEventListener('resize', this.onResize)
  }

  setTarget(target: THREE.Object3D) {
    this.target = target
  }

  update(_dt: number) {
    if (!this.target) return
    const pos = this.target.position.clone().add(this.offset)
    this.camera.position.copy(pos)
    this.camera.lookAt(this.target.position)
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    window.removeEventListener('resize', this.onResize)
  }
}
