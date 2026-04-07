import * as THREE from 'three'

export class Renderer {
  readonly renderer: THREE.WebGLRenderer
  readonly scene: THREE.Scene

  constructor(container: HTMLElement = document.body) {
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer({ })
    // this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)

    window.addEventListener('resize', this.onResize)
  }

  render(camera: THREE.Camera) {
    this.renderer.render(this.scene, camera)
  }

  private onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  dispose() {
    window.removeEventListener('resize', this.onResize)
    this.renderer.dispose()
  }
}
