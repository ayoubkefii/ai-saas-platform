import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.z = 35

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Advanced particle system with multiple layers
    const particleSystems: THREE.Points[] = []
    const particleConfigs = [
      { count: 2000, color: 0x8b5cf6, size: 0.12, opacity: 0.6, speed: 0.015 },
      { count: 1500, color: 0x3b82f6, size: 0.1, opacity: 0.4, speed: 0.02 },
      { count: 1000, color: 0x06b6d4, size: 0.08, opacity: 0.3, speed: 0.025 },
    ]

    particleConfigs.forEach(({ count, color, size, opacity, speed }) => {
      const positions = new Float32Array(count * 3)
      const velocities = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 120
        positions[i * 3 + 1] = (Math.random() - 0.5) * 120
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80
        velocities[i * 3] = (Math.random() - 0.5) * speed
        velocities[i * 3 + 1] = (Math.random() - 0.5) * speed
        velocities[i * 3 + 2] = (Math.random() - 0.5) * speed
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.userData = { velocities }
      const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity, blending: THREE.AdditiveBlending })
      const points = new THREE.Points(geometry, material)
      scene.add(points)
      particleSystems.push(points)
    })

    // Floating geometric shapes with glow effect
    const shapes: THREE.Mesh[] = []
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.OctahedronGeometry(0.8, 1),
      new THREE.TetrahedronGeometry(1, 1),
      new THREE.TorusGeometry(0.6, 0.2, 8, 16),
    ]

    for (let i = 0; i < 25; i++) {
      const geo = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)]
      const material = new THREE.MeshBasicMaterial({
        color: [0x8b5cf6, 0x3b82f6, 0x06b6d4, 0x10b981][Math.floor(Math.random() * 4)],
        wireframe: true,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.15,
      })
      const mesh = new THREE.Mesh(geo, material)
      mesh.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 50
      )
      const scale = Math.random() * 3 + 0.5
      mesh.scale.set(scale, scale, scale)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      mesh.userData = {
        rotSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01, z: (Math.random() - 0.5) * 0.01 },
        floatSpeed: Math.random() * 0.005 + 0.002,
        floatOffset: Math.random() * Math.PI * 2,
      }
      scene.add(mesh)
      shapes.push(mesh)
    }

    // Glowing orbs with pulse effect
    const orbs: THREE.Mesh[] = []
    const orbData = [
      { color: 0x7c3aed, x: -20, y: 10, z: -15, radius: 6, pulseSpeed: 0.8 },
      { color: 0x2563eb, x: 20, y: -8, z: -20, radius: 5, pulseSpeed: 1.0 },
      { color: 0x0891b2, x: 8, y: 15, z: -25, radius: 4, pulseSpeed: 1.2 },
      { color: 0x10b981, x: -12, y: -12, z: -18, radius: 3.5, pulseSpeed: 0.9 },
    ]

    orbData.forEach(({ color, x, y, z, radius, pulseSpeed }) => {
      const geometry = new THREE.SphereGeometry(radius, 64, 64)
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
      })
      const orb = new THREE.Mesh(geometry, material)
      orb.position.set(x, y, z)
      orb.userData = { pulseSpeed, baseRadius: radius }
      scene.add(orb)
      orbs.push(orb)

      // Add glow ring around each orb
      const ringGeo = new THREE.RingGeometry(radius * 1.2, radius * 1.4, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.set(x, y, z)
      ring.userData = { pulseSpeed, baseRadius: radius }
      scene.add(ring)
      orbs.push(ring)
    })

    let frameId: number
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.5
    }
    window.addEventListener('mousemove', handleMouseMove)

    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth mouse following
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      // Animate particle systems
      particleSystems.forEach((system, sysIndex) => {
        const positions = system.geometry.attributes.position.array as Float32Array
        const velocities = system.geometry.userData.velocities as Float32Array
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3] += velocities[i * 3]
          positions[i * 3 + 1] += velocities[i * 3 + 1]
          positions[i * 3 + 2] += velocities[i * 3 + 2]

          // Boundary wrap
          if (Math.abs(positions[i * 3]) > 60) positions[i * 3] *= -0.9
          if (Math.abs(positions[i * 3 + 1]) > 60) positions[i * 3 + 1] *= -0.9
          if (Math.abs(positions[i * 3 + 2]) > 40) positions[i * 3 + 2] *= -0.9
        }
        system.geometry.attributes.position.needsUpdate = true
        system.rotation.y = elapsed * (0.01 + sysIndex * 0.005)
        system.rotation.x = Math.sin(elapsed * 0.5 + sysIndex) * 0.1
      })

      // Animate floating shapes
      shapes.forEach((shape) => {
        shape.rotation.x += shape.userData.rotSpeed.x
        shape.rotation.y += shape.userData.rotSpeed.y
        shape.rotation.z += shape.userData.rotSpeed.z
        shape.position.y += Math.sin(elapsed * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01
      })

      // Animate glowing orbs with pulse
      orbs.forEach((orb) => {
        const pulse = Math.sin(elapsed * orb.userData.pulseSpeed) * 0.1 + 1
        orb.scale.setScalar(pulse)
        orb.position.y += Math.sin(elapsed * 0.3 + orb.userData.baseRadius) * 0.005
        orb.position.x += Math.cos(elapsed * 0.2 + orb.userData.baseRadius) * 0.003
      })

      // Camera movement with mouse interaction
      camera.position.x += (mouseX * 8 - camera.position.x) * 0.03
      camera.position.y += (-mouseY * 8 - camera.position.y) * 0.03
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
