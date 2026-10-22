import { eq, list, note, p, type MethodTheory } from './types'

export const resistivityTheory: MethodTheory = {
  methodId: 'resistivity',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'Four electrodes inject a direct current and measure a voltage. Changing the spacing changes the depth being sampled.',
        id: 'Empat elektroda mengalirkan arus searah dan mengukur tegangan. Mengubah jarak elektroda mengubah kedalaman yang tersampel.',
      },
      minutes: 5,
      blocks: [
        p(
          'A DC resistivity sounding uses four electrodes. Two current electrodes (A and B) inject a known current I into the ground; two potential electrodes (M and N) measure the resulting voltage difference ΔV. The ratio ΔV/I is a resistance, but it depends on the electrode geometry, so we convert it to apparent resistivity ρa, in ohm-metres.',
          'Sondir resistivitas DC memakai empat elektroda. Dua elektroda arus (A dan B) mengalirkan arus I yang diketahui ke dalam tanah; dua elektroda potensial (M dan N) mengukur beda tegangan ΔV. Rasio ΔV/I adalah hambatan, tetapi bergantung pada geometri elektroda, sehingga dikonversi menjadi resistivitas semu ρa dalam ohm-meter.',
        ),
        eq(
          '\\rho_a = \\frac{2\\pi\\,\\Delta V}{I}\\left[\\frac{1}{AM}-\\frac{1}{BM}-\\frac{1}{AN}+\\frac{1}{BN}\\right]^{-1}',
          'General four-electrode apparent resistivity.',
          'Resistivitas semu umum empat elektroda.',
        ),
        p(
          'Two standard geometries are used here. In the Wenner array the electrodes are equally spaced at A–M–N–B with spacing a, which gives ρa = 2πa ΔV/I. In the Schlumberger array the current electrodes are separated by 2L and the potential electrodes by 2b, centred between them; the geometric factor is π(L² − b²)/(2b).',
          'Dua geometri standar dipakai di sini. Pada susunan Wenner elektroda berjarak sama A–M–N–B dengan jarak a, sehingga ρa = 2πa ΔV/I. Pada susunan Schlumberger elektroda arus terpisah 2L dan elektroda potensial 2b, terpusat di antaranya; faktor geometrinya π(L² − b²)/(2b).',
        ),
        eq('\\rho_a^{\\mathrm{Wenner}} = 2\\pi a\\,\\frac{\\Delta V}{I}', 'Wenner array.', 'Susunan Wenner.'),
        eq('\\rho_a^{\\mathrm{Schlumberger}} = \\frac{\\pi(L^2-b^2)}{2b}\\,\\frac{\\Delta V}{I}', 'Schlumberger array with AB/2 = L and MN/2 = b.', 'Susunan Schlumberger dengan AB/2 = L dan MN/2 = b.'),
        p(
          'A vertical electrical sounding (VES) repeats the measurement at increasing spacings. Small spacings sample the shallow ground; large spacings let current penetrate deeper. Plotting ρa against spacing on log–log axes gives the sounding curve used for interpretation. The synthetic workspace generates that curve from a known layered model.',
          'Sondir listrik vertikal (VES) mengulang pengukuran pada jarak yang makin besar. Jarak kecil menyampel tanah dangkal; jarak besar membiarkan arus menembus lebih dalam. Plot ρa terhadap jarak pada sumbu log–log memberi kurva sounding yang dipakai untuk interpretasi. Workspace sintetik menghasilkan kurva itu dari model berlapis yang diketahui.',
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'The physics, step by step', id: 'Fisikanya, langkah demi langkah' },
      summary: {
        en: 'Current spreads from a point source in a conductive half-space. Layering changes the potential, and the layered-earth transform captures that change.',
        id: 'Arus menyebar dari sumber titik di setengah-ruang konduktif. Perlapisan mengubah potensial, dan transformasi bumi berlapis menangkap perubahan itu.',
      },
      minutes: 8,
      blocks: [
        p(
          'In a homogeneous half-space of resistivity ρ, a point current I at the surface produces a potential that falls as 1/r. The current spreads over hemispheres of increasing area, so the current density decreases as 1/r² and the potential as 1/r. This is the reference solution against which layering is measured.',
          'Dalam setengah-ruang homogen beresistivitas ρ, arus titik I di permukaan menghasilkan potensial yang menurun sebagai 1/r. Arus menyebar pada belahan bumi yang luasnya bertambah, sehingga rapat arus menurun sebagai 1/r² dan potensial sebagai 1/r. Ini solusi acuan terhadap mana perlapisan diukur.',
        ),
        eq('V(r) = \\frac{\\rho I}{2\\pi r}', 'Potential at distance r from a point source on a half-space.', 'Potensial pada jarak r dari sumber titik di setengah-ruang.'),
        p(
          'With layers, the current distribution changes because each interface refracts the current flow, exactly as a boundary between media with different conductivities distorts the field. The layered earth can be represented by an equivalent resistivity transform T(λ), obtained by recursion from the bottom half-space upward.',
          'Dengan perlapisan, distribusi arus berubah karena setiap bidang batas merefraksi aliran arus, sebagaimana bidang batas antara medium berkonduktivitas berbeda mendistorsi medan. Bumi berlapis dapat diwakili oleh transformasi resistivitas ekuivalen T(λ), yang diperoleh secara rekursif dari setengah-ruang bawah ke atas.',
        ),
        eq(
          'T_j = \\rho_j\\,\\frac{T_{j+1}+\\rho_j\\tanh(\\lambda h_j)}{\\rho_j+T_{j+1}\\tanh(\\lambda h_j)}',
          'Stefanescu recursion; T starts at the bottom resistivity.',
          'Rekursi Stefanescu; T dimulai dari resistivitas lapisan bawah.',
        ),
        p(
          'The surface potential is then written as a Hankel integral involving T(λ) and the Bessel function J₀. The difference between the layered response and the homogeneous response is what the four-electrode measurement detects. In this app, the integral is evaluated numerically with Gauss–Legendre quadrature over half-periods of the Bessel oscillation.',
          'Potensial permukaan kemudian ditulis sebagai integral Hankel yang melibatkan T(λ) dan fungsi Bessel J₀. Perbedaan antara respons berlapis dan respons homogen adalah yang dideteksi pengukuran empat elektroda. Di aplikasi ini, integral dievaluasi secara numerik dengan kuadratur Gauss–Legendre pada interval setengah periode osilasi Bessel.',
        ),
        eq(
          'J(r) = \\int_0^{\\infty}\\left[T(\\lambda)-\\rho_1\\right]J_0(\\lambda r)\\,d\\lambda',
          'Layered contribution to the surface potential.',
          'Kontribusi perlapisan pada potensial permukaan.',
        ),
        p(
          'For the Wenner array the apparent resistivity becomes ρa = ρ₁ + 2a[J(a) − J(2a)]. For the Schlumberger array it becomes ρa = ρ₁ + (L² − b²)/(2b)[J(L − b) − J(L + b)]. These are the formulas implemented by the solver and checked against closed-form two-layer curves in the test suite.',
          'Untuk susunan Wenner, resistivitas semu menjadi ρa = ρ₁ + 2a[J(a) − J(2a)]. Untuk susunan Schlumberger menjadi ρa = ρ₁ + (L² − b²)/(2b)[J(L − b) − J(L + b)]. Inilah rumus yang diimplementasikan solver dan diperiksa terhadap kurva dua lapis bentuk tertutup dalam rangkaian uji.',
        ),
      ],
    },
    {
      id: 'model',
      title: { en: 'From a sounding curve to layer parameters', id: 'Dari kurva sounding menjadi parameter lapisan' },
      summary: {
        en: 'The forward map predicts a curve from resistivities and thicknesses. Reading the curve backwards is an inverse problem with equivalence.',
        id: 'Peta forward memprediksi kurva dari resistivitas dan ketebalan. Membaca kurva secara terbalik adalah masalah invers dengan ekuivalensi.',
      },
      minutes: 6,
      blocks: [
        p(
          'The forward direction is unambiguous: given layer resistivities and thicknesses, the equations above produce one sounding curve. The workspace lets you change those parameters and watch the curve respond. A resistive bottom layer pushes the right-hand part of the curve upward; a conductive layer produces a trough; increasing a layer thickness shifts its influence to larger spacings.',
          'Arah forward tidak ambigu: diberikan resistivitas dan ketebalan lapisan, persamaan di atas menghasilkan satu kurva sounding. Workspace memungkinkan Anda mengubah parameter itu dan mengamati respons kurvanya. Lapisan bawah resistif mendorong bagian kanan kurva ke atas; lapisan konduktif menghasilkan lembah; menambah ketebalan lapisan menggeser pengaruhnya ke jarak yang lebih besar.',
        ),
        p(
          'Estimating layers from a measured curve is the inverse problem. It is non-unique: a thin resistive layer and a thicker, less resistive layer can produce almost the same curve — the principle of equivalence. Sophisticated inversion adds smoothness constraints and prior information, but those choices are part of the interpretation, not the data.',
          'Memperkirakan lapisan dari kurva terukur adalah masalah invers. Ia tidak tunggal: lapisan resistif tipis dan lapisan lebih tebal yang kurang resistif dapat menghasilkan kurva hampir sama — prinsip ekuivalensi. Inversi canggih menambahkan kendala kehalusan dan informasi prior, tetapi pilihan itu bagian dari interpretasi, bukan datanya.',
        ),
        list(
          ['Left asymptote → resistivity of the top layer.', 'Asimtot kiri → resistivitas lapisan atas.'],
          ['Right asymptote (if reached) → resistivity of the deepest layer.', 'Asimtot kanan (jika tercapai) → resistivitas lapisan terdalam.'],
          ['Curve shoulders and troughs → approximate depths of interfaces.', 'Bahu kurva dan lembah → perkiraan kedalaman bidang batas.'],
          ['Apparent resistivity is not the resistivity of any single layer.', 'Resistivitas semu bukan resistivitas satu lapisan tertentu.'],
        ),
        note(
          'Forward only',
          'Hanya forward',
          'This app computes synthetic curves from a chosen model. It intentionally does not invert data, so no uniqueness is implied. The same curve can come from more than one layered model.',
          'Aplikasi ini menghitung kurva sintetik dari model yang dipilih. Ia sengaja tidak menginversi data, sehingga tidak menyiratkan ketunggalan. Kurva yang sama dapat berasal dari lebih dari satu model berlapis.',
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Read a two-layer curve, then see what a conductive clay layer and a saline layer do.',
        id: 'Baca kurva dua lapis, lalu lihat efek lapisan lempung konduktif dan lapisan asin.',
      },
      minutes: 5,
      blocks: [
        p(
          'Consider 60 Ω·m soil, 6 m thick, over a 600 Ω·m bedrock. At very small spacings the current stays in the top layer, so ρa approaches 60 Ω·m. At very large spacings the current samples mostly the bedrock, so ρa approaches 600 Ω·m. The transition occurs around spacings comparable to the depth, roughly 5–20 m.',
          'Tinjau tanah 60 Ω·m setebal 6 m di atas batuan dasar 600 Ω·m. Pada jarak sangat kecil arus tetap di lapisan atas, sehingga ρa mendekati 60 Ω·m. Pada jarak sangat besar arus terutama menyampel batuan dasar, sehingga ρa mendekati 600 Ω·m. Transisi terjadi di sekitar jarak yang sebanding dengan kedalaman, kira-kira 5–20 m.',
        ),
        eq(
          '\\rho_a \\to \\rho_1 \\ \\mathrm{as}\\ a \\to 0, \\qquad \\rho_a \\to \\rho_n \\ \\mathrm{as}\\ a \\to \\infty',
          'Asymptotic limits of a layered sounding.',
          'Batas asimtotik sondir berlapis.',
        ),
        p(
          'Now insert a 12 Ω·m clay layer between the soil and the bedrock. The curve rises toward the resistive bedrock at shallow spacing, then falls into a pronounced trough where the clay dominates, before rising again at large spacing. A saline layer behaves similarly but produces a much deeper trough because its resistivity is only a few Ω·m.',
          'Sekarang sisipkan lapisan lempung 12 Ω·m antara tanah dan batuan dasar. Kurva naik menuju batuan dasar resistif pada jarak dangkal, lalu turun ke lembah nyata tempat lempung mendominasi, sebelum naik lagi pada jarak besar. Lapisan asin berperilaku serupa tetapi menghasilkan lembah jauh lebih dalam karena resistivitasnya hanya beberapa Ω·m.',
        ),
        p(
          'To estimate the clay depth, note where the trough begins: the current first “sees” the clay when the spacing is comparable to the depth of the layer above it. The example cannot tell you whether the clay is 2 m thick and very conductive or 10 m thick and moderately conductive — that is equivalence, and it is why boreholes or other data are valuable.',
          'Untuk memperkirakan kedalaman lempung, perhatikan di mana lembah mulai: arus pertama “melihat” lempung ketika jarak sebanding dengan kedalaman lapisan di atasnya. Contoh ini tidak dapat memberi tahu apakah lempung setebal 2 m dan sangat konduktif atau 10 m dan cukup konduktif — itulah ekuivalensi, dan sebabnya data lubang bor atau data lain berharga.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'VES assumes a layered, laterally uniform earth. Equivalence, lateral changes, electrode contact and cultural noise all matter.',
        id: 'VES mengasumsikan bumi berlapis dan seragam lateral. Ekuivalensi, perubahan lateral, kontak elektroda, dan noise kultural semuanya penting.',
      },
      minutes: 4,
      blocks: [
        p(
          'The biggest assumption is 1D: the ground beneath the sounding is treated as horizontal layers that extend infinitely sideways. A dipping interface, a nearby river, a buried pipe or a building foundation violates that assumption. Field practice uses several soundings, offset arrays and geological context to test it.',
          'Asumsi terbesar adalah 1D: tanah di bawah sounding diperlakukan sebagai lapisan horizontal yang memanjang tak terhingga ke samping. Bidang batas miring, sungai terdekat, pipa terkubur, atau pondasi bangunan melanggar asumsi itu. Praktik lapangan memakai beberapa sounding, susunan offset, dan konteks geologi untuk mengujinya.',
        ),
        list(
          ['Equivalence: thin/strong and thick/weak layers can look similar.', 'Ekuivalensi: lapisan tipis/kuat dan tebal/lemah dapat tampak mirip.'],
          ['Lateral changes violate the 1D assumption.', 'Perubahan lateral melanggar asumsi 1D.'],
          ['Electrode contact resistance and polarization affect data quality.', 'Hambatan kontak elektroda dan polarisasi memengaruhi kualitas data.'],
          ['Induced polarization, anisotropy and topography are not modelled.', 'Induced polarization, anisotropi, dan topografi tidak dimodelkan.'],
        ),
        p(
          'Forward modelling is still useful: it shows what a candidate model would produce, helps design a spacing range, and makes the ambiguity visible. It does not replace a careful field survey or a professional inversion with uncertainty analysis.',
          'Pemodelan forward tetap berguna: ia menunjukkan apa yang akan dihasilkan model kandidat, membantu merancang rentang jarak, dan membuat ambiguitas terlihat. Ia tidak menggantikan survei lapangan yang cermat atau inversi profesional dengan analisis ketidakpastian.',
        ),
      ],
    },
  ],
}
