interface LText {
  en: string
  id: string
}

export interface GlossaryTerm {
  term: string
  symbol?: string
  body: LText
}

export interface FormulaEntry {
  title: LText
  latex: string
  body: LText
}

export const glossary: GlossaryTerm[] = [
  {
    term: 'Relative permittivity',
    symbol: 'εr',
    body: {
      en: 'How strongly a material stores electric energy relative to vacuum. It controls GPR wave velocity and reflection strength.',
      id: 'Seberapa kuat material menyimpan energi listrik relatif terhadap vakum. Mengendalikan kecepatan gelombang GPR dan kekuatan refleksi.',
    },
  },
  {
    term: 'Electrical conductivity',
    symbol: 'σ',
    body: {
      en: 'Ability to carry electric current, measured in S/m. Conductive ground attenuates GPR signals quickly.',
      id: 'Kemampuan menghantarkan arus listrik, dalam S/m. Tanah konduktif meredam sinyal GPR dengan cepat.',
    },
  },
  {
    term: 'Magnetic susceptibility',
    symbol: 'χ',
    body: {
      en: 'Dimensionless measure of induced magnetization. It controls the amplitude of magnetic anomalies.',
      id: 'Ukuran magnetisasi induksi tanpa dimensi. Mengendalikan amplitudo anomali magnetik.',
    },
  },
  {
    term: 'Density contrast',
    symbol: 'Δρ',
    body: {
      en: 'Difference in density between a body and its surroundings, in kg/m³. It sets the sign and amplitude of a gravity anomaly.',
      id: 'Selisih densitas antara benda dan sekitarnya, dalam kg/m³. Menentukan tanda dan amplitudo anomali gravitasi.',
    },
  },
  {
    term: 'P-wave velocity',
    symbol: 'Vp',
    body: {
      en: 'Speed of compressional waves. It depends on bulk modulus, shear modulus and density.',
      id: 'Kecepatan gelombang kompresi. Bergantung pada modulus bulk, modulus geser, dan densitas.',
    },
  },
  {
    term: 'S-wave velocity',
    symbol: 'Vs',
    body: {
      en: 'Speed of shear waves. It is the key parameter in HVSR and controls the fundamental resonance frequency.',
      id: 'Kecepatan gelombang geser. Parameter kunci pada HVSR dan mengendalikan frekuensi resonansi fundamental.',
    },
  },
  {
    term: 'Acoustic impedance',
    symbol: 'Z',
    body: {
      en: 'Product of density and wave velocity, Z = ρV. Contrasts in Z produce seismic reflections.',
      id: 'Hasil kali densitas dan kecepatan gelombang, Z = ρV. Kontras Z menghasilkan refleksi seismik.',
    },
  },
  {
    term: 'H/V spectral ratio',
    symbol: 'H/V',
    body: {
      en: 'Ratio of horizontal to vertical Fourier spectra from ambient vibration. Its peak estimates the site fundamental frequency.',
      id: 'Rasio spektrum Fourier horizontal terhadap vertikal dari getaran ambien. Puncaknya memperkirakan frekuensi fundamental situs.',
    },
  },
  {
    term: 'Fundamental frequency',
    symbol: 'f0',
    body: {
      en: 'Lowest resonance frequency of a layered soil column, approximately Vs/(4H) for a soft layer over a hard half-space.',
      id: 'Frekuensi resonansi terendah kolom tanah berlapis, kira-kira Vs/(4H) untuk lapisan lunak di atas half-space keras.',
    },
  },
  {
    term: 'Amplification',
    symbol: 'A0',
    body: {
      en: 'Height of the H/V peak. It reflects the impedance contrast but is also affected by attenuation and layer structure.',
      id: 'Tinggi puncak H/V. Mencerminkan kontras impedansi tetapi juga dipengaruhi atenuasi dan struktur lapisan.',
    },
  },
  {
    term: 'Normal moveout',
    symbol: 'NMO',
    body: {
      en: 'Increase in reflection travel time with source–receiver offset. The curvature is used to estimate stacking velocity.',
      id: 'Kenaikan waktu tempuh refleksi terhadap offset sumber–penerima. Kelengkungannya dipakai untuk memperkirakan kecepatan stacking.',
    },
  },
  {
    term: 'Equivalence',
    body: {
      en: 'Different subsurface models can fit the same measurements within uncertainty. It is a central limit of geophysical inversion.',
      id: 'Model bawah permukaan berbeda dapat cocok dengan pengukuran yang sama dalam batas ketidakpastian. Ini batas penting inversi geofisika.',
    },
  },
]

export const formulas: FormulaEntry[] = [
  {
    title: { en: 'GPR wave velocity', id: 'Kecepatan gelombang GPR' },
    latex: 'v \\approx \\frac{c}{\\sqrt{\\varepsilon_r}}',
    body: {
      en: 'For low-loss, non-magnetic ground. Higher permittivity means a slower wave and a shorter wavelength.',
      id: 'Untuk tanah non-magnetik dengan rugi rendah. Permitivitas lebih tinggi berarti gelombang lebih lambat dan panjang gelombang lebih pendek.',
    },
  },
  {
    title: { en: 'Two-way travel time', id: 'Waktu tempuh dua arah' },
    latex: 't = \\frac{2z}{v}',
    body: {
      en: 'Relates reflector depth z to the two-way arrival time t once the velocity is known.',
      id: 'Menghubungkan kedalaman reflektor z dengan waktu tiba dua arah t setelah kecepatan diketahui.',
    },
  },
  {
    title: { en: 'Reflection coefficient', id: 'Koefisien refleksi' },
    latex: 'R = \\frac{Z_2 - Z_1}{Z_2 + Z_1}',
    body: {
      en: 'Normal-incidence reflection strength for acoustic impedance Z = ρV. The sign indicates the polarity of the reflection.',
      id: 'Kekuatan refleksi pada insidensi normal untuk impedansi akustik Z = ρV. Tandanya menunjukkan polaritas refleksi.',
    },
  },
  {
    title: { en: 'Critical refraction', id: 'Refraksi kritis' },
    latex: '\\sin i_c = \\frac{V_1}{V_2}',
    body: {
      en: 'Critical angle for a head wave when the lower layer is faster (V2 > V1).',
      id: 'Sudut kritis untuk gelombang kepala ketika lapisan bawah lebih cepat (V2 > V1).',
    },
  },
  {
    title: { en: 'Wenner apparent resistivity', id: 'Resistivitas semu Wenner' },
    latex: '\\rho_a = 2\\pi a \\frac{\\Delta V}{I}',
    body: {
      en: 'Apparent resistivity for equal electrode spacing a. It is a weighted average of the true subsurface resistivity.',
      id: 'Resistivitas semu untuk spasi elektroda sama a. Ini rata-rata terbobot resistivitas bawah permukaan sebenarnya.',
    },
  },
  {
    title: { en: 'Gravity of a sphere', id: 'Gravitasi bola' },
    latex: 'g_z = \\frac{4}{3}\\pi G\\rho R^3 \\frac{z}{(x^2+z^2)^{3/2}}',
    body: {
      en: 'Vertical attraction of a uniform sphere. Peak amplitude scales with volume; width scales with depth.',
      id: 'Tarikan vertikal bola seragam. Amplitudo puncak berskala volume; lebar berskala kedalaman.',
    },
  },
  {
    title: { en: 'Magnetic dipole falloff', id: 'Redaman dipol magnetik' },
    latex: '\\Delta T \\propto \\frac{\\chi F_0}{r^3}',
    body: {
      en: 'First-order dipole decay with distance r. It explains why deeper sources produce broader, weaker anomalies.',
      id: 'Redaman dipol orde pertama terhadap jarak r. Menjelaskan mengapa sumber lebih dalam menghasilkan anomali lebih lebar dan lemah.',
    },
  },
  {
    title: { en: 'HVSR quarter-wave estimate', id: 'Estimasi seperempat gelombang HVSR' },
    latex: 'f_0 \\approx \\frac{\\bar V_s}{4H}',
    body: {
      en: 'Approximate fundamental frequency for a soft layer of thickness H over a hard half-space.',
      id: 'Perkiraan frekuensi fundamental untuk lapisan lunak setebal H di atas half-space keras.',
    },
  },
]
