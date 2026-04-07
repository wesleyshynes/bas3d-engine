import type { InputState } from '../types.ts'

export class KeyboardController {
  private pressedKeys = new Set<string>()

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
    window.addEventListener('visibilitychange', this.onVisibility)
  }

  getState(): InputState {
    const dir = { x: 0, z: 0 }

    if (this.pressedKeys.has('w') || this.pressedKeys.has('W') || this.pressedKeys.has('ArrowUp')) {
      dir.z -= 1
    }
    if (this.pressedKeys.has('s') || this.pressedKeys.has('S') || this.pressedKeys.has('ArrowDown')) {
      dir.z += 1
    }
    if (this.pressedKeys.has('a') || this.pressedKeys.has('A') || this.pressedKeys.has('ArrowLeft')) {
      dir.x -= 1
    }
    if (this.pressedKeys.has('d') || this.pressedKeys.has('D') || this.pressedKeys.has('ArrowRight')) {
      dir.x += 1
    }

    // Normalize diagonal movement
    if (dir.x !== 0 && dir.z !== 0) {
      const length = Math.sqrt(dir.x * dir.x + dir.z * dir.z)
      dir.x /= length
      dir.z /= length
    }

    const jump = this.pressedKeys.has(' ') || this.pressedKeys.has('Space')

    return { direction: dir, jump }
  }

  /** Programmatically press a key (used by touch jump button, etc.) */
  pressKey(key: string) {
    this.pressedKeys.add(key)
  }

  releaseKey(key: string) {
    this.pressedKeys.delete(key)
  }

  private onKeyDown = (e: KeyboardEvent) => { this.pressedKeys.add(e.key) }
  private onKeyUp = (e: KeyboardEvent) => { this.pressedKeys.delete(e.key) }
  private onBlur = () => { this.pressedKeys.clear() }
  private onVisibility = () => {
    if (document.visibilityState === 'hidden') this.pressedKeys.clear()
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
    window.removeEventListener('visibilitychange', this.onVisibility)
  }
}
