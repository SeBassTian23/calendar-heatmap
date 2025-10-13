import chroma from "chroma-js";

const generateDarkColor = (lightColor='#000000') => {
  const c = chroma(lightColor);
  const lum = c.luminance();

  if (lum < 0.3) return c.brighten(2).hex();
  if (lum < 0.5) return c.brighten(1).hex();
  return c.saturate(0.5).hex();
}

export default generateDarkColor;