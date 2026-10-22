import type { MethodId } from './methods'

export type ReferenceType = 'foundational' | 'teaching' | 'advanced'

export interface Reference {
  id: string
  type: ReferenceType
  /** Methods this reference directly supports; 'general' for cross-cutting works. */
  methods: Array<MethodId | 'general'>
  title: string
  authors: string
  year: number
  venue: string
  url: string
  doi?: string
  /** Language-neutral short key for relevance text (both dictionaries keep parity by object). */
  relevance: { en: string; id: string }
}

/**
 * Curated reference library. URLs were checked with automated HTTP requests
 * during development (Crossref lookup for DOIs). Some publishers/Seg Wiki
 * block automated requests with 403 while serving browsers normally — see
 * README for the verification method and status.
 */
export const references: Reference[] = [
  {
    id: 'jol2009',
    type: 'teaching',
    methods: ['gpr'],
    title: 'Ground Penetrating Radar: Theory and Applications',
    authors: 'Jol, H. M. (editor)',
    year: 2009,
    venue: 'Elsevier Science',
    url: 'https://www.sciencedirect.com/book/9780444533487/ground-penetrating-radar',
    relevance: {
      en: 'Edited textbook covering GPR principles, acquisition, processing and applications; background for the layered EM model used here.',
      id: 'Buku teks suntingan yang membahas prinsip, akuisisi, pengolahan, dan aplikasi GPR; dasar model EM berlapis yang dipakai di sini.',
    },
  },
  {
    id: 'knight2001',
    type: 'advanced',
    methods: ['gpr'],
    title: 'Ground Penetrating Radar for Environmental Applications',
    authors: 'Knight, R.',
    year: 2001,
    venue: 'Annual Review of Earth and Planetary Sciences 29, 229–255',
    url: 'https://doi.org/10.1146/annurev.earth.29.1.229',
    doi: '10.1146/annurev.earth.29.1.229',
    relevance: {
      en: 'Review of GPR physics in environmental settings, including permittivity–water content relations and signal attenuation.',
      id: 'Tinjauan fisika GPR untuk lingkungan, termasuk hubungan permitivitas–kadar air dan atenuasi sinyal.',
    },
  },
  {
    id: 'topp1980',
    type: 'advanced',
    methods: ['gpr'],
    title: 'Electromagnetic determination of soil water content: Measurements in coaxial transmission lines',
    authors: 'Topp, G. C., Davis, J. L., Annan, A. P.',
    year: 1980,
    venue: 'Water Resources Research 16(3), 574–582',
    url: 'https://doi.org/10.1029/WR016i003p00574',
    doi: '10.1029/WR016i003p00574',
    relevance: {
      en: 'Classic experimental relation between soil permittivity and volumetric water content — the physics behind “wet soil slows radar waves”.',
      id: 'Relasi eksperimental klasik antara permitivitas tanah dan kadar air volumetrik — fisika di balik “tanah basah memperlambat gelombang radar”.',
    },
  },
  {
    id: 'blakely1995',
    type: 'foundational',
    methods: ['magnetic', 'gravity'],
    title: 'Potential Theory in Gravity and Magnetic Applications',
    authors: 'Blakely, R. J.',
    year: 1995,
    venue: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/CBO9780511549816',
    doi: '10.1017/CBO9780511549816',
    relevance: {
      en: 'Standard reference for the dipole and prism potential-field formulas that underpin the magnetic and gravity solvers.',
      id: 'Referensi standar untuk rumus medan potensial dipol dan prisma yang mendasari solver magnetik dan gravitasi.',
    },
  },
  {
    id: 'hinze2013',
    type: 'foundational',
    methods: ['gravity', 'magnetic'],
    title: 'Gravity and Magnetic Exploration: Principles, Practices, and Applications',
    authors: 'Hinze, W. J., von Frese, R. R. B., Saad, A. H.',
    year: 2013,
    venue: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/CBO9780511843129',
    doi: '10.1017/CBO9780511843129',
    relevance: {
      en: 'Modern survey practice for gravity and magnetics: corrections, acquisition and anomaly interpretation; background for the potential-field workspaces.',
      id: 'Praktik survei modern gravitasi dan magnetik: koreksi, akuisisi, dan interpretasi anomali (dasar workspace Fase 2).',
    },
  },
  {
    id: 'nagy2000',
    type: 'advanced',
    methods: ['gravity'],
    title: 'The gravitational potential and its derivatives for the prism',
    authors: 'Nagy, D., Papp, G., Benedek, J.',
    year: 2000,
    venue: 'Journal of Geodesy 74, 552–560',
    url: 'https://doi.org/10.1007/s001900000116',
    doi: '10.1007/s001900000116',
    relevance: {
      en: 'Closed-form gravity field of a homogeneous right rectangular prism — the source model used in the gravity workspace.',
      id: 'Medan gravitasi bentuk-tertutup prisma persegi panjang homogen — model sumber lanjut yang direncanakan untuk workspace gravitasi.',
    },
  },
  {
    id: 'sheriff1995',
    type: 'foundational',
    methods: ['reflection', 'refraction'],
    title: 'Exploration Seismology (2nd edition)',
    authors: 'Sheriff, R. E., Geldart, L. P.',
    year: 1995,
    venue: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/CBO9781139168359',
    doi: '10.1017/CBO9781139168359',
    relevance: {
      en: 'Foundational treatment of reflection coefficients, travel times, and refraction theory used across the seismic content.',
      id: 'Dasar teoretis koefisien refleksi, waktu tempuh, dan teori refraksi yang dipakai di seluruh konten seismik.',
    },
  },
  {
    id: 'yilmaz2001',
    type: 'advanced',
    methods: ['reflection'],
    title: 'Seismic Data Analysis: Processing, Inversion, and Interpretation of Seismic Data',
    authors: 'Yilmaz, Ö.',
    year: 2001,
    venue: 'SEG Investigations in Geophysics No. 10',
    url: 'https://doi.org/10.1190/1.9781560801580',
    doi: '10.1190/1.9781560801580',
    relevance: {
      en: 'The reference work on reflection processing; guides the reflectivity–convolution model and future gathers/migration modules.',
      id: 'Karya rujukan pengolahan refleksi; memandu model reflektivitas–konvolusi dan modul gather/migrasi mendatang.',
    },
  },
  {
    id: 'palmer1980',
    type: 'advanced',
    methods: ['refraction'],
    title: 'The Generalized Reciprocal Method of Seismic Refraction Interpretation',
    authors: 'Palmer, D.',
    year: 1980,
    venue: 'SEG Monograph',
    url: 'https://doi.org/10.1190/1.9781560802426',
    doi: '10.1190/1.9781560802426',
    relevance: {
      en: 'Classic refraction interpretation method for undulating refractors; complements the head-wave travel-time workspace.',
      id: 'Metode interpretasi refraksi klasik untuk refraktor bergelombang — direncanakan untuk workspace refraksi Fase 2.',
    },
  },
  {
    id: 'shearer2019',
    type: 'foundational',
    methods: ['reflection', 'refraction'],
    title: 'Introduction to Seismology (3rd edition)',
    authors: 'Shearer, P. M.',
    year: 2019,
    venue: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/9781316877111',
    doi: '10.1017/9781316877111',
    relevance: {
      en: 'Clear derivation of Snell’s law, travel-time curves and reflectivity from first principles; supports the seismic demos.',
      id: 'Penurunan jelas hukum Snell, kurva waktu tempuh, dan reflektivitas dari prinsip dasar; mendukung demo seismik.',
    },
  },
  {
    id: 'telford1990',
    type: 'foundational',
    methods: ['general'],
    title: 'Applied Geophysics (2nd edition)',
    authors: 'Telford, W. M., Geldart, L. P., Sheriff, R. E.',
    year: 1990,
    venue: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/CBO9781139167932',
    doi: '10.1017/CBO9781139167932',
    relevance: {
      en: 'Comprehensive textbook covering all six methods; the property ranges used in the scenarios follow its tables.',
      id: 'Buku teks komprehensif kelima metode; rentang properti pada skenario mengikuti tabel-tabelnya.',
    },
  },
  {
    id: 'reynolds2011',
    type: 'teaching',
    methods: ['general'],
    title: 'An Introduction to Applied and Environmental Geophysics (2nd edition)',
    authors: 'Reynolds, J. M.',
    year: 2011,
    venue: 'Wiley-Blackwell',
    url: 'https://www.wiley.com/en-us/An+Introduction+to+Applied+and+Environmental+Geophysics%2C+2nd+Edition-p-9780471485353',
    relevance: {
      en: 'Applied near-surface geophysics with practical property tables — the main source for the GPR scenario parameters.',
      id: 'Geofisika dekat permukaan terapan dengan tabel properti praktis — sumber utama parameter skenario GPR.',
    },
  },
  {
    id: 'lowrie2020',
    type: 'foundational',
    methods: ['general'],
    title: 'Fundamentals of Geophysics (3rd edition)',
    authors: 'Lowrie, W., Fichtner, A.',
    year: 2020,
    venue: 'Cambridge University Press',
    url: 'https://doi.org/10.1017/9781108685917',
    doi: '10.1017/9781108685917',
    relevance: {
      en: 'Undergraduate-level derivation of the governing physics for all methods, including the dipole field and gravitational attraction.',
      id: 'Penurunan tingkat sarjana untuk fisika dasar semua metode, termasuk medan dipol dan tarikan gravitasi.',
    },
  },
  {
    id: 'epa-geophysics',
    type: 'teaching',
    methods: ['general'],
    title: 'Environmental Geophysics',
    authors: 'U.S. Environmental Protection Agency',
    year: 2024,
    venue: 'U.S. EPA — site characterization resources',
    url: 'https://www.epa.gov/environmental-geophysics',
    relevance: {
      en: 'Agency guidance on geophysical methods for contaminated-site and near-surface investigations, including GPR and potential fields.',
      id: 'Panduan lembaga untuk investigasi lokasi tercemar dan bawah permukaan dangkal, termasuk GPR dan medan potensial.',
    },
  },
  {
    id: 'segWikiGpr',
    type: 'teaching',
    methods: ['gpr'],
    title: 'Ground-penetrating radar (SEG Wiki)',
    authors: 'Society of Exploration Geophysicists',
    year: 2024,
    venue: 'SEG Wiki — open geophysics encyclopedia',
    url: 'https://wiki.seg.org/wiki/Ground-penetrating_radar',
    relevance: {
      en: 'Community-maintained encyclopedia entry with concise GPR theory and terminology; a quick teaching companion.',
      id: 'Entri ensiklopedia yang dipelihara komunitas dengan teori dan terminologi GPR ringkas; pendamping pengajaran yang cepat.',
    },
  },
  {
    id: 'segWikiRefraction',
    type: 'teaching',
    methods: ['refraction'],
    title: 'Seismic refraction (SEG Wiki)',
    authors: 'Society of Exploration Geophysicists',
    year: 2024,
    venue: 'SEG Wiki — open geophysics encyclopedia',
    url: 'https://wiki.seg.org/wiki/Seismic_refraction',
    relevance: {
      en: 'Concise overview of refraction field procedures and first-arrival interpretation concepts.',
      id: 'Ringkasan prosedur lapangan refraksi dan konsep interpretasi tiba pertama.',
    },
  },
  {
    id: 'koefoed1979',
    type: 'foundational',
    methods: ['resistivity'],
    title: 'Geosounding Principles, 1: Resistivity Sounding Measurements',
    authors: 'Koefoed, O.',
    year: 1979,
    venue: 'Elsevier — Methods in Geochemistry and Geophysics 14A',
    url: 'https://books.google.com/books/about/Geosounding_Principles.html?id=Qe7JvQEACAAJ',
    relevance: {
      en: 'Classic treatment of layered-earth resistivity sounding: the transform recursion and Hankel-integral formulation implemented by the VES solver.',
      id: 'Pembahasan klasik sounding resistivitas bumi berlapis: rekursi transformasi dan formulasi integral Hankel yang diimplementasikan solver VES.',
    },
  },
  {
    id: 'loke2004',
    type: 'teaching',
    methods: ['resistivity'],
    title: 'Tutorial: 2-D and 3-D Electrical Imaging Surveys',
    authors: 'Loke, M. H.',
    year: 2004,
    venue: 'Geotomo Software — course notes (updated editions available)',
    url: 'https://www.geotomosoft.com/downloads.php',
    relevance: {
      en: 'Practical, widely used course notes on resistivity arrays, apparent-resistivity geometry factors and survey design; supports the Wenner and Schlumberger workspace.',
      id: 'Catatan kuliah praktis yang luas dipakai tentang susunan resistivitas, faktor geometri resistivitas semu, dan desain survei; mendukung workspace Wenner dan Schlumberger.',
    },
  },
]

export const referenceById = (id: string): Reference | undefined => references.find((r) => r.id === id)
