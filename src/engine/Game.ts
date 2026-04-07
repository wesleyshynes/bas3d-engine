import type { Updatable } from './types.ts'
import type { Renderer } from './Renderer.ts'
import type { ThirdPersonCamera } from './Camera.ts'

export class Game {
  private updatables: Updatable[] = []
  private animationFrameId: number | null = null
  private lastFrameTime = 0
  private _isRunning = false
  private _isPaused = false
  private renderer: Renderer
  private camera: ThirdPersonCamera

  constructor(renderer: Renderer, camera: ThirdPersonCamera) {
    this.renderer = renderer
    this.camera = camera
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    window.addEventListener('blur', this.onBlur)
  }

  get isRunning() { return this._isRunning }
  get isPaused() { return this._isPaused }

  addUpdatable(u: Updatable) {
    this.updatables.push(u)
  }

  removeUpdatable(u: Updatable) {
    const idx = this.updatables.indexOf(u)
    if (idx !== -1) this.updatables.splice(idx, 1)
  }

  start() {
    if (this._isRunning) return
    this._isRunning = true
    this._isPaused = false
    this.lastFrameTime = performance.now()
    this.loop()
  }

  pause() {
    this._isPaused = true
  }

  resume() {
    if (!this._isRunning || !this._isPaused) return
    this._isPaused = false
    this.lastFrameTime = performance.now()
  }

  stop() {
    this._isRunning = false
    this._isPaused = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  private loop = () => {
    if (!this._isRunning) return
    this.animationFrameId = requestAnimationFrame(this.loop)

    if (this._isPaused) return

    const now = performance.now()
    const dt = (now - this.lastFrameTime) / 1000
    this.lastFrameTime = now

    for (const u of this.updatables) {
      u.update(dt)
    }

    this.renderer.render(this.camera.camera)
  }

  dispose() {
    this.stop()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    window.removeEventListener('blur', this.onBlur)
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.pause()
    }
  }

  private onBlur = () => {
    this.pause()
  }
}
