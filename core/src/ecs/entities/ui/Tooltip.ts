
// const { x, y } = apple.components.position.data
// const tooltip = Entity({
//   id: "tooltip",
//   components: {
//     position: Position({ x, y: y - 20, screenFixed: false }),
//     renderable: Renderable({
//       zIndex: 10,
//       scale: 1,
//       scaleMode: "nearest",
//       cullable: true,
//       setContainer: async () => {
//         const texture = (await loadTexture("key.json"))["0"]
//         return new Sprite({ texture, anchor: { x: 0.5, y: 0.5 } })
//       }
//     })
//   }
// })
// world.addEntity(tooltip)
