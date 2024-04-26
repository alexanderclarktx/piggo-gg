export const orthoToDirection = (o: number) => {
  if (o === 0) return "l";
  if (o === 1) return "ul";
  if (o === 2) return "u";
  if (o === 3) return "ur";
  if (o === 4) return "r";
  if (o === 5) return "dr";
  if (o === 6) return "d";
  if (o === 7) return "dl";
  return "d";
}

