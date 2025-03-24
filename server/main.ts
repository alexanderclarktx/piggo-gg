export * from "./src/Api"
export * from "./src/NoobSystem"
export * from "./src/ServerWorld"
export * from "./src/Intelligence"
export * from "./src/db/generated"


// need window.innerWidth, window.innerHeight
declare global {
  interface window {
    innerWidth: number
    innerHeight: number
  }
}
