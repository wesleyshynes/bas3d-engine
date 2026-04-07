import * as THREE from 'three'

export class Level {
  static build(scene: THREE.Scene) {
    // 5x5 grid of alternating green/blue planes
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const x = j * 10
        const z = i * 10
        const planeGeo = new THREE.PlaneGeometry(10, 10)
        const planeMat = new THREE.MeshPhongMaterial({
          color: (i + j) % 2 === 0 ? 'rgb(0, 255, 0)' : 'rgb(0, 0, 255)',
          side: THREE.DoubleSide,
        })
        const plane = new THREE.Mesh(planeGeo, planeMat)
        plane.rotation.x = Math.PI / 2
        plane.position.set(x, 0, z)
        plane.receiveShadow = true
        scene.add(plane)

        // add point light above each plane showing a glowing effect
        const light = new THREE.PointLight('rgb(255, 255, 255)', 0.5, 15)
        light.position.set(x, 0, z)
        scene.add(light)

        // glowing sphere to visualize light position
        const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16)
        // const sphereMat = new THREE.MeshBasicMaterial({ color: 'rgb(255, 255, 255)' })
        // transparent material with emissive color for glow effect
        const sphereMat = new THREE.MeshPhongMaterial({
          color: 'rgb(255, 255, 255)',
          emissive: 'rgb(255, 255, 255)',
          emissiveIntensity: 1,
          transparent: true,
          opacity: 0.2,
        })
        const sphere = new THREE.Mesh(sphereGeo, sphereMat)
        sphere.position.set(x, 0, z)
        scene.add(sphere)

      }
    }

    // Point light with shadows
    const pointLight = new THREE.PointLight(0xffffff, 80, 1000)
    pointLight.position.set(10, 20, 10)
    pointLight.castShadow = true
    scene.add(pointLight)
  }
}
