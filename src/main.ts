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

// create a plane
// const planeGeometry = new THREE.PlaneGeometry(10, 10)
// const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgba(0, 255, 0, 0.5)', side: THREE.DoubleSide })
// // const planeMaterial = new THREE.MeshBasicMaterial({ color: 'rgba(0, 255, 0, 0.5)', side: THREE.DoubleSide })
// const plane = new THREE.Mesh(planeGeometry, planeMaterial)
// plane.rotation.x = Math.PI / 2
// plane.position.y = 0
// plane.receiveShadow = true
// scene.add(plane)
// const planesHelper = new THREE.GridHelper(10, 10)
// scene.add(planesHelper)

const planes = []
const planeLights = []
// simple grid of planes, for testing purposes alternate green and blue
for (let i = 0; i < 12; i++) {
  const x = (i % 4) * 10 - 5
  const z = Math.floor(i / 4) * 10 - 5
  const planeGeometry = new THREE.PlaneGeometry(10, 10)
  const planeMaterial = new THREE.MeshPhongMaterial({ color: i % 2 === 0 ? 'rgb(0, 255, 0)' : 'rgb(0, 0, 255)', side: THREE.DoubleSide })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = Math.PI / 2
  plane.position.set(x, 0, z)
  plane.receiveShadow = true
  scene.add(plane)
  planes.push(plane)

  // add a light above each plane
  const light = new THREE.PointLight(0xffffff, 1, 100)
  // const light = new THREE.PointLight(0xffffff, 0.5, 100)
  // directional light
  // const light = new THREE.DirectionalLight(0xffffff, 0.5)
  light.position.set(x + 2, 3, z + 2) // position the light above and to the side of the plane, so it casts interesting shadows
  // point light downwards
  light.castShadow = true
  // light.target.position.set(x, 0, z)
  const helper = new THREE.PointLightHelper(light)
  // const helper = new THREE.DirectionalLightHelper(light)
  scene.add(helper)
  scene.add(light)
  planeLights.push(light)
}

// create a cube
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshPhongMaterial({ color: 'rgb(255, 0, 0)' })
const cube = new THREE.Mesh(geometry, material)
cube.castShadow = true
cube.position.x = 0
cube.position.y = 1
cube.position.z = 0
scene.add(cube)

// add lighting
// const light = new THREE.PointLight(0xffffff, 1, 100)
// light.position.set(0, 3, 0)
// light.castShadow = true
// // debug helper
// const helper = new THREE.PointLightHelper(light)
// scene.add(helper)
// scene.add(light)

// const lights = []
// for (let i = 0; i < 4; i++) {
//   const angle = (i / 4) * Math.PI * 2
//   const x = Math.cos(angle) * 5
//   const z = Math.sin(angle) * 5
//   const light = new THREE.PointLight(0xffffff, 0.5, 100)
//   light.position.set(x, 3, z)
//   light.castShadow = true
//   const helper = new THREE.PointLightHelper(light)
//   scene.add(helper)
//   scene.add(light)
//   lights.push(light)
// }

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

  if (pressedKeys.has('w') || pressedKeys.has('W') || pressedKeys.has('ArrowUp')) {
    movingBody.position.z -= moveSpeed * deltaTime
    moving = true
  }
  if (pressedKeys.has('s') || pressedKeys.has('S') || pressedKeys.has('ArrowDown')) {
    movingBody.position.z += moveSpeed * deltaTime
    moving = true
  }
  if (pressedKeys.has('a') || pressedKeys.has('A') || pressedKeys.has('ArrowLeft')) {
    movingBody.position.x -= moveSpeed * deltaTime
    moving = true
  }
  if (pressedKeys.has('d') || pressedKeys.has('D') || pressedKeys.has('ArrowRight')) {
    movingBody.position.x += moveSpeed * deltaTime
    moving = true
  }

  // joystick input
  if (joystickVector.x !== 0 || joystickVector.y !== 0) {
    moving = true
  }
  movingBody.position.x += joystickVector.x * moveSpeed * deltaTime
  movingBody.position.z -= joystickVector.y * moveSpeed * deltaTime

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

  if (mixer) {
    const nextClip = moving ? robotAnimations[6] : robotAnimations[2]
    const nextAction = mixer.clipAction(nextClip)
    if (currentAction !== nextAction) {
      nextAction.reset()
      nextAction.play()
      if (currentAction) {
        currentAction.crossFadeTo(nextAction, crossFadeDuration, false)
      }
      currentAction = nextAction
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