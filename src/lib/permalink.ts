import { methodById, type MethodId } from '../content/methods'

const VERSION = 1

interface ScenarioPayload {
  v: number
  m: MethodId
  s: string
  i: unknown
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(text: string): string {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeScenario(methodId: MethodId, scenarioId: string, input: unknown): string {
  const payload: ScenarioPayload = { v: VERSION, m: methodId, s: scenarioId, i: input }
  return toBase64Url(JSON.stringify(payload))
}

export function decodeScenario(methodId: MethodId, token: string): { scenarioId: string; input: unknown } | null {
  try {
    const raw = JSON.parse(fromBase64Url(token)) as Partial<ScenarioPayload>
    if (raw.v !== VERSION || raw.m !== methodId || typeof raw.s !== 'string' || raw.i === null || typeof raw.i !== 'object') return null
    return { scenarioId: raw.s, input: raw.i }
  } catch {
    return null
  }
}

export function scenarioUrl(methodId: MethodId, scenarioId: string, input: unknown): string {
  const route = methodById(methodId).route
  const token = encodeScenario(methodId, scenarioId, input)
  return `${window.location.origin}${window.location.pathname}#${route}?d=${token}`
}

export function readScenarioFromLocation(methodId: MethodId): { scenarioId: string; input: unknown } | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  const q = hash.indexOf('?')
  if (q < 0) return null
  const params = new URLSearchParams(hash.slice(q + 1))
  const token = params.get('d')
  return token ? decodeScenario(methodId, token) : null
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}
