import { World } from '@piggo-gg/core'
import { CircleGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import { Text } from 'troika-three-text'

export type Radial = {
  update: (world: World) => void
  group: Group
}

export const Radial = (options: string[]): Radial => {
  const group = new Group()
  const radius = 1

  options.forEach((label, i) => {
    const angle = (i / options.length) * Math.PI * 2

    // circle background
    const circleGeo = new CircleGeometry(0.4, 32)
    const circleMat = new MeshBasicMaterial({ color: 0xffffff })
    const circle = new Mesh(circleGeo, circleMat)
    circle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    circle.userData.label = label
    group.add(circle)

    // label
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

  return {
    group,
    update: (world) => {
      const player = world.client?.playerCharacter()
      if (!player) return

      const { position } = player.components

      // const interpolated = position.interpolate()

      group.position.set(position.data.x - 0.4, position.data.z, position.data.y - 0.8)
    }
  }
}
