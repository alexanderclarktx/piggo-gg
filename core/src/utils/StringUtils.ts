export const genHash = (substr: number = 7) => {
  const id = Math.random().toString(36).substring(substr);
  return id;
}

export const genPlayerId = () => {
  return `noob${Math.trunc((Math.random() * 1000))}`;
}
