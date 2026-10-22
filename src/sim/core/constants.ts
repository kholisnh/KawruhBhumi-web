/** Physical constants (SI, CODATA/2019 unless noted). */
export const C0 = 2.99792458e8 // speed of light in vacuum [m/s] (exact)
export const MU0 = 4 * Math.PI * 1e-7 // vacuum permeability [H/m]
export const EPS0 = 8.8541878128e-12 // vacuum permittivity [F/m]
export const G_CONST = 6.6743e-11 // Newtonian constant of gravitation [m^3 kg^-1 s^-2]

/** Unit helpers. */
export const nsToS = (ns: number) => ns * 1e-9
export const sToNs = (s: number) => s * 1e9
export const mSmToSm = (mSm: number) => mSm * 1e-3 // millisiemens/m -> siemens/m
