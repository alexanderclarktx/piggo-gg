export const logPerf = (message: string, from: DOMHighResTimeStamp, threshold: number = 5) => {
  const time = performance.now() - from
  if (time > threshold) {
    console.log(message, time)
  }
}
