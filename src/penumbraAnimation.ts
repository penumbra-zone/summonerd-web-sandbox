const svgNS = "http://www.w3.org/2000/svg";

const pnCyan = "#8be4d9";
const pnOrange = "#ff902f";
const pnPurple = "#5F406C";

type Wave = {
  amplitude: number;
  frequency: number;
  phase: number;
};

const NUMBER_OF_RINGS = 20;
const RESOLUTION = 9;
const ARC = (Math.PI * 2) / RESOLUTION;

const dur = 10;
const baseRadius = 128;

const circleArcPath = (r: number) => `
  M ${-r},0
  a ${r},${r} 0 1,0 ${r * 2},0
  a ${r},${r} 0 1,0 ${-r * 2},0
`;

const rootWaves: Array<Wave> = [
  { amplitude: 6, frequency: 3, phase: Math.PI * Math.random() },
  { amplitude: 4, frequency: 5, phase: Math.PI * Math.random() },
  { amplitude: 2, frequency: 7, phase: Math.PI * Math.random() },
];

const interference = (angleR: number, waves: Array<Wave>) =>
  waves.reduce(
    (acc, wave) =>
      acc + wave.amplitude * Math.sin(wave.frequency * angleR + wave.phase),
    0,
  );

const radial = (resolution: number, waves: Array<Wave>) =>
  Array.from({ length: resolution }).map((_, i) =>
    interference(i * ARC, waves),
  );

const catmullRomToBezier = (points: Array<[number, number]>) => {
  const d: string[] = [];
  for (let i = 1; i < points.length - 2; i++) {
    const p = [points[i - 1], points[i], points[i + 1], points[i + 2]];
    if (i === 1) d.push(`M ${p[1][0]},${p[1][1]}`);
    const ctl1x = p[1][0] + (p[2][0] - p[0][0]) / 6;
    const ctl1y = p[1][1] + (p[2][1] - p[0][1]) / 6;
    const ctl2x = p[2][0] - (p[3][0] - p[1][0]) / 6;
    const ctl2y = p[2][1] - (p[3][1] - p[1][1]) / 6;
    d.push(`C ${ctl1x},${ctl1y} ${ctl2x},${ctl2y} ${p[2][0]},${p[2][1]}`);
  }
  return d;
};

const radialToBezier = (
  radials: Array<number>,
  baseRadius: number,
  scale = 0,
  trans = [0, 0],
) => {
  const cartesian = radials.map((radial, i): [number, number] => {
    const theta = ARC * i;
    const r = baseRadius + radial * scale;
    const x = trans[0] + Math.cos(theta) * r;
    const y = trans[1] + Math.sin(theta) * r;
    return [x, y];
  });

  cartesian.push(cartesian[0], cartesian[1], cartesian[2]);
  const pathSegments = catmullRomToBezier(cartesian);

  return pathSegments.join(" ");
};

const radialDists = radial(RESOLUTION, rootWaves);

const generatedSvg = document.createElementNS(svgNS, "svg");
generatedSvg.setAttribute("width", "1000");
generatedSvg.setAttribute("height", "1000");
generatedSvg.setAttribute("viewBox", "-500 -250 1000 1000");

const shrinkingPath = Array.from({ length: NUMBER_OF_RINGS }).map((_, i) => {
  const iSq = i * i;
  return radialToBezier(radialDists, baseRadius + iSq, iSq * 0.09, [0, iSq]);
});

const animShrinkingValues = shrinkingPath.reverse().join(";");

generatedSvg.innerHTML = `
  <defs>
    <radialGradient id="rgrad3">
      <stop offset="50%" stop-color="${pnPurple}" />
      <stop offset="70%" stop-color="${pnOrange}" />
      <stop offset="100%" stop-color="${pnCyan}" />
    </radialGradient>

  </defs>
  <path id="coreCircle"
    d="${circleArcPath(baseRadius)}"
    opacity="0" fill="black" stroke-width="4"
  >
    <animate 
      attributeName="stroke" values="white;black;black"
      begin="${dur}s" dur="${dur}s" repeatCount="indefinite"
    />
    <animate
      attributeName="opacity" values="1;0;0;0.5;0.2"
      begin="${dur}s" dur="${dur}s" repeatCount="indefinite"
    />
  </path>
`;

const movingPath = document.createElementNS(svgNS, "path");
movingPath.setAttribute("id", "movingPath");
movingPath.setAttribute("stroke-width", "3");
movingPath.setAttribute("fill", "none");
movingPath.setAttribute("stroke", "url(#rgrad3)");
movingPath.innerHTML = `
    <animate
      attributeName="d" values="${animShrinkingValues}"
      dur="${dur}s" repeatCount="indefinite"
    />
    <animate
      attributeName="opacity" values="0;0;1;1;1"
      dur="${dur}s" repeatCount="indefinite"
    />
  `;
generatedSvg.appendChild(movingPath);

shrinkingPath.splice(0, shrinkingPath.length / 2);

for (let i = 0; i < shrinkingPath.length - 3; i++) {
  const pathString = shrinkingPath[i];
  const tracerPath = document.createElementNS(svgNS, "path");
  tracerPath.setAttribute("class", "tracerPath");
  tracerPath.setAttribute("d", pathString);
  tracerPath.setAttribute("fill", "none");
  tracerPath.setAttribute("stroke", "url(#rgrad3)");
  tracerPath.setAttribute("opacity", "0");
  const stayOn = dur / 2 + ((i + 0.5) / (shrinkingPath.length - 1)) * (dur / 2);
  tracerPath.innerHTML = `
    <animate
      attributeName="opacity" values="1;1;0;0;0"
      begin="${stayOn}" dur="${dur}s" repeatCount="indefinite"
    />
  `;

  generatedSvg.appendChild(tracerPath);
}

generatedSvg.style.position = "fixed";
generatedSvg.style.top = "0";
generatedSvg.style.left = "0";
generatedSvg.style.width = "100%";
generatedSvg.style.height = "100%";

document.body.appendChild(generatedSvg);
