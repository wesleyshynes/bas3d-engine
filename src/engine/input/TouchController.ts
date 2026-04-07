import nipplejs from 'nipplejs'
import type { InputState } from '../types.ts'
import type { KeyboardController } from './KeyboardController.ts'

export class TouchController {
  private joystickVector = { x: 0, y: 0 }
  private joystickManager: ReturnType<typeof nipplejs.create> | null = null
  private keyboard: KeyboardController

  constructor(
    joystickElement: HTMLElement,
    jumpButton: HTMLElement,
    keyboard: KeyboardController,
  ) {
    this.keyboard = keyboard
    this.joystickManager = nipplejs.create({
      zone: joystickElement,
      mode: 'static',
      catchDistance: 100,
      position: { left: '50%', top: '50%' },
      color: 'rgba(255, 255, 255, 0.5)',
    })

    this.joystickManager.on('move', (event) => {
      this.joystickVector = event.data.vector
    })
    this.joystickManager.on('end', () => {
      this.joystickVector = { x: 0, y: 0 }
    })

    // Jump button bindings — inject into keyboard so unified state picks it up
    let mouseDown = false

    jumpButton.addEventListener('mousedown', () => {
      this.keyboard.pressKey(' ')
    })
    jumpButton.addEventListener('mouseup', () => {
      this.keyboard.releaseKey(' ')
    })
    jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault()
      this.keyboard.pressKey(' ')
    })
    jumpButton.addEventListener('touchend', (e) => {
      e.preventDefault()
      this.keyboard.releaseKey(' ')
    })

    // Track global mouse state for drag-over jump button
    window.addEventListener('mousedown', () => { mouseDown = true })
    window.addEventListener('mouseup', () => { mouseDown = false })
    window.addEventListener('touchstart', () => { mouseDown = true })
    window.addEventListener('touchend', () => { mouseDown = false })
    jumpButton.addEventListener('mouseover', () => {
      if (mouseDown) this.keyboard.pressKey(' ')
    })
    jumpButton.addEventListener('mouseout', () => {
      this.keyboard.releaseKey(' ')
    })
  }

  getState(): InputState {
    return {
      direction: { x: this.joystickVector.x, z: -this.joystickVector.y },
      jump: false, // jump is handled through keyboard pressKey/releaseKey
    }
  }

  dispose() {
    this.joystickManager?.destroy()
    this.joystickManager = null
  }
}
