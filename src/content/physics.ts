import type { MethodId } from './methods'

/**
 * Language-neutral physics content for the "One Earth. Five Physical
 * Perspectives." section. Variable meanings and assumption lists live in the
 * i18n dictionaries (physics.methods[id]).
 */

export interface PhysicsEquation {
  latex: string
}

export interface PhysicsVariable {
  /** LaTeX symbol as displayed. */
  sym: string
  /** Key into d.physics.methods[id].variables. */
  meaningKey: string
  /** SI unit (conventional display unit noted in parentheses). */
  unit: string
}

export interface PhysicsMethodContent {
  id: MethodId
  equations: PhysicsEquation[]
  variables: PhysicsVariable[]
  refIds: string[]
}

export const physicsContent: Record<MethodId, PhysicsMethodContent> = {
  gpr: {
    id: 'gpr',
    equations: [
      { latex: 'v \\approx \\frac{c}{\\sqrt{\\varepsilon_r}}' },
      { latex: 'R = \\frac{\\sqrt{\\varepsilon_{r1}} - \\sqrt{\\varepsilon_{r2}}}{\\sqrt{\\varepsilon_{r1}} + \\sqrt{\\varepsilon_{r2}}}' },
      { latex: 't_{\\mathrm{TWT}} = \\frac{2z}{v}' },
      { latex: '\\alpha = \\frac{\\sigma}{2}\\sqrt{\\frac{\\mu_0}{\\varepsilon_0\\,\\varepsilon_r}}' },
    ],
    variables: [
      { sym: 'v', meaningKey: 'v', unit: 'm·s⁻¹' },
      { sym: 'c', meaningKey: 'c', unit: 'm·s⁻¹' },
      { sym: '\\varepsilon_r', meaningKey: 'εr', unit: 'dimensionless' },
      { sym: 't_{\\mathrm{TWT}}', meaningKey: 't', unit: 's (ns displayed)' },
      { sym: 'z', meaningKey: 'z', unit: 'm' },
      { sym: 'R', meaningKey: 'R', unit: 'dimensionless' },
    ],
    refIds: ['jol2009', 'knight2001', 'reynolds2011', 'topp1980'],
  },
  magnetic: {
    id: 'magnetic',
    equations: [
      {
        latex:
          '\\mathbf{B}(\\mathbf{r}) = \\frac{\\mu_0}{4\\pi r^3}\\left[3(\\mathbf{m}\\cdot\\hat{\\mathbf{r}})\\hat{\\mathbf{r}} - \\mathbf{m}\\right]',
      },
    ],
    variables: [
      { sym: '\\mathbf{B}', meaningKey: 'B', unit: 'T (nT displayed)' },
      { sym: '\\mu_0', meaningKey: 'mu0', unit: 'H·m⁻¹' },
      { sym: '\\mathbf{m}', meaningKey: 'm', unit: 'A·m²' },
      { sym: 'r', meaningKey: 'r', unit: 'm' },
      { sym: '\\hat{\\mathbf{r}}', meaningKey: 'rhat', unit: 'dimensionless' },
    ],
    refIds: ['blakely1995', 'hinze2013', 'telford1990'],
  },
  gravity: {
    id: 'gravity',
    equations: [
      { latex: '\\mathbf{g}(\\mathbf{r}) = -GM\\,\\frac{\\mathbf{r}}{r^3}' },
      {
        latex:
          '\\Delta\\mathbf{g}(\\mathbf{r}) = G\\int_V \\Delta\\rho(\\mathbf{r}\')\\,\\frac{\\mathbf{r}\' - \\mathbf{r}}{|\\mathbf{r}\' - \\mathbf{r}|^3}\\,dV\'',
      },
    ],
    variables: [
      { sym: '\\mathbf{g}', meaningKey: 'g', unit: 'm·s⁻² (mGal displayed: 1 mGal = 10⁻⁵ m·s⁻²)' },
      { sym: 'G', meaningKey: 'G', unit: 'm³·kg⁻¹·s⁻²' },
      { sym: 'M', meaningKey: 'M', unit: 'kg' },
      { sym: 'r', meaningKey: 'r', unit: 'm' },
      { sym: '\\Delta\\rho', meaningKey: 'rho', unit: 'kg·m⁻³' },
      { sym: '\\mathbf{r}\'', meaningKey: 'rq', unit: 'm' },
      { sym: '\\mathbf{r}', meaningKey: 'rr', unit: 'm' },
    ],
    refIds: ['nagy2000', 'blakely1995', 'hinze2013', 'telford1990'],
  },
  reflection: {
    id: 'reflection',
    equations: [
      { latex: 'Z = \\rho\\,V_P' },
      { latex: 'R = \\frac{Z_2 - Z_1}{Z_2 + Z_1}' },
      { latex: 's(t) = w(t) * r(t)' },
      { latex: 't_0 = \\frac{2z}{V_P}' },
    ],
    variables: [
      { sym: 'Z', meaningKey: 'Z', unit: 'kg·m⁻²·s⁻¹' },
      { sym: '\\rho', meaningKey: 'rho', unit: 'kg·m⁻³' },
      { sym: 'V_P', meaningKey: 'Vp', unit: 'm·s⁻¹' },
      { sym: 'R', meaningKey: 'R', unit: 'dimensionless' },
      { sym: 's(t)', meaningKey: 's', unit: 'a.u.' },
      { sym: 'w(t)', meaningKey: 'w', unit: 'a.u.' },
      { sym: 'r(t)', meaningKey: 'r', unit: 'dimensionless' },
      { sym: 't_0', meaningKey: 't0', unit: 's (ms displayed)' },
      { sym: 'z', meaningKey: 'z', unit: 'm' },
    ],
    refIds: ['sheriff1995', 'yilmaz2001', 'shearer2019'],
  },
  refraction: {
    id: 'refraction',
    equations: [
      { latex: '\\frac{\\sin i_1}{V_1} = \\frac{\\sin i_2}{V_2}' },
      { latex: 't_d(x) = \\frac{x}{V_1}', },
      { latex: 't_h(x) = t_i + \\frac{x}{V_2}' },
      { latex: 't_i = \\frac{2h\\cos i_c}{V_1}, \\qquad \\sin i_c = \\frac{V_1}{V_2}' },
    ],
    variables: [
      { sym: 'i_1, i_2', meaningKey: 'i', unit: 'rad (deg displayed)' },
      { sym: 'V_1, V_2', meaningKey: 'V', unit: 'm·s⁻¹' },
      { sym: 'x', meaningKey: 'x', unit: 'm' },
      { sym: 'h', meaningKey: 'h', unit: 'm' },
      { sym: 't_d', meaningKey: 'td', unit: 's' },
      { sym: 't_h', meaningKey: 'th', unit: 's' },
      { sym: 't_i', meaningKey: 'ti', unit: 's' },
      { sym: 'i_c', meaningKey: 'ic', unit: 'rad (deg displayed)' },
    ],
    refIds: ['palmer1980', 'sheriff1995', 'shearer2019'],
  },
  resistivity: {
    id: 'resistivity',
    equations: [
      { latex: '\\rho_a = \\frac{2\\pi\\,\\Delta V}{I}\\left[\\frac{1}{AM}-\\frac{1}{BM}-\\frac{1}{AN}+\\frac{1}{BN}\\right]^{-1}' },
      { latex: 'T_j = \\rho_j\\,\\frac{T_{j+1}+\\rho_j\\tanh(\\lambda h_j)}{\\rho_j+T_{j+1}\\tanh(\\lambda h_j)}' },
      { latex: 'V(r) = \\frac{I}{2\\pi}\\left[\\frac{\\rho_1}{r}+\\int_0^\\infty (T(\\lambda)-\\rho_1)J_0(\\lambda r)\\,d\\lambda\\right]' },
      { latex: '\\rho_a^{\\mathrm{Wenner}} = \\rho_1 + 2a\\left[J(a)-J(2a)\\right]' },
    ],
    variables: [
      { sym: '\\rho_a', meaningKey: 'rhoA', unit: 'Ω·m' },
      { sym: '\\Delta V', meaningKey: 'dV', unit: 'V (mV displayed)' },
      { sym: 'I', meaningKey: 'I', unit: 'A (mA displayed)' },
      { sym: '\\rho_j', meaningKey: 'rhoj', unit: 'Ω·m' },
      { sym: 'h_j', meaningKey: 'hj', unit: 'm' },
      { sym: '\\lambda', meaningKey: 'lambda', unit: 'm⁻¹' },
      { sym: 'a', meaningKey: 'a', unit: 'm' },
    ],
    refIds: ['koefoed1979', 'loke2004', 'telford1990'],
  },
  hvsr: {
    id: 'hvsr',
    equations: [
      { latex: '\\mathrm{HV}(f) = \\frac{\\sqrt{H_N^2(f)+H_E^2(f)}}{V_Z(f)}' },
      { latex: 'f_0 \\approx \\frac{V_S}{4H}' },
      { latex: 'A_0 \\approx \\frac{Z_{\\mathrm{base}}}{Z_{\\mathrm{soil}}}' },
      { latex: '\\chi^2 = \\frac{1}{N}\\sum_i \\left[\\ln \\mathrm{HV}_{\\mathrm{obs}}(f_i)-\\ln \\mathrm{HV}_{\\mathrm{mod}}(f_i)\\right]^2' },
    ],
    variables: [
      { sym: 'H_N, H_E', meaningKey: 'h', unit: 'm·s⁻¹ (spectral amplitude)' },
      { sym: 'V_Z', meaningKey: 'v', unit: 'm·s⁻¹ (spectral amplitude)' },
      { sym: 'f_0', meaningKey: 'f0', unit: 'Hz' },
      { sym: 'A_0', meaningKey: 'a0', unit: 'dimensionless' },
      { sym: 'V_S', meaningKey: 'vs', unit: 'm·s⁻¹' },
      { sym: 'H', meaningKey: 'H', unit: 'm' },
      { sym: 'Z', meaningKey: 'Z', unit: 'kg·m⁻²·s⁻¹' },
    ],
    refIds: ['wathelet2004', 'wathelet2008', 'sesame2004'],
  },
}
