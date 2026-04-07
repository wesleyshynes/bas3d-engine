import type { InputState } from '../types.ts'
import { KeyboardController } from './KeyboardController.ts'
import { TouchController } from './TouchController.ts'

export class InputManager {
  readonly keyboard: KeyboardController
  readonly touch: TouchController

  private current: InputState = { direction: { x: 0, z: 0 }, jump: false }

  constructor(joystickElement: HTMLElement, jumpButton: HTMLElement) {
    this.keyboard = new KeyboardController()
    this.touch = new TouchController(joystickElement, jumpButton, this.keyboard)
  }

  /** Call once per frame to refresh the unified input state */
  poll(): InputState {
    const kb = this.keyboard.getState()
    const touch = this.touch.getState()

    this.current = {
      direction: {
        x: kb.direction.x + touch.direction.x,
        z: kb.direction.z + touch.direction.z,
      },
      jump: kb.jump || touch.jump,
    }
    return this.current
  }

  /** Last polled state */
  get state(): InputState {
    return this.current
  }

  dispose() {
    this.keyboard.dispose()
    this.touch.dispose()
  }
}
