export const GROUND_Y = 0.5
export const JUMP_ACCELERATION = 120
export const MAX_JUMP_HEIGHT = 3
export const FALL_SPEED = 70

export interface PhysicsBody {
  position: { y: number }
  ySpeed: number
  isJumping: boolean
}

export class Physics {
  applyJump(body: PhysicsBody, dt: number, jumpPressed: boolean) {
    if (jumpPressed && body.position.y <= GROUND_Y) {
      body.ySpeed = JUMP_ACCELERATION * dt
      body.position.y += body.ySpeed * dt
      body.isJumping = true
    } else if (body.isJumping && body.position.y < MAX_JUMP_HEIGHT && jumpPressed) {
      body.ySpeed += JUMP_ACCELERATION * dt
      body.position.y += body.ySpeed * dt
      if (body.position.y >= MAX_JUMP_HEIGHT) {
        body.isJumping = false
      }
    } else if (body.isJumping) {
      body.isJumping = false
    }
  }

  applyGravity(body: PhysicsBody, dt: number) {
    if (body.position.y > GROUND_Y && !body.isJumping) {
      body.ySpeed -= FALL_SPEED * dt
      body.position.y += body.ySpeed * dt
    }

    // prevent falling through ground
    if (body.position.y < GROUND_Y) {
      body.position.y = GROUND_Y
      body.isJumping = false
      body.ySpeed = 0
    }
  }

  isAirborne(body: PhysicsBody): boolean {
    return body.position.y > GROUND_Y + 0.01
  }
}
