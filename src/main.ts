import './style.css'
import { Game, Renderer, ThirdPersonCamera, InputManager, UIManager } from './engine/index.ts'
import { Player } from './game/Player.ts'
import { Level } from './game/Level.ts'

async function main() {
  const renderer = new Renderer()
  const camera = new ThirdPersonCamera()
  const input = new InputManager(
    document.getElementById('joystick')!,
    document.getElementById('jump-btn')!,
  )
  const ui = new UIManager()
  const game = new Game(renderer, camera)

  // Build level
  Level.build(renderer.scene)

  // Create player
  const player = new Player(renderer.scene, input)
  camera.setTarget(player.mesh)

  // Register updatables: player first (handles input + physics), then camera
  game.addUpdatable(player)
  game.addUpdatable(camera)

  // Load robot model (async — game can start with fallback cube)
  player.loadModel(renderer.scene, './public/glb/Animated_Robot.glb').then(() => {
    camera.setTarget(player.mesh)
  })

  // Wire UI
  ui.onStart(() => game.start())
  ui.onPause(() => game.pause())
  ui.onResume(() => game.resume())
  ui.showStartScreen()
}

main()