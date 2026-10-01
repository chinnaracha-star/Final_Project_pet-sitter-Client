const ACCOUNT_PATTERNS = [
  /(?<!\d)(\d{3})-(\d)-(\d{5})-(\d)(?!\d)/,
  /(?<!\d)(\d{3})-(\d{3})-(\d{4})(?!\d)/,
  /(?<!\d)(\d{10})(?!\d)/,
  /(?<!\d)(\d{12})(?!\d)/,
]

function accountFromDigits(run: string) {
  if (run.length === 10 || run.length === 12) return run
  if (run.length > 12 && run.length <= 16 && run.slice(-12).startsWith('0')) return run.slice(-12)
  return ''
}

export function extractAccountNumber(text: string): string {
  const normalized = text
    .replace(/(?<=\d)[OoQ]|[OoQ](?=\d)/g, '0')
    .replace(/(?<=\d)[Il|]|[Il|](?=\d)/g, '1')
    .replace(/[.–—]/g, '-')
    .replace(/[^\d-]+/g, ' ')
  const tight = normalized.replace(/\s+/g, '').replace(/-+/g, '-')
  for (const source of [tight, normalized.replace(/\s+/g, '')]) {
    for (const pattern of ACCOUNT_PATTERNS) {
      const match = source.match(pattern)
      if (match && (match[0].includes('-') || match[0].length === 10 || match[0].length === 12)) return match[0]
    }
    for (const run of source.match(/\d{10,16}/g) || []) {
      const account = accountFromDigits(run)
      if (account) return account
    }
  }
  return ''
}

export type OcrWord = { text: string; confidence: number; x0: number; y0: number; x1: number; y1: number }

export function accountFromWords(words: OcrWord[]): string {
  let account = ''
  let confidence = 0
  for (const word of words) {
    if (!/^[\d\s.-]+$/.test(word.text.trim())) continue
    const digits = word.text.replace(/\D/g, '')
    if ((digits.length === 10 || digits.length === 12) && word.confidence >= confidence) {
      account = digits
      confidence = word.confidence
    }
  }
  return confidence >= 50 ? account : ''
}

export type DotBox = { left: number; top: number; width: number; height: number }

// The dotted account line is the tall dashed word, or the band just above "A/C NO."
export function dottedBoxes(words: OcrWord[], imageWidth: number, imageHeight: number): DotBox[] {
  const boxes: DotBox[] = []
  const dashed = words
    .filter(word => word.y0 < imageHeight * 0.55 && /\d/.test(word.text) && /[-–—]/.test(word.text) && word.y1 - word.y0 > 20)
    .sort((a, b) => (b.y1 - b.y0) - (a.y1 - a.y0))[0]
  if (dashed) {
    const left = Math.max(0, dashed.x0 - 5)
    const top = dashed.y0 + 3
    boxes.push({ left, top, width: Math.min(680, imageWidth - left - 16), height: 34 })
  }
  const label = words.filter(word => /no\.?$/i.test(word.text.trim()) && word.y0 < imageHeight * 0.6).sort((a, b) => b.x1 - a.x1)[0]
  if (label) {
    const left = Math.min(imageWidth - 180, label.x1 + 18)
    const top = Math.max(0, label.y0 - 47)
    boxes.push({ left, top, width: Math.min(560, imageWidth - left - 16), height: 36 })
  }
  return boxes.filter(box => box.width > 120 && box.top >= 0 && box.top + box.height <= imageHeight)
}

function dilate(bin: Uint8Array, width: number, height: number) {
  const out = new Uint8Array(width * height).fill(255)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (bin[y * width + x] !== 0) continue
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= height) continue
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          if (xx >= 0 && xx < width) out[yy * width + xx] = 0
        }
      }
    }
  }
  return out
}

export function prepareDotBand(gray: Uint8Array, width: number, height: number) {
  const sorted = [...gray].sort((a, b) => a - b)
  const darkest = sorted[Math.floor(sorted.length * 0.02)]
  const lightest = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.98))]
  const span = lightest - darkest || 1
  const bin = new Uint8Array(gray.length)
  for (let index = 0; index < gray.length; index++) bin[index] = ((gray[index] - darkest) * 255) / span < 105 ? 0 : 255
  return dilate(bin, width, height)
}

function holeStats(bin: Uint8Array, width: number, x0: number, x1: number, y0: number, y1: number) {
  const w = x1 - x0
  const h = y1 - y0
  const seen = new Uint8Array(w * h)
  const dark = (x: number, y: number) => bin[(y0 + y) * width + (x0 + x)] === 0
  const stack: number[] = []
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h || seen[y * w + x] || dark(x, y)) return
    seen[y * w + x] = 1
    stack.push(x, y)
  }
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }
  while (stack.length) {
    const y = stack.pop()!
    const x = stack.pop()!
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }
  let count = 0
  let holeY = 0
  let holeN = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (seen[y * w + x] || dark(x, y)) continue
      count++
      const local = [x, y]
      seen[y * w + x] = 1
      while (local.length) {
        const ly = local.pop()!
        const lx = local.pop()!
        holeY += ly
        holeN++
        for (const [nx, ny] of [[lx + 1, ly], [lx - 1, ly], [lx, ly + 1], [lx, ly - 1]] as const) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || seen[ny * w + nx] || dark(nx, ny)) continue
          seen[ny * w + nx] = 1
          local.push(nx, ny)
        }
      }
    }
  }
  return { count, holeY: holeN ? holeY / holeN / h : 0 }
}

// ponytail: shape rules cover the Kasikorn dot digits 0-6,8,9. A 7 falls through as "?" and the field is left for the user.
export function digitsFromBinary(bin: Uint8Array, width: number, height: number): string {
  const columns: number[] = []
  for (let x = 0; x < width; x++) {
    let ink = 0
    for (let y = 0; y < height; y++) if (bin[y * width + x] === 0) ink++
    columns.push(ink)
  }
  const spans: number[][] = []
  let start = -1
  for (let x = 0; x <= width; x++) {
    const on = x < width && columns[x] > Math.max(2, height * 0.12)
    if (on && start < 0) start = x
    if (!on && start >= 0) {
      if (x - start > 3) spans.push([start, x])
      start = -1
    }
  }
  const glyphs = spans.map(([x0, x1]) => {
    let y0 = height
    let y1 = 0
    for (let y = 0; y < height; y++) {
      for (let x = x0; x < x1; x++) if (bin[y * width + x] === 0) {
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
    }
    const glyphW = x1 - x0
    const glyphH = y1 - y0 + 1
    const inkShare = (xA: number, xB: number, yA: number, yB: number) => {
      let total = 0
      let hit = 0
      for (let y = yA; y < yB; y++) for (let x = xA; x < xB; x++) {
        total++
        if (y >= 0 && y < height && bin[y * width + x] === 0) hit++
      }
      return total ? hit / total : 0
    }
    const third = Math.max(1, Math.floor(glyphH / 3))
    const holes = holeStats(bin, width, x0, x1, y0, y1 + 1)
    const mid = Math.floor((y0 + y1) / 2)
    return {
      w: glyphW,
      h: glyphH,
      holes: holes.count,
      holeY: holes.holeY,
      top: inkShare(x0, x1, y0, y0 + third),
      bottom: inkShare(x0, x1, y0 + glyphH - third, y1 + 1),
      left: inkShare(x0, x0 + Math.floor(glyphW * 0.45), y0, y1 + 1),
      right: inkShare(x1 - Math.floor(glyphW * 0.45), x1, y0, y1 + 1),
      midLeft: inkShare(x0, x0 + Math.floor(glyphW * 0.45), mid - 2, mid + 3),
      midRight: inkShare(x1 - Math.floor(glyphW * 0.45), x1, mid - 2, mid + 3),
    }
  })
  if (!glyphs.length) return ''
  const digitH = Math.max(...glyphs.map(glyph => glyph.h))
  return glyphs.filter(glyph => glyph.h > digitH * 0.7 && glyph.w > digitH * 0.35).map(glyph => {
    if (glyph.holes >= 2) return '8'
    if (glyph.holes === 1 && glyph.holeY < 0.42 && glyph.bottom < 0.5) return '9'
    if (glyph.holes === 1 && glyph.holeY < 0.42) return '5'
    if (glyph.holes === 1 && glyph.holeY > 0.58) return '6'
    if (glyph.holes === 1 && glyph.right > glyph.left + 0.25) return '4'
    if (glyph.holes === 1) return '0'
    if (glyph.holes === 0 && glyph.midLeft < 0.22 && glyph.right - glyph.left < 0.12 && glyph.top > 0.55 && glyph.bottom > 0.6) return '2'
    if (glyph.right > glyph.left + 0.12 && glyph.midRight > glyph.midLeft) return '3'
    if (glyph.bottom > glyph.top + 0.2 && glyph.top < 0.62) return '1'
    return '?'
  }).join('')
}

export function formatAccountNumber(accountNumber: string, bankName = ''): string {
  const digits = accountNumber.replace(/\D/g, '')
  if (digits.length !== 10 || accountNumber.includes('-')) return accountNumber
  if (bankName === 'SCB') return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
}
