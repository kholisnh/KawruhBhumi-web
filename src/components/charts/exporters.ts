/** CSV and PNG export helpers (client-side only; native Android via Capacitor). */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean
}

function isNativePlatform(): boolean {
  return Boolean((globalThis as { Capacitor?: CapacitorGlobal }).Capacitor?.isNativePlatform?.())
}

/**
 * Native (Android/iOS) saves go to the app cache and open the system share
 * sheet — WebView ignores Blob downloads and needs no storage permissions
 * for the cache directory.
 */
async function saveNativeFile(filename: string, data: string): Promise<void> {
  const { Directory, Filesystem } = await import('@capacitor/filesystem')
  const { Share } = await import('@capacitor/share')
  const res = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache, recursive: true })
  try {
    await Share.share({ title: filename, files: [res.uri] })
  } catch {
    /* dismissed or unavailable — the file stays in the app cache */
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result)
      resolve(s.slice(s.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function downloadBlob(filename: string, blob: Blob): void {
  if (isNativePlatform()) {
    void blobToBase64(blob)
      .then((b64) => saveNativeFile(filename, b64))
      .catch(() => undefined)
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: string | number): string {
  const s = typeof value === 'number' ? String(value) : value
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportCsv(filename: string, header: string[], rows: Array<Array<string | number>>): void {
  const lines = [header.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))]
  downloadBlob(filename, new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
}

/**
 * Radargram matrix as a long-format CSV with metadata comments:
 * meta rows first (prefixed with #), then columns: x_m, t_ns, amplitude
 */
export function exportRadargramCsv(
  filename: string,
  meta: Array<[string, string]>,
  x: number[],
  tNs: number[],
  radargram: number[][],
): void {
  const out: string[] = []
  out.push('# KawruhBhumi Lab — synthetic GPR radargram (normalized relative amplitude)')
  for (const [k, v] of meta) out.push(`# ${k}: ${v}`)
  out.push('x_m,t_ns,amplitude')
  for (let i = 0; i < radargram.length; i++) {
    const trace = radargram[i]
    for (let s = 0; s < trace.length; s++) {
      out.push(`${x[i]},${tNs[s]},${trace[s]}`)
    }
  }
  downloadBlob(filename, new Blob([out.join('\n')], { type: 'text/csv;charset=utf-8' }))
}

export function exportPlotPng(el: HTMLElement, filename: string, scale = 2): void {
  void import('./Plot').then(({ loadPlotly }) =>
    loadPlotly().then(async (plotly) => {
      if (isNativePlatform()) {
        try {
          const dataUrl = await plotly.toImage(el, { format: 'png', scale })
          await saveNativeFile(filename, dataUrl.slice(dataUrl.indexOf(',') + 1))
        } catch {
          /* ignore */
        }
        return
      }
      await plotly.downloadImage(el, { format: 'png', filename: filename.replace(/\.png$/, ''), scale }).catch(() => undefined)
    }),
  )
}

/** Rasterize an inline SVG element to a PNG download (white background). */
export function exportSvgPng(svg: SVGSVGElement, filename: string, scale = 2): void {
  const viewBox = svg.viewBox.baseVal
  const w = (viewBox && viewBox.width) || svg.clientWidth || 1000
  const h = (viewBox && viewBox.height) || svg.clientHeight || 600

  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  const xml = new XMLSerializer().serializeToString(clone)
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(filename, blob)
      }, 'image/png')
    }
  }
  img.src = svgUrl
}
