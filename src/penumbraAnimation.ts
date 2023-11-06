document.addEventListener("DOMContentLoaded", () => {
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

  const selectRootWaves = () => [
    { amplitude: 6, frequency: 3, phase: 2 * Math.PI * Math.random() },
    { amplitude: 4, frequency: 5, phase: 2 * Math.PI * Math.random() },
    { amplitude: 2, frequency: 7, phase: 2 * Math.PI * Math.random() },
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

  const generatePathValues = () => {
    const rootWaves = selectRootWaves();
    return Array.from({ length: NUMBER_OF_RINGS })
      .map((_, i) => {
        const iSq = i * i;
        return radialToBezier(
          radial(RESOLUTION, rootWaves),
          baseRadius + iSq,
          iSq * 0.09,
          [0, iSq + i],
        );
      })
      .reverse();
  };

  const generatedSvg = document.createElementNS(svgNS, "svg");
  generatedSvg.setAttribute("viewBox", "-400 -200 800 800");
  Object.assign(generatedSvg.style, {
    opacity: "0.9",
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
  });

  generatedSvg.innerHTML = `
  <defs>
    <radialGradient id="rgrad3">
      <stop offset="50%" stop-color="${pnPurple}" />
      <stop offset="70%" stop-color="${pnOrange}" />
      <stop offset="100%" stop-color="${pnCyan}" />
    </radialGradient>

  </defs>
  <path id="movingPath" stroke-width="3" fill="none" stroke="url(#rgrad3)">
    <animate id="movingPathAnimation"
      attributeName="d" values="${/* dummy to start anim */ "M 0,0;M 0,0"}"
      dur="${dur}s" repeatCount="indefinite"
    />
    <animate
      attributeName="opacity" values="0;0;1;1;1"
      dur="${dur}s" repeatCount="indefinite"
    />
  </path>
  <path id="coreCircle"
    d="${circleArcPath(baseRadius)}"
    opacity="0" fill="black" stroke-width="4"
  >
    <animate 
      attributeName="stroke" values="white;black;black"
      begin="${dur}s;movingPath.end" dur="${dur}s" repeatCount="indefinite"
    />
    <animate
      attributeName="opacity" values="1;0;0;0.5;0.2"
      begin="${dur}s;movingPath.end" dur="${dur}s" repeatCount="indefinite"
    />
  </path>
  <g id="tracerGroup0"></g>
  <g id="tracerGroup1"></g>
  `;

  const movingPathAnimation = generatedSvg.querySelector(
    "#movingPathAnimation",
  )!;
  const tracerGroups = [
    generatedSvg.querySelector("#tracerGroup0")!,
    generatedSvg.querySelector("#tracerGroup1")!,
  ];
  let tracerGroupIdx = 0;

  let pathValues = generatePathValues();
  const generateTracerPaths = (idx) =>
    pathValues
      .slice(pathValues.length / 2)
      .map((_, i, paths) => {
        const tracer = document.createElementNS(svgNS, "path");
        tracer.setAttribute("class", "tracerPath");
        tracer.setAttribute("d", _);
        tracer.setAttribute("fill", "none");
        tracer.setAttribute("stroke", "url(#rgrad3)");
        tracer.setAttribute("opacity", "0");
        const stayOn = dur / 2 + ((i + 1.333) / (paths.length - 1)) * (dur / 2);
        tracer.innerHTML = `
    <animate
      attributeName="opacity" values="1;1;0;0;0;0;0;0;0;0"
      begin="${stayOn + dur * idx}" dur="${dur * 2}s" 
      repeatCount="indefinite"
    />
  `;
        return tracer;
      })
      .slice(0, -2);

  const tracerGroupElements = [generateTracerPaths(0), generateTracerPaths(1)];

  const setPaths = () => {
    movingPathAnimation.setAttribute(
      "values",
      pathValues.filter((_, i) => !(i % 3)).join(";"),
    );

    const onGroup = tracerGroupElements[tracerGroupIdx];
    const offGroup = tracerGroups[tracerGroupIdx];
    offGroup.innerHTML = "";
    generateTracerPaths(tracerGroupIdx).forEach((tracer) =>
      offGroup.appendChild(tracer),
    );

    tracerGroupIdx = Number(!tracerGroupIdx);
    pathValues = generatePathValues();
  };

  setPaths();
  setInterval(setPaths, dur * 1000);

  document.body.appendChild(generatedSvg);
});
