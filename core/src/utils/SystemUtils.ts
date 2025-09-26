export const isMobile = (): boolean => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export const { keys, values, entries } = Object

const textInputSelector =
  'textarea,[contenteditable]:not([contenteditable="false"]),input:not([type]),' +
  'input[type="text"],input[type="search"],input[type="url"],input[type="tel"],' +
  'input[type="email"],input[type="password"],input[type="number"]'

export const isTypingEvent = (e: Event) => {
  const target = e.composedPath ? e.composedPath()[0] : e.target
  if (!(target instanceof Element)) return false

  const editable = target.closest<HTMLInputElement>(textInputSelector)
  if (!editable) return false

  if (editable.matches('input,textarea')) {
    if (editable.readOnly || editable.disabled) return false
  }
  return true
}

export const replaceCanvas = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | undefined

  const newCanvas = document.createElement("canvas")
  newCanvas.id = "canvas"

  if (isMobile()) newCanvas.style.border = "none"

  if (canvas) {
    canvas.replaceWith(newCanvas)
  } else {
    document.body.appendChild(newCanvas)
  }

  return newCanvas
}
