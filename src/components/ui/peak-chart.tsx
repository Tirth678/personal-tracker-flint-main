"use client";
// Peak Chart by Louis Studios.
// 200 more hand-made React components at https://studios.lou15.com/?ref=21st-code
import * as React from "react";
const CW = 540,
  CH = 696,
  CR = 56,
  HN = CH / CW,
  RN = CR / CW,
  BX = 0.32 * CW,
  BY = 0.16 * CW;
const FIELD_FILL = "#1678ff";
const FIELD_SHADES = [
  {
    shape: [0.4748, 0.8152, 0.7509, 0.8801, 0.7026],
    color: "#000000",
    opacity: 1,
  },
  {
    shape: [0.3741, 0.2723, 0.7371, 0.3009, 0.1168],
    color: "#020000",
    opacity: 1,
  },
  {
    shape: [0.7846, 0.0251, 0.3833, 0.1301, -0.5566],
    color: "#2e85ff",
    opacity: 0.4756,
  },
  {
    shape: [0.6206, -0.2018, 0.1282, 0.5909, 0.2754],
    color: "#3584ff",
    opacity: 0.3146,
  },
  {
    shape: [0.6, 1.2391, 0.827, 0.2111, -1.6357],
    color: "#000d1e",
    opacity: 1,
  },
  {
    shape: [0.0964, 0.5388, 1000, 0.1285, 0.5421],
    color: "#000005",
    opacity: 0.2298,
  },
];
const FIELD_RIMS = [
  { shape: [0.1207, -0.0365, 0.0492], color: "#2667ff", opacity: 1 },
  { shape: [0.0667, -0.0166, 0.0176], color: "#467dff", opacity: 1 },
  { shape: [0.037, -0.0134, 0.0154], color: "#c2ffff", opacity: 0.8091 },
];
const HALO = {
    cx: 0.4996,
    cy: 0.6438,
    sx: 0.2498,
    sy: 0.2433,
    opacity: 0.845,
    color: "#0e50ff",
  },
  BREATH_GAIN = 0.42,
  GRAIN = 1.7,
  BACKDROP = "#08101a";
const PLOT_X0 = 20.29,
  PLOT_X1 = 503.69,
  PLOT_TOP = 158.49,
  PLOT_BOTTOM = 385.28,
  LINE_W = 7.1,
  LINE_COLOR = "#6496e2",
  LINE_FALLOFF = 108,
  LINE_POWER = 1.44,
  LINE_CENTER = 12,
  DOT_R = 13,
  DOT_DX = 8,
  DOT_DY = 2.6,
  GRID_DX = 40.64,
  GRID_DY = 40.07,
  GRID_Y0 = 468.7,
  GRID_COLOR = "#5a87e1",
  GRID_ALPHA = 0.23;
const T_GRID = 0.9,
  T_DRAW0 = 0.25,
  T_DRAW = 2.1,
  T_NUM0 = 1,
  T_NUM = 1.7,
  T_ARROW = 2.65,
  T_REST = 3.3,
  T_BREATH = 4.6,
  T_MORPH = 0.75;
const BASE_ACCENT = "#4f8ef7",
  DOT_TOP = "#2680ff",
  DOT_MID = "#75aafa",
  DOT_BOTTOM = "#d0e4fd",
  DOT_GLOW = "#287dff",
  PULSE_COLOR = "#78afff";
const MONTH_DATA = [
  60, 75, 91, 110, 120, 122, 116, 106, 96, 89, 88, 95, 112, 150, 339, 384, 400,
  388, 318, 240, 182, 146, 126, 117, 115, 117, 121, 127, 134, 143,
];
const SERIES: Record<string, { data: number[]; labels: string[] }> = {
  Weekly: {
    data: [128, 152, 141, 226, 384, 262, 214],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  Monthly: {
    data: MONTH_DATA,
    labels: MONTH_DATA.map((_, i) => `Day ${i + 1}`),
  },
  Yearly: {
    data: [92, 108, 104, 146, 171, 158, 214, 246, 231, 397, 322, 288],
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
};
export interface PeakChartProps {
  /** Wide cards place the plot beside the headline; portrait keeps the original composition. */
  layout?: "portrait" | "wide";
  data?: number[];
  labels?: string[];
  value?: number;
  valueSuffix?: string;
  decimals?: number;
  title?: string;
  caption?: string;
  updatedText?: string;
  trend?: "up" | "down" | "none";
  periods?: string[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  accent?: string;
  width?: number;
  loop?: number;
  backdrop?: boolean;
  formatValue?: (value: number) => string;
  font?: string;
  className?: string;
  style?: React.CSSProperties;
}
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const backOut = (x: number) => {
  const t = clamp01(x),
    c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
function erf(x: number) {
  const s = x < 0 ? -1 : 1,
    a = Math.abs(x),
    t = 1 / (1 + 0.3275911 * a);
  return (
    s *
    (1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
        t +
        0.254829592) *
        t *
        Math.exp(-a * a))
  );
}
const phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
function sdf(u: number, v: number) {
  const qx = Math.abs(u - 0.5) - (0.5 - RN),
    qy = Math.abs(v - HN / 2) - (HN / 2 - RN);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    RN
  );
}
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rgbOf(color: string): [number, number, number] {
  const c = color.trim(),
    hex = /^#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])/i.exec(c);
  if (hex) {
    const h =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((d) => d + d)
            .join("")
        : hex[1];
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);
  return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
}
const rgba = (color: string, a: number) =>
  `rgba(${rgbOf(color).join(",")},${a.toFixed(4)})`;
function hslOf(color: string): [number, number] | null {
  if (!/^\s*(#|rgb)/i.test(color)) return null;
  const [r, g, b] = rgbOf(color).map((v) => v / 255),
    mx = Math.max(r, g, b),
    mn = Math.min(r, g, b),
    l = (mx + mn) / 2,
    d = mx - mn;
  if (d === 0) return [0, 0];
  const sat = d / (1 - Math.abs(2 * l - 1)),
    h =
      mx === r
        ? ((g - b) / d) % 6
        : mx === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, sat];
}
function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}
// The fitted glow field is static. Share the latest size between a matched pair of cards.
let lastField:
  { key: string; rest: HTMLCanvasElement; lift: HTMLCanvasElement } | undefined;
function buildField(px: number, seed: number) {
  const w = Math.round(px),
    h = Math.round(px * HN),
    key = `${w}/${seed}`;
  if (lastField?.key === key) return lastField;
  const rest = makeCanvas(w, h),
    lift = makeCanvas(w, h),
    c1 = rest.getContext("2d")!,
    c2 = lift.getContext("2d")!,
    i1 = c1.createImageData(w, h),
    i2 = c2.createImageData(w, h),
    d1 = i1.data,
    d2 = i2.data,
    rand = rng(seed),
    fill = rgbOf(FIELD_FILL);
  const shades = FIELD_SHADES.map(
      ({ shape: [cx, cy, sx, sy, th], color, opacity }) => ({
        cx,
        cy,
        isx: 1 / Math.abs(sx),
        isy: 1 / Math.abs(sy),
        c: Math.cos(th),
        s: Math.sin(th),
        rgb: rgbOf(color),
        a: opacity,
      }),
    ),
    rims = FIELD_RIMS.map(({ shape: [off, sp, sg], color, opacity }) => ({
      off,
      sp,
      sg,
      rgb: rgbOf(color),
      a: opacity,
    })),
    k2 = 1 + BREATH_GAIN;
  for (let j = 0; j < h; j++) {
    const v = (j + 0.5) / w;
    for (let i = 0; i < w; i++) {
      const u = (i + 0.5) / w;
      let [r, g, b] = fill;
      for (const o of shades) {
        const du = u - o.cx,
          dv = v - o.cy,
          x = (o.c * du + o.s * dv) * o.isx,
          y = (-o.s * du + o.c * dv) * o.isy,
          m = o.a * Math.exp(-0.5 * (x * x + y * y));
        r += m * (o.rgb[0] - r);
        g += m * (o.rgb[1] - g);
        b += m * (o.rgb[2] - b);
      }
      let r2 = r,
        g2 = g,
        b2 = b;
      for (const o of rims) {
        const vs = v + o.off,
          dx = Math.min(u, 1 - u),
          dy = Math.min(vs, HN - vs),
          ratio = Math.min(
            1,
            phi((-sdf(u, vs) - o.sp) / o.sg) /
              Math.max(1e-9, phi((Math.min(dx, dy) - o.sp) / o.sg)),
          ),
          k = 1 - phi((dx - o.sp) / o.sg) * phi((dy - o.sp) / o.sg) * ratio,
          m = o.a * k;
        r += m * (o.rgb[0] - r);
        g += m * (o.rgb[1] - g);
        b += m * (o.rgb[2] - b);
        const m2 = Math.min(1, m * k2);
        r2 += m2 * (o.rgb[0] - r2);
        g2 += m2 * (o.rgb[1] - g2);
        b2 += m2 * (o.rgb[2] - b2);
      }
      const n = (rand() + rand() + rand() - 1.5) * 2 * GRAIN,
        p = (j * w + i) * 4;
      d1[p] = r + n;
      d1[p + 1] = g + n;
      d1[p + 2] = b + n;
      d1[p + 3] = 255;
      d2[p] = r2 + n;
      d2[p + 1] = g2 + n;
      d2[p + 2] = b2 + n;
      d2[p + 3] = 255;
    }
  }
  c1.putImageData(i1, 0, 0);
  c2.putImageData(i2, 0, 0);
  return (lastField = { key, rest, lift });
}
function buildHalo(px: number) {
  const s = 0.25,
    w = Math.max(8, Math.round(((CW + 2 * BX) * px * s) / CW)),
    h = Math.max(8, Math.round(((CH + 2 * BY) * px * s) / CW)),
    c = makeCanvas(w, h),
    ctx = c.getContext("2d")!,
    img = ctx.createImageData(w, h),
    [hr, hg, hb] = rgbOf(HALO.color);
  for (let j = 0; j < h; j++) {
    const v = (((j + 0.5) / h) * (CH + 2 * BY) - BY) / CW;
    for (let i = 0; i < w; i++) {
      const u = (((i + 0.5) / w) * (CW + 2 * BX) - BX) / CW,
        a = (u - HALO.cx) / HALO.sx,
        e = (v - HALO.cy) / HALO.sy,
        k = Math.exp(-0.5 * (a * a + e * e)) * HALO.opacity,
        p = (j * w + i) * 4;
      img.data[p] = hr;
      img.data[p + 1] = hg;
      img.data[p + 2] = hb;
      img.data[p + 3] = Math.min(255, k * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
function buildGrid(px: number) {
  const w = Math.round(px),
    h = Math.round(px * HN),
    c = makeCanvas(w, h),
    ctx = c.getContext("2d")!,
    s = px / CW;
  ctx.scale(s, s);
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = -6; k <= 6; k++) {
    const x = CW / 2 + GRID_DX * k;
    ctx.moveTo(x, 250);
    ctx.lineTo(x, CH);
  }
  for (let k = -6; k <= 6; k++) {
    const y = GRID_Y0 + GRID_DY * k;
    if (y < 250 || y > CH) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(CW, y);
  }
  ctx.stroke();
  const mw = 64,
    mh = Math.round(64 * HN),
    m = makeCanvas(mw, mh),
    mc = m.getContext("2d")!,
    img = mc.createImageData(mw, mh);
  for (let j = 0; j < mh; j++) {
    const y = ((j + 0.5) / mh) * CH,
      my = smooth((y - 350) / 230);
    for (let i = 0; i < mw; i++) {
      const x = ((i + 0.5) / mw) * CW,
        mx = Math.exp(-0.5 * Math.pow((x - CW / 2) / 92, 2));
      img.data[(j * mw + i) * 4 + 3] = Math.round(255 * GRID_ALPHA * mx * my);
    }
  }
  mc.putImageData(img, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(m, 0, 0, w, h);
  return c;
}
function grainTile() {
  const base = rgbOf(BACKDROP),
    n = 160,
    c = makeCanvas(n, n),
    ctx = c.getContext("2d")!,
    img = ctx.createImageData(n, n),
    rand = rng(7);
  for (let p = 0; p < n * n * 4; p += 4) {
    const k = (rand() + rand() + rand() - 1.5) * 2 * GRAIN;
    img.data[p] = base[0] + k;
    img.data[p + 1] = base[1] + k;
    img.data[p + 2] = base[2] + k;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

type Curve = {
  ys: Float32Array;
  peakX: number;
  lo: number;
  hi: number;
  n: number;
};
// Monotone Steffen spline: the curve cannot overshoot its peak data point.
function buildCurve(data: number[]): Curve {
  const vals =
      data.length >= 2 ? data : data.length === 1 ? [data[0], data[0]] : [0, 0],
    n = vals.length;
  let lo = Infinity,
    hi = -Infinity,
    pk = 0;
  for (let i = 0; i < n; i++) {
    if (vals[i] < lo) lo = vals[i];
    if (vals[i] > hi) {
      hi = vals[i];
      pk = i;
    }
  }
  const span = hi - lo || 1,
    yv = vals.map((v) =>
      hi === lo
        ? (PLOT_TOP + PLOT_BOTTOM) / 2
        : PLOT_TOP + (1 - (v - lo) / span) * (PLOT_BOTTOM - PLOT_TOP),
    ),
    h = (PLOT_X1 - PLOT_X0) / (n - 1),
    sl: number[] = [];
  for (let i = 0; i < n - 1; i++) sl.push((yv[i + 1] - yv[i]) / h);
  const m = [sl[0]];
  for (let i = 1; i < n - 1; i++) {
    const a = sl[i - 1],
      b = sl[i];
    m.push(
      (Math.sign(a) + Math.sign(b)) *
        Math.min(Math.abs(a), Math.abs(b), 0.25 * Math.abs(a + b)),
    );
  }
  m.push(sl[n - 2]);
  const ys = new Float32Array(CW + 1);
  for (let x = 0; x <= CW; x++) {
    let y: number;
    if (x <= PLOT_X0) y = yv[0] + (x - PLOT_X0) * m[0];
    else if (x >= PLOT_X1) y = yv[n - 1] + (x - PLOT_X1) * m[n - 1];
    else {
      const t = (x - PLOT_X0) / h,
        i = Math.min(n - 2, Math.floor(t)),
        f = t - i,
        f2 = f * f,
        f3 = f2 * f;
      y =
        (2 * f3 - 3 * f2 + 1) * yv[i] +
        (f3 - 2 * f2 + f) * h * m[i] +
        (-2 * f3 + 3 * f2) * yv[i + 1] +
        (f3 - f2) * h * m[i + 1];
    }
    ys[x] = y;
  }
  return { ys, peakX: PLOT_X0 + pk * h, lo, hi, n };
}
function curveY(ys: Float32Array, x: number) {
  const xc = Math.max(0, Math.min(CW, x)),
    i = Math.min(CW - 1, Math.floor(xc)),
    f = xc - i;
  return ys[i] * (1 - f) + ys[i + 1] * f;
}
const lineAlpha = (d: number) =>
  Math.exp(-Math.pow(Math.abs(d) / LINE_FALLOFF, LINE_POWER));
function inverseEase(target: number) {
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (easeInOut(m) < target) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
function frameAt(t: number, loop: number) {
  const f = {
    grid: smooth(t / T_GRID),
    draw: easeInOut((t - T_DRAW0) / T_DRAW),
    erase: 0,
    dotS: backOut((t - T_DRAW0) / 0.4),
    dotA: smooth((t - T_DRAW0) / 0.2),
    num: easeOut((t - T_NUM0) / T_NUM),
    numA: smooth((t - T_NUM0) / 0.45),
    numY: 1 - easeOut((t - T_NUM0) / 0.7),
    arrow: backOut((t - T_ARROW) / 0.45),
    arrowA: smooth((t - T_ARROW) / 0.18),
    breath: 0,
  };
  if (loop > 0) {
    const L = loop,
      out = (a: number, d: number) => 1 - smooth((t - (L - a)) / d);
    f.erase = easeInOut((t - (L - 1.4)) / 1.15);
    const dk = out(1.05, 0.45);
    f.dotA *= dk;
    f.dotS *= 0.6 + 0.4 * dk;
    const nk = out(1.3, 0.55);
    f.numA *= nk;
    f.arrowA *= nk;
    f.numY -= (1 - nk) * 0.7;
    f.grid *= out(1.1, 0.85);
    const s = (((t - (L - 2.2)) % L) + L) % L;
    f.breath =
      s < T_BREATH ? Math.pow(Math.sin((Math.PI * s) / T_BREATH), 2) : 0;
  } else if (t > T_REST)
    f.breath = 0.6 * Math.pow(Math.sin((Math.PI * (t - T_REST)) / 7), 2);
  return f;
}
export function PeakChart({
  layout = "portrait",
  data,
  labels,
  value = 400,
  valueSuffix = "%",
  decimals = 0,
  title = "Conversion rate",
  caption = "Increase vs last month",
  updatedText = "Data updated 2h ago",
  trend = "up",
  periods = ["Weekly", "Monthly", "Yearly"],
  period,
  defaultPeriod = "Monthly",
  onPeriodChange,
  accent = BASE_ACCENT,
  width = 420,
  loop = 0,
  backdrop = false,
  formatValue,
  font = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  className,
  style,
}: PeakChartProps) {
  const [innerPeriod, setInnerPeriod] = React.useState(defaultPeriod),
    current = period ?? innerPeriod,
    [open, setOpen] = React.useState(false),
    [grain, setGrain] = React.useState<string | null>(null),
    u = width / CW,
    series = data ?? SERIES[current]?.data ?? MONTH_DATA,
    builtIn = SERIES[current],
    pointLabels =
      labels ??
      (builtIn && builtIn.data.length === series.length
        ? builtIn.labels
        : undefined);
  const wide = layout === "wide";
  const cardHeight = wide ? 252 : CH,
    radius = wide ? 22 : CR;
  // Fit the same spline, dot and hit-test coordinates into the wide card’s right-hand plot.
  const plotScale = wide ? 0.54 : 1,
    plotLeft = wide ? 240 : 0,
    plotTop = wide ? -24 : 0;
  const rootRef = React.useRef<HTMLDivElement>(null),
    cardRef = React.useRef<HTMLDivElement>(null),
    canvasRef = React.useRef<HTMLCanvasElement>(null),
    digitsRef = React.useRef<HTMLSpanElement>(null),
    numRef = React.useRef<HTMLDivElement>(null),
    arrowRef = React.useRef<SVGSVGElement>(null),
    readRef = React.useRef<HTMLDivElement>(null),
    readValRef = React.useRef<HTMLSpanElement>(null),
    readLabRef = React.useRef<HTMLSpanElement>(null),
    pillRef = React.useRef<HTMLButtonElement>(null),
    menuRef = React.useRef<HTMLDivElement>(null);
  const key = series.join(",");
  const curve = React.useMemo(() => buildCurve(series), [key]);
  const live = React.useRef({
    curve,
    from: null as Curve | null,
    morph: 1,
    labels: pointLabels,
    value,
    shownValue: 0,
    valueFrom: 0,
    valueT: 1,
    hover: null as number | null,
    hoverX: 0,
    hoverMix: 0,
    fmt: formatValue,
    suffix: valueSuffix,
    decimals,
    loop,
    kick: () => {},
  });
  Object.assign(live.current, {
    labels: pointLabels,
    fmt: formatValue,
    suffix: valueSuffix,
    decimals,
    loop,
  });
  React.useEffect(() => {
    const L = live.current;
    if (curve === L.curve) return;
    const t = easeInOut(L.morph);
    if (L.from && L.morph < 1) {
      const ys = new Float32Array(CW + 1);
      for (let x = 0; x <= CW; x++)
        ys[x] = L.from.ys[x] + (L.curve.ys[x] - L.from.ys[x]) * t;
      L.from = {
        ...L.curve,
        ys,
        peakX: L.from.peakX + (L.curve.peakX - L.from.peakX) * t,
      };
    } else L.from = L.curve;
    L.curve = curve;
    L.morph = 0;
    L.kick();
  }, [curve]);
  React.useEffect(() => {
    const L = live.current;
    if (L.value === value) return;
    L.valueFrom = L.shownValue;
    L.value = value;
    L.valueT = 0;
    L.kick();
  }, [value]);
  React.useEffect(() => {
    if (backdrop && !grain) setGrain(grainTile());
  }, [backdrop, grain]);
  React.useEffect(() => {
    const canvas = canvasRef.current,
      card = cardRef.current;
    if (!canvas || !card) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const L = live.current,
      reduce =
        typeof matchMedia !== "undefined" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1)),
      bxc = Math.ceil(BX * u),
      byc = Math.ceil(BY * u),
      bx = bxc * dpr,
      by = byc * dpr;
    canvas.width = Math.ceil(CW * u * dpr + 2 * bx);
    canvas.height = Math.ceil(cardHeight * u * dpr + 2 * by);
    Object.assign(canvas.style, {
      left: `${-bxc}px`,
      top: `${-byc}px`,
      width: `${canvas.width / dpr}px`,
      height: `${canvas.height / dpr}px`,
    });
    const fieldPx = Math.min(width * dpr, Math.max(width, 700)),
      { rest: field, lift: bright } = buildField(fieldPx, 11),
      grid = buildGrid(width * dpr),
      halo = buildHalo(width),
      tLand = (frac: number) => T_DRAW0 + T_DRAW * inverseEase(frac);
    let clock = reduce ? T_REST + 0.01 : 0,
      started = reduce,
      visible = true,
      raf = 0,
      last = performance.now();
    const roundRect = () => {
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.arcTo(CW, 0, CW, cardHeight, radius);
      ctx.arcTo(CW, cardHeight, 0, cardHeight, radius);
      ctx.arcTo(0, cardHeight, 0, 0, radius);
      ctx.arcTo(0, 0, CW, 0, radius);
      ctx.closePath();
    };
    const draw = (dt: number) => {
      const loopS = L.loop > 0 ? Math.max(6, L.loop) : 0,
        hovering = L.hover !== null;
      if (started && !reduce) {
        const tl = loopS ? clock % loopS : clock,
          frozen = hovering && tl >= T_REST && (!loopS || tl < loopS - 2.2);
        if (!frozen) clock += dt;
      }
      const t = loopS ? clock % loopS : clock,
        F = started ? frameAt(t, loopS) : frameAt(0, 0);
      if (reduce) F.breath = 0;
      if (L.morph < 1)
        L.morph = reduce ? 1 : Math.min(1, L.morph + dt / T_MORPH);
      const mk = easeInOut(L.morph),
        C = L.curve,
        from = L.from && L.morph < 1 ? L.from : null,
        ys = from ? new Float32Array(CW + 1) : C.ys;
      if (from)
        for (let x = 0; x <= CW; x++)
          ys[x] = from.ys[x] + (C.ys[x] - from.ys[x]) * mk;
      const peakX = from ? from.peakX + (C.peakX - from.peakX) * mk : C.peakX,
        lo = from ? from.lo + (C.lo - from.lo) * mk : C.lo,
        hi = from ? from.hi + (C.hi - from.hi) * mk : C.hi,
        landed =
          t >= tLand((peakX + DOT_DX) / CW) && F.erase <= 0 && F.dotA > 0.99,
        wantHover = hovering && (landed || reduce);
      if (L.hover !== null)
        L.hoverX = reduce
          ? L.hover
          : L.hoverX + (L.hover - L.hoverX) * (1 - Math.exp(-dt * 14));
      L.hoverMix = reduce
        ? wantHover
          ? 1
          : 0
        : L.hoverMix +
          ((wantHover ? 1 : 0) - L.hoverMix) * (1 - Math.exp(-dt * 10));
      if (L.valueT < 1)
        L.valueT = reduce ? 1 : Math.min(1, L.valueT + dt / 0.9);
      const target = L.valueFrom + (L.value - L.valueFrom) * easeOut(L.valueT),
        shown = target * F.num;
      L.shownValue = shown;
      if (digitsRef.current) {
        const txt = shown.toLocaleString("en-US", {
          minimumFractionDigits: L.decimals,
          maximumFractionDigits: L.decimals,
        });
        if (digitsRef.current.textContent !== txt)
          digitsRef.current.textContent = txt;
      }
      if (numRef.current) {
        numRef.current.style.opacity = String(F.numA);
        numRef.current.style.transform = `translateY(${(F.numY * 5 * u).toFixed(2)}px)`;
        const blur = Math.abs(F.numY) * 6 * u;
        numRef.current.style.filter =
          blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
      }
      if (arrowRef.current) {
        arrowRef.current.style.opacity = String(F.arrowA);
        arrowRef.current.style.transform = `scale(${Math.max(0, F.arrow).toFixed(3)})`;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const s = dpr * u;
      ctx.setTransform(s, 0, 0, s, bx, by);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(halo, -BX, -BY, CW + 2 * BX, cardHeight + 2 * BY);
      ctx.save();
      roundRect();
      ctx.clip();
      ctx.drawImage(field, 0, 0, CW, cardHeight);
      if (F.breath > 0.001) {
        ctx.globalAlpha = F.breath;
        ctx.drawImage(bright, 0, 0, CW, cardHeight);
      }
      if (F.grid > 0.001) {
        ctx.globalAlpha = F.grid;
        ctx.drawImage(grid, 0, 0, CW, cardHeight);
      }
      ctx.globalAlpha = 1;
      ctx.translate(plotLeft, plotTop);
      ctx.scale(plotScale, plotScale);
      const x0 = F.erase * CW,
        x1 = F.draw * CW;
      if (x1 - x0 > 0.5) {
        const g = ctx.createLinearGradient(0, 0, CW, 0),
          head = 0.95 * (1 - smooth((F.draw - 0.8) / 0.2));
        for (let i = 0; i <= 54; i++) {
          const x = (i / 54) * CW;
          let a = Math.max(wide ? 0.22 : 0, lineAlpha(x - peakX - LINE_CENTER));
          if (head > 0.001 && x <= x1 + 10)
            a = Math.max(a, head * Math.exp(-Math.max(0, x1 - x) / 70));
          if (F.erase > 0) a *= smooth((x - x0) / 60);
          g.addColorStop(i / 54, rgba(LINE_COLOR, a));
        }
        ctx.strokeStyle = g;
        ctx.lineWidth = LINE_W;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x0, curveY(ys, x0));
        for (let x = Math.floor(x0) + 1; x < x1; x++) ctx.lineTo(x, ys[x]);
        ctx.lineTo(x1, curveY(ys, x1));
        ctx.stroke();
      }
      if (F.dotA > 0.001) {
        const restX = peakX + (wide ? 0 : DOT_DX),
          baseX = Math.min(x1, restX),
          dx = baseX + (L.hoverX - baseX) * L.hoverMix,
          dy =
            curveY(ys, dx) + DOT_DY * (1 - L.hoverMix) * clamp01(baseX / restX),
          sinceLand = t - tLand(restX / CW),
          pulse =
            sinceLand > 0 && sinceLand < 1.1 && !reduce ? sinceLand / 1.1 : -1;
        ctx.globalAlpha = F.dotA;
        ctx.translate(dx, dy);
        ctx.scale(F.dotS, F.dotS);
        const boost =
            pulse >= 0 ? Math.sin(Math.PI * Math.min(1, pulse * 1.6)) : 0,
          hg = ctx.createRadialGradient(0, 0, 0, 0, 0, 30),
          ha = (a: number) =>
            rgba(DOT_GLOW, Math.min(1, a * (1 + 0.9 * boost)));
        for (const [r, a] of [
          [0, 0.47],
          [15, 0.47],
          [17, 0.41],
          [19, 0.31],
          [21, 0.17],
          [23, 0.1],
          [25, 0.06],
          [27, 0.03],
          [30, 0],
        ])
          hg.addColorStop(r / 30, ha(a));
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        if (pulse >= 0) {
          const r = DOT_R + 26 * easeOut(pulse);
          ctx.strokeStyle = rgba(PULSE_COLOR, 0.55 * (1 - pulse) * (1 - pulse));
          ctx.lineWidth = 2.2 * (1 - pulse) + 0.6;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        const bg = ctx.createLinearGradient(0, -DOT_R, 0, DOT_R);
        bg.addColorStop(0, DOT_TOP);
        bg.addColorStop(0.45, DOT_MID);
        bg.addColorStop(1, DOT_BOTTOM);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(0, 0, DOT_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(s, 0, 0, s, bx, by);
        ctx.globalAlpha = 1;
        const rd = readRef.current;
        if (rd) {
          rd.style.opacity = L.hoverMix.toFixed(3);
          rd.style.transform = `translate(${((plotLeft + dx * plotScale) * u).toFixed(1)}px, ${((plotTop + (dy - 26) * plotScale) * u).toFixed(1)}px) translate(-50%, -100%) scale(${(0.92 + 0.08 * L.hoverMix).toFixed(3)})`;
          if (L.hoverMix > 0.01) {
            const v =
                lo +
                ((PLOT_BOTTOM - curveY(ys, dx)) / (PLOT_BOTTOM - PLOT_TOP)) *
                  (hi - lo),
              txt = L.fmt
                ? L.fmt(v)
                : `${Math.round(v).toLocaleString("en-US")}${L.suffix}`;
            if (readValRef.current && readValRef.current.textContent !== txt)
              readValRef.current.textContent = txt;
            const idx = Math.round(
                ((Math.max(PLOT_X0, Math.min(PLOT_X1, dx)) - PLOT_X0) /
                  (PLOT_X1 - PLOT_X0)) *
                  (C.n - 1),
              ),
              lab = L.labels?.[Math.min(idx, L.labels.length - 1)] ?? "";
            if (readLabRef.current) {
              if (readLabRef.current.textContent !== lab)
                readLabRef.current.textContent = lab;
              readLabRef.current.style.display = lab ? "" : "none";
            }
          }
        }
      }
      ctx.restore();
    };
    const busy = () =>
      started &&
      (!reduce ||
        L.morph < 1 ||
        Math.abs(L.hoverMix - (L.hover !== null ? 1 : 0)) > 0.001);
    const tick = () => {
      raf = 0;
      const now = performance.now(),
        dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      draw(dt);
      if (visible && !document.hidden && busy())
        raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    L.kick = kick;
    draw(0);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        started = true;
        kick();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(card);
    const onVis = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (raf) cancelAnimationFrame(raf);
      L.kick = () => {};
    };
  }, [width, u, cardHeight, radius, plotScale, plotLeft, plotTop, wide]);
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || pillRef.current?.contains(t)) return;
      setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        pillRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  const choose = (p: string) => {
    setOpen(false);
    pillRef.current?.focus();
    if (p === current) return;
    if (period === undefined) setInnerPeriod(p);
    onPeriodChange?.(p);
  };
  const onMove = (e: React.PointerEvent) => {
    const r = cardRef.current!.getBoundingClientRect(),
      x = (((e.clientX - r.left) / r.width) * CW - plotLeft) / plotScale,
      L = live.current,
      nx = Math.max(PLOT_X0, Math.min(PLOT_X1, x));
    if (L.hover === null && L.hoverMix < 0.02) L.hoverX = nx;
    L.hover = nx;
    L.kick();
  };
  const onLeave = () => {
    live.current.hover = null;
    live.current.kick();
  };
  const tint = (() => {
    const a = hslOf(accent),
      b = hslOf(BASE_ACCENT);
    if (!a || !b) return;
    let d = a[0] - b[0];
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const k = b[1] > 0 ? a[1] / b[1] : 1;
    if (Math.abs(d) < 0.5 && Math.abs(k - 1) < 0.02) return;
    return `hue-rotate(${d.toFixed(1)}deg) saturate(${k.toFixed(3)})`;
  })();
  const px = (n: number) => `${(n * u).toFixed(3)}px`,
    textBase: React.CSSProperties = {
      position: "absolute",
      whiteSpace: "nowrap",
      fontFamily: font,
      fontStretch: "110%",
      fontWeight: 300,
      margin: 0,
      lineHeight: 1,
    },
    trendColor = trend === "down" ? "#f08a8a" : "#93cfa2",
    finalDigits = value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  const cardEl = (
    <div
      ref={cardRef}
      data-peak-chart=""
      data-layout={layout}
      role="group"
      aria-label={`${title}: ${finalDigits}${valueSuffix}, ${current}`}
      style={{
        position: "relative",
        width,
        height: cardHeight * u,
        borderRadius: px(radius),
        flex: "none",
        fontFamily: font,
        color: "#fff",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
          filter: tint,
        }}
      />
      <div
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={onLeave}
        onPointerCancel={onLeave}
        style={{
          position: "absolute",
          left: px(plotLeft),
          top: px(plotTop + 96 * plotScale),
          width: px(CW * plotScale),
          height: px(330 * plotScale),
          touchAction: "pan-y",
          cursor: "crosshair",
        }}
      />
      <p
        data-part="updated"
        style={{
          ...textBase,
          left: px(wide ? 25 : 45.6),
          top: px(wide ? 25 : 43.6),
          fontSize: px(18.6),
          fontStretch: "107.7%",
          fontWeight: 200,
          color: "#99a3b6",
        }}
      >
        {updatedText}
      </p>
      {periods.length > 0 && (
        <>
          <button
            ref={pillRef}
            type="button"
            aria-label={`${title} period: ${current}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            style={{
              position: "absolute",
              right: px(46),
              top: px(35),
              height: px(37),
              borderRadius: px(18.5),
              border: 0,
              padding: `0 ${px(19.8)} 0 ${px(19.4)}`,
              display: "flex",
              alignItems: "flex-start",
              gap: px(6.72),
              background: "rgba(255,255,255,.13)",
              cursor: "pointer",
              color: "#b9cdf2",
              fontFamily: font,
              outlineOffset: 2,
            }}
          >
            <span
              data-part="period"
              style={{
                ...textBase,
                position: "relative",
                display: "block",
                marginTop: px(10.6),
                fontSize: px(17.2),
                fontStretch: "115%",
                fontWeight: 200,
                color: "#acc1e7",
              }}
            >
              {current}
            </span>
            <svg
              viewBox="0 0 12 7"
              aria-hidden
              style={{
                flex: "none",
                marginTop: px(15.9),
                width: px(12),
                height: px(7),
                overflow: "visible",
                transition: "transform .2s ease",
                transform: open ? "rotate(180deg)" : "none",
              }}
            >
              <path
                d="M0.8 0.8 L6 6 L11.2 0.8"
                fill="none"
                stroke="#9fb7e0"
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </button>
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Period"
            style={{
              position: "absolute",
              right: px(46),
              top: px(80),
              minWidth: px(150),
              padding: px(6),
              borderRadius: px(16),
              zIndex: 3,
              background: "rgba(20,34,64,.55)",
              border: "1px solid rgba(255,255,255,.12)",
              boxShadow:
                "0 18px 40px -12px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.08)",
              backdropFilter: "blur(18px) saturate(150%)",
              WebkitBackdropFilter: "blur(18px) saturate(150%)",
              transformOrigin: "top right",
              transition:
                "opacity .18s ease, transform .22s cubic-bezier(.2,.9,.3,1.2), visibility .22s",
              opacity: open ? 1 : 0,
              transform: open ? "none" : `translateY(${px(-6)}) scale(.96)`,
              visibility: open ? "visible" : "hidden",
            }}
          >
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                role="option"
                aria-selected={p === current}
                onClick={() => choose(p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  height: px(36),
                  padding: `0 ${px(12)}`,
                  border: 0,
                  borderRadius: px(10),
                  background:
                    p === current ? "rgba(255,255,255,.09)" : "transparent",
                  cursor: "pointer",
                  color: p === current ? "#e6eeff" : "#aebcd6",
                  fontFamily: font,
                  fontStretch: "116%",
                  fontSize: px(15.5),
                  textAlign: "left",
                }}
                onPointerEnter={(e) => {
                  if (p !== current)
                    e.currentTarget.style.background = "rgba(255,255,255,.06)";
                }}
                onPointerLeave={(e) => {
                  if (p !== current)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {p}
                {p === current && (
                  <svg
                    viewBox="0 0 12 9"
                    aria-hidden
                    style={{ width: px(12), height: px(9) }}
                  >
                    <path
                      d="M1 4.6 L4.4 8 L11 1"
                      fill="none"
                      stroke="#9fc0ff"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
      <div
        ref={readRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 2,
          display: "flex",
          alignItems: "baseline",
          gap: px(7),
          padding: `${px(7)} ${px(11)}`,
          borderRadius: px(11),
          background: "rgba(18,36,72,.55)",
          border: "1px solid rgba(160,195,255,.18)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          whiteSpace: "nowrap",
          fontFamily: font,
          fontStretch: "116%",
        }}
      >
        <span
          ref={readValRef}
          style={{ fontSize: px(16), fontWeight: 600, color: "#fff" }}
        />
        <span
          ref={readLabRef}
          style={{ fontSize: px(12.5), color: "#9fb0cc" }}
        />
      </div>
      <p
        data-part="title"
        style={{
          ...textBase,
          left: px(wide ? 25 : 0),
          right: 0,
          textAlign: wide ? "left" : "center",
          top: px(wide ? 52 : 441.4),
          fontSize: px(wide ? 37 : 20.2),
          pointerEvents: "none",
          fontStretch: "115%",
          fontWeight: 200,
          color: "#9298a5",
        }}
      >
        {title}
      </p>
      <div
        ref={numRef}
        aria-hidden
        style={{
          position: "absolute",
          left: px(wide ? 25 : 0),
          right: 0,
          top: px(wide ? 143 : 469),
          display: "flex",
          justifyContent: wide ? "flex-start" : "center",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div
          data-part="value"
          style={{
            position: "relative",
            fontFamily: font,
            fontWeight: 500,
            fontSize: px(wide ? 54 : 89.2),
            lineHeight: 1,
            letterSpacing: px(-0.5),
            whiteSpace: "nowrap",
            marginLeft: px(wide ? 0 : -8.5),
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-block",
              fontVariantNumeric: "tabular-nums",
              fontStretch: "106%",
            }}
          >
            <span style={{ visibility: "hidden" }}>{finalDigits}</span>
            <span
              ref={digitsRef}
              style={{ position: "absolute", right: 0, top: 0 }}
            >
              {finalDigits}
            </span>
          </span>
          <span
            data-part="suffix"
            style={{
              display: "inline-block",
              fontStretch: "76%",
              marginLeft: px(1.5),
              marginRight: px(-4),
              transform: "scaleX(.93)",
              transformOrigin: "0 50%",
            }}
          >
            {valueSuffix}
          </span>
          {trend !== "none" && (
            <svg
              ref={arrowRef}
              viewBox="0 0 8 8"
              aria-hidden
              style={{
                position: "absolute",
                left: "100%",
                marginLeft: px(5.5),
                top: px(16.4),
                width: px(7),
                height: px(7),
                overflow: "visible",
                transformOrigin: "0% 100%",
                opacity: 0,
                rotate: trend === "down" ? "90deg" : undefined,
              }}
            >
              <path
                d="M0.6 7.4 L7.2 0.8 M2 0.6 L7.4 0.6 L7.4 6"
                fill="none"
                stroke={trendColor}
                strokeWidth={1.1}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>
      </div>
      <p
        data-part="caption"
        style={{
          ...textBase,
          left: px(wide ? 25 : 0),
          right: 0,
          textAlign: wide ? "left" : "center",
          pointerEvents: "none",
          top: px(wide ? 99 : 560.9),
          fontSize: px(wide ? 16 : 11.6),
          fontStretch: "108%",
          fontWeight: 250,
          color: "#9299a8",
        }}
      >
        {caption}
      </p>
    </div>
  );
  if (!backdrop)
    return (
      <div
        ref={rootRef}
        className={className}
        style={{ display: "inline-block", ...style }}
      >
        {cardEl}
      </div>
    );
  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: BACKDROP,
        backgroundImage: grain ? `url(${grain})` : undefined,
        backgroundSize: "160px 160px",
        ...style,
      }}
    >
      {cardEl}
    </div>
  );
}
export default PeakChart;
