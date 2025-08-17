export type Chat = {
  inputBuffer: string
  isOpen: boolean
}

export const Chat = (): Chat => ({
  inputBuffer: "",
  isOpen: false
})
