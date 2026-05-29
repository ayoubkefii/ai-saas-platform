import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ChatBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.z = 50

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Neural network-style particle connections
    const particleCount = 300
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02

      const t = Math.random()
      colors[i * 3] = 0.545 + t * 0.1
      colors[i * 3 + 1] = 0.361 + t * 0.3
      colors[i * 3 + 2] = 0.965 - t * 0.2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.userData = { velocities }

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Connection lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    })

    const lineGeometry = new THREE.BufferGeometry()
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    // Floating message bubbles (3D spheres)
    const bubbles: THREE.Mesh[] = []
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.SphereGeometry(2 + Math.random() * 3, 32, 32)
      const material = new THREE.MeshBasicMaterial({
        color: [0x8b5cf6, 0x3b82f6, 0x06b6d4][Math.floor(Math.random() * 3)],
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
      })
      const bubble = new THREE.Mesh(geometry, material)
      bubble.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30
      )
      bubble.userData = {
        floatSpeed: Math.random() * 0.003 + 0.001,
        floatOffset: Math.random() * Math.PI * 2,
      }
      scene.add(bubble)
      bubbles.push(bubble)
    }

    let frameId: number
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.3
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.3
    }
    window.addEventListener('mousemove', handleMouseMove)

    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const pos = particles.geometry.attributes.position.array as Float32Array
      const vel = particles.geometry.userData.velocities as Float32Array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += vel[i * 3]
        pos[i * 3 + 1] += vel[i * 3 + 1]
        pos[i * 3 + 2] += vel[i * 3 + 2]

        if (Math.abs(pos[i * 3]) > 50) pos[i * 3] *= -0.9
        if (Math.abs(pos[i * 3 + 1]) > 50) pos[i * 3 + 1] *= -0.9
        if (Math.abs(pos[i * 3 + 2]) > 25) pos[i * 3 + 2] *= -0.9
      }
      particles.geometry.attributes.position.needsUpdate = true
      particles.rotation.y = elapsed * 0.005
      particles.rotation.x = Math.sin(elapsed * 0.3) * 0.05

      const linePositions: number[] = []
      const connectionDistance = 15
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < connectionDistance) {
            linePositions.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
            linePositions.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2])
          }
        }
      }
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

      bubbles.forEach((bubble) => {
        bubble.position.y += Math.sin(elapsed * bubble.userData.floatSpeed + bubble.userData.floatOffset) * 0.02
        bubble.position.x += Math.cos(elapsed * 0.2 + bubble.userData.floatOffset) * 0.01
      })

      camera.position.x += (mouseX * 10 - camera.position.x) * 0.03
      camera.position.y += (-mouseY * 10 - camera.position.y) * 0.03
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
