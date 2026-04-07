export interface Updatable {
  update(dt: number): void
}

export interface InputState {
  direction: { x: number; z: number }
  jump: boolean
}
