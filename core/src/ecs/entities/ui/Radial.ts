import { CircleGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import { Text } from 'troika-three-text'

export const Radial = (options: string[] = [], radius = 1) => {
  const group = new Group()

  options.forEach((label, i) => {
    const angle = (i / options.length) * Math.PI * 2

    // Create a circle background (optional)
    const circleGeo = new CircleGeometry(0.4, 32)
    const circleMat = new MeshBasicMaterial({ color: 0xffffff })
    const circle = new Mesh(circleGeo, circleMat)
    circle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    circle.userData.label = label
    group.add(circle)

    // Create 3D text using Troika
    const text = new Text()
    text.text = label
    text.fontSize = 0.3
    text.color = 0x000000
    text.position.copy(circle.position)
    text.position.z += 0.01 // slightly above circle
    text.anchorX = 'center'
    text.anchorY = 'middle'
    text.sync() // required to update layout
    group.add(text)
  })

  return group
}
