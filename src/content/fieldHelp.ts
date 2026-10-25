import { useI18n, type Lang } from '../i18n'

type Help = Record<string, { en: string; id: string }>

const help: Help = {
  'gpr.frequency': {
    en: 'Antenna centre frequency. Higher frequencies give finer resolution but stronger attenuation and shallower penetration.',
    id: 'Frekuensi pusat antena. Frekuensi tinggi memberi resolusi lebih halus tetapi atenuasi lebih kuat dan penetrasi lebih dangkal.',
  },
  'gpr.permittivity': {
    en: 'Relative permittivity controls radar velocity (v = c/√εr). Water increases εr and slows the wave.',
    id: 'Permitivitas relatif mengontrol kecepatan radar (v = c/√εr). Air meningkatkan εr dan memperlambat gelombang.',
  },
  'gpr.conductivity': {
    en: 'Electrical conductivity controls attenuation. Clay and saline water strongly reduce penetration.',
    id: 'Konduktivitas listrik mengontrol atenuasi. Lempung dan air asin sangat mengurangi penetrasi.',
  },
  'gpr.spacing': {
    en: 'Trace spacing along the profile. It must be fine enough to sample dipping reflections and small targets.',
    id: 'Jarak antar-trace sepanjang lintasan. Harus cukup rapat untuk merekam refleksi miring dan target kecil.',
  },
  'gpr.noise': {
    en: 'Adds reproducible random noise to each trace so the synthetic radargram resembles field data.',
    id: 'Menambahkan derau acak yang dapat direproduksi agar radargram sintetik menyerupai data lapangan.',
  },
  'mag.inclination': {
    en: 'Geomagnetic inclination of the inducing field. It changes anomaly symmetry and the position of maxima and minima.',
    id: 'Inklinasi medan geomagnetik. Nilai ini mengubah simetri anomali serta posisi maksimum dan minimum.',
  },
  'mag.declination': {
    en: 'Angle between magnetic north and true north. It rotates the horizontal projection of the source magnetisation.',
    id: 'Sudut antara utara magnetik dan utara sebenarnya. Nilai ini memutar proyeksi horizontal magnetisasi sumber.',
  },
  'mag.field': {
    en: 'Strength of the regional geomagnetic field. Anomaly amplitude scales approximately with this value.',
    id: 'Kuat medan geomagnetik regional. Amplitudo anomali kira-kira berskala dengan nilai ini.',
  },
  'mag.susceptibility': {
    en: 'Magnetic susceptibility contrast (SI). Larger contrasts produce stronger anomalies for the same body.',
    id: 'Kontras suseptibilitas magnetik (SI). Kontras lebih besar menghasilkan anomali lebih kuat pada benda yang sama.',
  },
  'mag.spacing': {
    en: 'Station spacing along the profile. Coarse spacing can alias narrow anomalies.',
    id: 'Jarak antar-stasiun sepanjang lintasan. Jarak terlalu lebar dapat menyebabkan aliasing anomali sempit.',
  },
  'grv.density': {
    en: 'Density contrast between the body and its surroundings. Negative values model a low-density body such as salt or peat.',
    id: 'Kontras densitas antara benda dan sekitarnya. Nilai negatif memodelkan benda berdensitas rendah seperti garam atau gambut.',
  },
  'grv.depth': {
    en: 'Depth to the centre or top of the body. Deeper sources produce broader and weaker anomalies.',
    id: 'Kedalaman pusat atau atas benda. Sumber lebih dalam menghasilkan anomali lebih lebar dan lemah.',
  },
  'grv.regional': {
    en: 'A linear regional trend removes the long-wavelength background that would otherwise dominate the residual anomaly.',
    id: 'Tren regional linear menghilangkan latar gelombang panjang yang jika tidak dihilangkan akan mendominasi anomali residual.',
  },
  'refl.frequency': {
    en: 'Dominant source frequency. Higher frequencies improve vertical resolution but are attenuated faster.',
    id: 'Frekuensi dominan sumber. Frekuensi tinggi meningkatkan resolusi vertikal tetapi lebih cepat teratenuasi.',
  },
  'refl.spread': {
    en: 'Maximum source–receiver offset. Longer spreads improve velocity information but reduce shallow resolution.',
    id: 'Offset maksimum sumber–receiver. Spread panjang meningkatkan informasi kecepatan tetapi mengurangi resolusi dangkal.',
  },
  'refl.velocity': {
    en: 'P-wave velocity of the layer. It controls two-way travel time and the reflection coefficient at each interface.',
    id: 'Kecepatan gelombang P lapisan. Nilai ini mengontrol waktu tempuh dua arah dan koefisien refleksi pada setiap batas.',
  },
  'refr.offset': {
    en: 'Source offset from the first geophone. A nonzero offset avoids recording the source pulse directly.',
    id: 'Offset sumber dari geophone pertama. Offset bukan nol menghindari perekaman pulsa sumber secara langsung.',
  },
  'refr.spacing': {
    en: 'Geophone spacing. It sets the spatial resolution and the maximum depth that can be resolved with the spread length.',
    id: 'Jarak antar-geophone. Nilai ini menentukan resolusi spasial dan kedalaman maksimum yang dapat diselesaikan dengan panjang spread.',
  },
  'refr.velocity': {
    en: 'Layer P-wave velocity. The slope of each first-arrival branch is inversely related to velocity.',
    id: 'Kecepatan gelombang P lapisan. Kemiringan setiap cabang first-arrival berbanding terbalik dengan kecepatan.',
  },
  'ves.array': {
    en: 'Electrode configuration. Wenner has strong signal and good depth resolution; dipole–dipole is more sensitive to lateral changes.',
    id: 'Konfigurasi elektroda. Wenner memiliki sinyal kuat dan resolusi kedalaman baik; dipole–dipole lebih sensitif terhadap perubahan lateral.',
  },
  'ves.spacing': {
    en: 'Electrode spacing controls the depth of investigation. Larger spacing samples deeper but reduces near-surface detail.',
    id: 'Jarak elektroda mengontrol kedalaman penyelidikan. Jarak lebih besar menjangkau lebih dalam tetapi mengurangi detail dekat permukaan.',
  },
  'ves.resistivity': {
    en: 'True layer resistivity. Contrasts between layers create the measured apparent-resistivity curve.',
    id: 'Resistivitas sebenarnya lapisan. Kontras antar-lapisan membentuk kurva resistivitas semu terukur.',
  },
  'hvsr.vs': {
    en: 'Shear-wave velocity of the layer. The H/V peak frequency is controlled mainly by the average Vs and thickness above the impedance contrast.',
    id: 'Kecepatan gelombang geser lapisan. Frekuensi puncak H/V terutama dikontrol oleh Vs rata-rata dan ketebalan di atas kontras impedansi.',
  },
  'hvsr.thickness': {
    en: 'Layer thickness. A thicker low-velocity layer lowers the fundamental H/V peak frequency.',
    id: 'Ketebalan lapisan. Lapisan berkecepatan rendah yang lebih tebal menurunkan frekuensi puncak H/V fundamental.',
  },
  'hvsr.halfspace': {
    en: 'Shear-wave velocity of the underlying half-space. A strong contrast with the surface layers produces a clear H/V peak.',
    id: 'Kecepatan gelombang geser half-space di bawahnya. Kontras kuat dengan lapisan permukaan menghasilkan puncak H/V yang jelas.',
  },
  'hvsr.qs': {
    en: 'Shear-wave quality factor Qs. Lower Qs means stronger attenuation and a more damped high-frequency response.',
    id: 'Faktor kualitas gelombang geser Qs. Qs lebih rendah berarti atenuasi lebih kuat dan respons frekuensi tinggi lebih teredam.',
  },
  'hvsr.noise': {
    en: 'Gaussian noise added to the synthetic H/V curve. Use 0% for a smooth deterministic curve.',
    id: 'Derau Gaussian yang ditambahkan ke kurva H/V sintetik. Gunakan 0% untuk kurva deterministik yang halus.',
  },
  'hvsr.layers': {
    en: 'Number of layers searched by the inversion. More layers increase flexibility but also non-uniqueness.',
    id: 'Jumlah lapisan yang dicari oleh inversi. Lebih banyak lapisan meningkatkan fleksibilitas tetapi juga ketidakunikan.',
  },
  'hvsr.iterations': {
    en: 'Number of neighbourhood search iterations. More iterations refine the ensemble but take longer.',
    id: 'Jumlah iterasi pencarian lingkungan. Lebih banyak iterasi memperhalus ensemble tetapi memerlukan waktu lebih lama.',
  },
}

export function helpText(key: string, lang: Lang): string | undefined {
  return help[key]?.[lang]
}

export function useFieldHelp(): (key: string) => string | undefined {
  const { lang } = useI18n()
  return (key: string) => helpText(key, lang)
}
