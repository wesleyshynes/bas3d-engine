import './style.css'
import * as THREE from 'three'
import nipplejs from 'nipplejs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <p>Booty</p>
`

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
camera.position.z = 0
camera.position.y = 2
camera.position.x = 0
// renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const planes = []
const planeLights = []
// simple grid of planes, for testing purposes alternate green and blue
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const x = j * 10
    const z = i * 10
    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshPhongMaterial({ color: (i + j) % 2 === 0 ? 'rgb(0, 255, 0)' : 'rgb(0, 0, 255)', side: THREE.DoubleSide })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = Math.PI / 2
    plane.position.set(x, 0, z)
    plane.receiveShadow = true
    scene.add(plane)
    planes.push(plane)

    // add a light above each plane
    // const light = new THREE.PointLight(0xffffff, 2, 100)
    // light.position.set(x + 2, 10, z + 2) // position the light above and to the side of the plane, so it casts interesting shadows
    // light.castShadow = true
    // scene.add(light)
    // planeLights.push(light)

  }
}

const pointLight = new THREE.PointLight(0xffffff, 100, 100)
pointLight.position.set(10, 20, 10)
pointLight.castShadow = true
// pointLight.shadow.mapSize.width = 1024
// pointLight.shadow.mapSize.height = 1024
// pointLight.shadow.camera.near = 0.5
// pointLight.shadow.camera.far = 100
scene.add(pointLight)

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
// ambientLight.castShadow = true
// ambientLight.position.set(0, 10, 0)
// scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
// directionalLight.position.set(10, 20, 10)
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.width = 1024
// directionalLight.shadow.mapSize.height = 1024
// directionalLight.shadow.camera.near = 0.5
// directionalLight.shadow.camera.far = 50
// directionalLight.shadow.camera.left = -20
// directionalLight.shadow.camera.right = 20
// directionalLight.shadow.camera.top = 20
// directionalLight.shadow.camera.bottom = -20
// scene.add(directionalLight)



// create a cube
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshPhongMaterial({ color: 'rgb(255, 0, 0)' })
const cube = new THREE.Mesh(geometry, material)
cube.castShadow = true
cube.position.x = 0
cube.position.y = 1
cube.position.z = 0
scene.add(cube)

camera.position.z = 5

const pressedKeys: Set<string> = new Set()

window.addEventListener('keydown', (event) => {
  pressedKeys.add(event.key)
})

window.addEventListener('keyup', (event) => {
  pressedKeys.delete(event.key)
})

// clear keys on blur, or tab change and stuff like that
window.addEventListener('blur', () => {
  pressedKeys.clear()
})
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    pressedKeys.clear()
  }
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const moveSpeed = 10
const jumpHeight = 3
const jumpAcceleration = 120
const fallSpeed = 70
let isJumping = false
let ySpeed = 0

const groundY = 0.5
const rotationSpeed = 10

let mouseDown = false
window.addEventListener('mousedown', () => {
  mouseDown = true
})
window.addEventListener('mouseup', () => {
  mouseDown = false
})
window.addEventListener('touchstart', () => {
  mouseDown = true
})
window.addEventListener('touchend', () => {
  mouseDown = false
})

const joystickDiv = document.getElementById('joystick') as HTMLDivElement
const joystick = nipplejs.create({
  zone: joystickDiv,
  // mode: 'semi',
  mode: 'static',
  catchDistance: 100,
  position: { left: '50%', top: '50%' },
  color: 'rgba(255, 255, 255, 0.5)',
})
let joystickVector = { x: 0, y: 0 }
joystick.on('move', (event) => {
  joystickVector = event.data.vector
})
joystick.on('end', () => {
  joystickVector = { x: 0, y: 0 }
})

const jumpButton = document.getElementById('jump-btn') as HTMLButtonElement
jumpButton.addEventListener('mousedown', () => {
  pressedKeys.add(' ')
})
jumpButton.addEventListener('mouseup', () => {
  pressedKeys.delete(' ')
})
jumpButton.addEventListener('touchstart', (e) => {
  e.preventDefault()
  pressedKeys.add(' ')
})
jumpButton.addEventListener('touchend', (e) => {
  e.preventDefault()
  pressedKeys.delete(' ')
})
jumpButton.addEventListener('mouseover', () => {
  if (mouseDown) {
    pressedKeys.add(' ')
  }
})
jumpButton.addEventListener('mouseout', () => {
  pressedKeys.delete(' ')
})


function handleInput(deltaTime: number) {

  const movingBody = robotGltf ? robotGltf : cube
  // const movingBody = cube

  let moving = false
  const moveDir = { x: 0, z: 0 }

  if (pressedKeys.has('w') || pressedKeys.has('W') || pressedKeys.has('ArrowUp')) {
    movingBody.position.z -= moveSpeed * deltaTime
    moveDir.z -= 1
    moving = true
  }
  if (pressedKeys.has('s') || pressedKeys.has('S') || pressedKeys.has('ArrowDown')) {
    movingBody.position.z += moveSpeed * deltaTime
    moveDir.z += 1
    moving = true
  }
  if (pressedKeys.has('a') || pressedKeys.has('A') || pressedKeys.has('ArrowLeft')) {
    movingBody.position.x -= moveSpeed * deltaTime
    moveDir.x -= 1
    moving = true
  }
  if (pressedKeys.has('d') || pressedKeys.has('D') || pressedKeys.has('ArrowRight')) {
    movingBody.position.x += moveSpeed * deltaTime
    moveDir.x += 1
    moving = true
  }

  // joystick input
  if (joystickVector.x !== 0 || joystickVector.y !== 0) {
    moving = true
  }
  moveDir.x += joystickVector.x
  moveDir.z -= joystickVector.y
  movingBody.position.x += joystickVector.x * moveSpeed * deltaTime
  movingBody.position.z -= joystickVector.y * moveSpeed * deltaTime

  // smooth rotation towards movement direction
  if (moveDir.x !== 0 || moveDir.z !== 0) {
    const targetAngle = Math.atan2(moveDir.x, moveDir.z)
    let angleDiff = targetAngle - movingBody.rotation.y
    // wrap to [-PI, PI]
    angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
    movingBody.rotation.y += angleDiff * Math.min(rotationSpeed * deltaTime, 1)
  }

  // jumping
  if ((pressedKeys.has(' ') || pressedKeys.has('Space')) && movingBody.position.y <= groundY) {
    ySpeed = jumpAcceleration * deltaTime
    movingBody.position.y += ySpeed * deltaTime
    isJumping = true
  } else if (isJumping && movingBody.position.y < jumpHeight && (pressedKeys.has(' ') || pressedKeys.has('Space'))) {
    ySpeed += jumpAcceleration * deltaTime
    movingBody.position.y += ySpeed * deltaTime
    if (movingBody.position.y >= jumpHeight) {
      isJumping = false
    }
  } else if (isJumping) {
    isJumping = false
  }

  // gravity
  if (movingBody.position.y > groundY && !isJumping) {
    ySpeed -= fallSpeed * deltaTime
    movingBody.position.y += ySpeed * deltaTime // Adjust gravity strength as needed
  }

  // prevent falling through the plane
  if (movingBody.position.y < groundY) {
    movingBody.position.y = groundY
    isJumping = false
    ySpeed = 0
  }

  const isAirborne = movingBody.position.y > groundY + 0.01

  if (mixer) {
    let nextClip: THREE.AnimationClip
    if (isAirborne) {
      nextClip = robotAnimations[3] // jump animation
    } else if (moving) {
      nextClip = robotAnimations[6] // running animation
    } else {
      nextClip = robotAnimations[2] // idle animation
    }

    const nextAction = mixer.clipAction(nextClip)
    if (currentAction !== nextAction) {
      nextAction.reset()
      nextAction.play()
      if (currentAction) {
        currentAction.crossFadeTo(nextAction, crossFadeDuration, false)
      }
      currentAction = nextAction
    }

    // Manually control jump animation time based on height
    const jumpAction = mixer.clipAction(robotAnimations[3])
    if (isAirborne) {
      const jumpDuration = robotAnimations[3].duration
      const heightNorm = Math.min(Math.max((movingBody.position.y - groundY) / (jumpHeight - groundY), 0), 1)

      if (ySpeed > 0) {
        // Going up: first half of animation
        jumpAction.time = heightNorm * (jumpDuration / 2)
      } else {
        // Coming down: second half of animation
        jumpAction.time = (1 - heightNorm) * (jumpDuration / 2) + (jumpDuration / 2)
      }
      jumpAction.timeScale = 0 // prevent mixer from auto-advancing
    } else {
      jumpAction.timeScale = 1
    }
  }
}

function lookAtPlayer() {
  const movingBody = robotGltf ? robotGltf : cube
  camera.lookAt(movingBody.position)
}

function positionCameraBehindPlayer() {
  const movingBody = robotGltf ? robotGltf : cube
  const offset = new THREE.Vector3(0, 7, 9) // Adjust the offset as needed
  const cameraPosition = movingBody.position.clone().add(offset)
  camera.position.copy(cameraPosition)
}

let deltaTime = 0
let lastFrameTime = performance.now()

let mixer: THREE.AnimationMixer
let robotGltf: THREE.Group
let robotAnimations: THREE.AnimationClip[]
let currentAction: THREE.AnimationAction | null = null
const crossFadeDuration = 0.2

function animate() {
  const currentFrameTime = performance.now()
  deltaTime = (currentFrameTime - lastFrameTime) / 1000
  lastFrameTime = currentFrameTime

  handleInput(deltaTime)
  positionCameraBehindPlayer()
  lookAtPlayer()
  // cube.rotation.x += 0.01
  cube.rotation.y += 0.01


  if (mixer) {
    mixer.update(deltaTime)
  }


  renderer.render(scene, camera)
}

function gameLoop() {
  animate()
  requestAnimationFrame(gameLoop)
}

async function startGame() {

  // load glb model Animated_Robot.glb and add it to the scene, position it at x: 2, y: 0, z: 0
  const loader = new GLTFLoader()

  await new Promise((resolve, reject) => {
    loader.load('./public/glb/Animated_Robot.glb', (gltf) => {
      robotGltf = gltf.scene
      const model = gltf.scene
      model.position.set(2, 0, 0)
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true
        }
      })
      scene.add(model)
      mixer = new THREE.AnimationMixer(model)
      // idle is 2
      // jumping is 3
      // running is 6
      robotAnimations = gltf.animations
      console.log('Loaded model with animations:', robotAnimations)
      const action = mixer.clipAction(robotAnimations[2])
      action.play()
      currentAction = action
      resolve(model)
    }, undefined, (error) => {
      console.error('Error loading model:', error)
      reject(error)
    })
  })



  gameLoop()
}

startGame()