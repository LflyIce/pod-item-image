export function normalOffset(red: number, green: number, strength: number) {
  const x = ((red - 128) / 128) * strength;
  const y = ((green - 128) / 128) * strength;
  return {
    x: roundTiny(x),
    y: roundTiny(y)
  };
}

function roundTiny(value: number) {
  return Math.abs(value) < 0.000001 ? 0 : value;
}
