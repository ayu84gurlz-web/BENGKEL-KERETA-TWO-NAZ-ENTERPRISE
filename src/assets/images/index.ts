import heroBayImg from './hero_bengkel_bay_1790907365264.jpg';
import impactWrenchImg from './tool_impact_wrench_1790907379274.jpg';
import brakeSystemImg from './part_brake_system_1790907390013.jpg';
import motorOilImg from './fluid_motor_oil_1790907400940.jpg';

export { heroBayImg, impactWrenchImg, brakeSystemImg, motorOilImg };

// Map any legacy path or relative reference to the bundled Vite asset URL
const imageMap: Record<string, string> = {
  '/src/assets/images/hero_bengkel_bay_1790907365264.jpg': heroBayImg,
  '/src/assets/images/tool_impact_wrench_1790907379274.jpg': impactWrenchImg,
  '/src/assets/images/part_brake_system_1790907390013.jpg': brakeSystemImg,
  '/src/assets/images/fluid_motor_oil_1790907400940.jpg': motorOilImg,
  'hero_bengkel_bay_1790907365264.jpg': heroBayImg,
  'tool_impact_wrench_1790907379274.jpg': impactWrenchImg,
  'part_brake_system_1790907390013.jpg': brakeSystemImg,
  'fluid_motor_oil_1790907400940.jpg': motorOilImg,
};

export function resolveAssetImage(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  
  if (imageMap[pathOrUrl]) {
    return imageMap[pathOrUrl];
  }

  // Check matching by filename
  for (const [key, value] of Object.entries(imageMap)) {
    if (pathOrUrl.endsWith(key) || pathOrUrl.includes(key)) {
      return value;
    }
  }

  return pathOrUrl;
}
