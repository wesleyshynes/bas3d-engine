import * as THREE from 'three'
import type { Updatable } from '../types.ts'

export class AnimationController implements Updatable {
  private mixer: THREE.AnimationMixer
  private actions = new Map<string, THREE.AnimationAction>()
  private currentAction: THREE.AnimationAction | null = null
  private crossFadeDuration: number

  constructor(model: THREE.Object3D, crossFadeDuration = 0.2) {
    this.mixer = new THREE.AnimationMixer(model)
    this.crossFadeDuration = crossFadeDuration
  }

  addClip(name: string, clip: THREE.AnimationClip) {
    const action = this.mixer.clipAction(clip)
    this.actions.set(name, action)
  }

  play(name: string) {
    const next = this.actions.get(name)
    if (!next || next === this.currentAction) return

    next.reset()
    next.play()
    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, this.crossFadeDuration, false)
    }
    this.currentAction = next
  }

  /** Set manual time on a named clip (e.g. for jump animation synced to height) */
  setManualTime(name: string, time: number) {
    const action = this.actions.get(name)
    if (!action) return
    action.time = time
    action.timeScale = 0
  }

  /** Re-enable auto-advance on a named clip */
  setAutoPlay(name: string) {
    const action = this.actions.get(name)
    if (!action) return
    action.timeScale = 1
  }

  getClipDuration(name: string): number {
    const action = this.actions.get(name)
    return action?.getClip().duration ?? 0
  }

  update(dt: number) {
    this.mixer.update(dt)
  }
}
