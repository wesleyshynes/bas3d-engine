import * as THREE from 'three'
import type { Updatable, InputState } from '../engine/types.ts'
import { AssetLoader } from '../engine/AssetLoader.ts'
import { AnimationController } from '../engine/animation/AnimationController.ts'
import { Physics, GROUND_Y, MAX_JUMP_HEIGHT } from '../engine/physics/Physics.ts'
import type { PhysicsBody } from '../engine/physics/Physics.ts'
import type { InputManager } from '../engine/input/InputManager.ts'

const MOVE_SPEED = 10
const ROTATION_SPEED = 10

export class Player implements Updatable, PhysicsBody {
  readonly mesh: THREE.Object3D
  private animation: AnimationController | null = null
  private physics = new Physics()
  private input: InputManager

  ySpeed = 0
  isJumping = false

  // Fallback cube (used until model loads)
  private cube: THREE.Mesh

  get position() { return this.mesh.position }

  constructor(scene: THREE.Scene, input: InputManager) {
    this.input = input

    // Create fallback cube
    const geo = new THREE.BoxGeometry()
    const mat = new THREE.MeshPhongMaterial({ color: 'rgb(255, 0, 0)' })
    this.cube = new THREE.Mesh(geo, mat)
    this.cube.castShadow = true
    this.cube.position.set(0, 1, 0)
    scene.add(this.cube)
    this.mesh = this.cube
  }

  async loadModel(scene: THREE.Scene, url: string) {
    const loader = new AssetLoader()
    const gltf = await loader.loadGLTF(url)
    const model = gltf.scene
    model.position.set(2, 0, 0)
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
      }
    })
    scene.add(model)

    // Replace mesh reference
    ;(this as { mesh: THREE.Object3D }).mesh = model

    // Hide fallback cube
    this.cube.visible = false

    // Setup animations
    this.animation = new AnimationController(model)
    const anims = gltf.animations
    this.animation.addClip('idle', anims[2])
    this.animation.addClip('jump', anims[3])
    this.animation.addClip('run', anims[6])
    this.animation.play('idle')

    return this.animation
  }

  update(dt: number) {
    const inputState = this.input.poll()
    this.handleMovement(dt, inputState)
    this.physics.applyJump(this, dt, inputState.jump)
    this.physics.applyGravity(this, dt)
    this.handleAnimation()

    // Spin the fallback cube
    if (this.cube.visible) {
      this.cube.rotation.y += 0.01
    }

    this.animation?.update(dt)
  }

  private handleMovement(dt: number, input: InputState) {
    const dir = { x: input.direction.x, z: input.direction.z }

    this.mesh.position.x += dir.x * MOVE_SPEED * dt
    this.mesh.position.z += dir.z * MOVE_SPEED * dt

    // Smooth rotation towards movement direction
    if (dir.x !== 0 || dir.z !== 0) {
      const targetAngle = Math.atan2(dir.x, dir.z)
      let angleDiff = targetAngle - this.mesh.rotation.y
      // wrap to [-PI, PI]
      angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
      this.mesh.rotation.y += angleDiff * Math.min(ROTATION_SPEED * dt, 1)
    }
  }

  private handleAnimation() {
    if (!this.animation) return

    const airborne = this.physics.isAirborne(this)
    const moving = this.input.state.direction.x !== 0 || this.input.state.direction.z !== 0

    if (airborne) {
      this.animation.play('jump')
    } else if (moving) {
      this.animation.play('run')
    } else {
      this.animation.play('idle')
    }

    // Manually control jump animation time based on height
    if (airborne) {
      const jumpDuration = this.animation.getClipDuration('jump')
      const heightNorm = Math.min(
        Math.max((this.mesh.position.y - GROUND_Y) / (MAX_JUMP_HEIGHT - GROUND_Y), 0),
        1
      )
      if (this.ySpeed > 0) {
        this.animation.setManualTime('jump', heightNorm * (jumpDuration / 2))
      } else {
        this.animation.setManualTime('jump', (1 - heightNorm) * (jumpDuration / 2) + (jumpDuration / 2))
      }
    } else {
      this.animation.setAutoPlay('jump')
    }
  }
}
