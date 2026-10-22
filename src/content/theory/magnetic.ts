import { eq, list, note, p, type MethodTheory } from './types'

export const magneticTheory: MethodTheory = {
  methodId: 'magnetic',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'A magnetometer records the strength of the ambient field. Small deviations from the regional field — the anomaly — are what we interpret.',
        id: 'Magnetometer merekam kekuatan medan ambient. Simpangan kecil dari medan regional — anomalinya — yang kita interpretasikan.',
      },
      minutes: 4,
      blocks: [
        p(
          'A magnetometer measures the magnitude of the local magnetic field, usually in nanotesla (nT). The Earth’s field is tens of thousands of nT; a buried object or a geological body adds a much smaller perturbation. We therefore remove the regional field and study the residual, called the total-field anomaly ΔT.',
          'Magnetometer mengukur besar medan magnet lokal, biasanya dalam nanotesla (nT). Medan bumi berkisar puluhan ribu nT; benda terkubur atau tubuh geologi menambahkan gangguan yang jauh lebih kecil. Karena itu medan regional dihilangkan dan sisanya dipelajari, disebut anomali medan total ΔT.',
        ),
        p(
          'In a profile survey the sensor moves along a line; in a grid survey it covers an area. The data are ΔT versus position. In the synthetic workspace, one profile is shown together with a map so that the 3D shape of the anomaly is visible.',
          'Pada survei profil, sensor bergerak sepanjang lintasan; pada survei grid, sensor menutupi suatu area. Datanya adalah ΔT terhadap posisi. Di workspace sintetik, satu profil ditampilkan bersama peta agar bentuk 3D anomali terlihat.',
        ),
        list(
          ['Units: nT (1 nT = 10⁻⁹ T).', 'Satuan: nT (1 nT = 10⁻⁹ T).'],
          ['Survey geometry: station spacing, line length, line spacing.', 'Geometri survei: jarak stasiun, panjang lintasan, jarak antar-lintasan.'],
          ['Orientation: declination and inclination of the inducing field.', 'Orientasi: deklinasi dan inklinasi medan penginduksi.'],
          ['Noise: instrument drift and cultural noise are separate from the geological signal.', 'Noise: drift instrumen dan noise kultural terpisah dari sinyal geologi.'],
        ),
        p(
          'A real survey also corrects for diurnal variations, heading errors and the regional gradient. Those corrections are not part of this teaching model: the synthetic scenario assumes a stable inducing field and a flat ground surface.',
          'Survei nyata juga mengoreksi variasi harian, kesalahan arah, dan gradien regional. Koreksi itu bukan bagian dari model pengajaran ini: skenario sintetik mengasumsikan medan penginduksi stabil dan permukaan tanah datar.',
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'The physics, step by step', id: 'Fisikanya, langkah demi langkah' },
      summary: {
        en: 'Induced magnetization turns a body into a dipole. Its field falls off as 1/r³, and the total-field anomaly is a projection of that field onto the ambient direction.',
        id: 'Magnetisasi terinduksi mengubah tubuh menjadi dipol. Medannya menurun sebagai 1/r³, dan anomali medan total adalah proyeksi medan itu pada arah ambient.',
      },
      minutes: 7,
      blocks: [
        p(
          'The ambient field H magnetizes susceptible material. For weak fields the induced magnetization is approximately linear: M = χH, where χ is the magnetic susceptibility (dimensionless in SI). A body with volume V then carries a magnetic moment m = MV.',
          'Medan ambient H memagnetisasi material yang memiliki suseptibilitas. Untuk medan lemah, magnetisasi terinduksi kira-kira linear: M = χH, dengan χ adalah suseptibilitas magnetik (tanpa dimensi dalam SI). Tubuh dengan volume V kemudian membawa momen magnetik m = MV.',
        ),
        eq(
          '\\mathbf{B}(\\mathbf{r}) = \\frac{\\mu_0}{4\\pi r^3}\\left[3(\\mathbf{m}\\cdot\\hat{\\mathbf{r}})\\hat{\\mathbf{r}} - \\mathbf{m}\\right]',
          'Field of a magnetic dipole.',
          'Medan sebuah dipol magnetik.',
        ),
        p(
          'Far from the body its field is indistinguishable from a dipole. The 1/r³ decay is steep: doubling the depth divides the anomaly by roughly eight. This is why magnetic surveys are excellent at locating shallow bodies and poor at detecting deep, small ones.',
          'Jauh dari tubuh, medannya tidak dapat dibedakan dari dipol. Penurunan 1/r³ sangat tajam: menggandakan kedalaman membagi anomali kira-kira delapan. Inilah sebabnya survei magnetik sangat baik untuk menemukan benda dangkal dan lemah untuk mendeteksi benda kecil yang dalam.',
        ),
        p(
          'A total-field magnetometer does not measure the vector B directly. It measures |B₀ + b|, where b is the anomalous field. For small anomalies, expanding the magnitude gives the projection of b onto the ambient unit vector. The anomaly shape therefore depends on both the body and the direction of the inducing field.',
          'Magnetometer medan total tidak mengukur vektor B secara langsung. Ia mengukur |B₀ + b|, dengan b medan anomalinya. Untuk anomali kecil, penjabaran besar vektor memberi proyeksi b pada vektor satuan ambient. Bentuk anomali karena itu bergantung pada tubuh sekaligus arah medan penginduksi.',
        ),
        eq(
          '\\Delta T \\approx \\hat{\\mathbf{f}}\\cdot\\mathbf{b}',
          'Small-anomaly approximation; f̂ is the ambient field direction.',
          'Aproximasi anomali kecil; f̂ adalah arah medan ambient.',
        ),
        note(
          'Prisms versus dipoles',
          'Prisma versus dipol',
          'The workspace also computes uniformly magnetized rectangular prisms with exact corner formulas. Close to a body, the dipole approximation is too crude; the prism formula keeps the finite geometry.',
          'Workspace juga menghitung prisma persegi yang termagnetisasi seragam dengan rumus sudut eksak. Dekat tubuh, aproximasi dipol terlalu kasar; rumus prisma mempertahankan geometri berhingga.',
        ),
      ],
    },
    {
      id: 'model',
      title: { en: 'From an anomaly to a body', id: 'Dari anomali menjadi tubuh' },
      summary: {
        en: 'Width, amplitude and shape constrain position, depth and magnetization—but not uniquely. The forward model shows what each candidate body would produce.',
        id: 'Lebar, amplitudo, dan bentuk membatasi posisi, kedalaman, dan magnetisasi — tetapi tidak secara tunggal. Model forward menunjukkan apa yang akan dihasilkan setiap kandidat tubuh.',
      },
      minutes: 5,
      blocks: [
        p(
          'A compact, shallow body produces a short-wavelength, high-amplitude anomaly. A deep body produces a broad, weak anomaly. A dipole’s peak-to-peak width is roughly proportional to its depth, and its amplitude falls as 1/z³. These rules of thumb allow a first estimate, but they are not an inversion.',
          'Tubuh dangkal yang kompak menghasilkan anomali panjang gelombang pendek dengan amplitudo tinggi. Tubuh dalam menghasilkan anomali lebar dan lemah. Lebar puncak-ke-puncak dipol kira-kira sebanding dengan kedalamannya, dan amplitudonya menurun sebagai 1/z³. Aturan praktis ini memberi perkiraan awal, tetapi bukan inversi.',
        ),
        p(
          'In the workspace you choose the body geometry, depth, susceptibility and field orientation, then compute the anomaly. Comparing the computed curve with a candidate target teaches the forward direction: model first, response second. Estimation in the opposite direction is a separate inverse problem with its own non-uniqueness.',
          'Di workspace Anda memilih geometri tubuh, kedalaman, suseptibilitas, dan orientasi medan, lalu menghitung anomalinya. Membandingkan kurva terhitung dengan target kandidat mengajarkan arah forward: model dulu, respons kemudian. Estimasi ke arah sebaliknya adalah masalah invers terpisah dengan ketidaktunggalan sendiri.',
        ),
        list(
          ['Depth control comes mainly from the anomaly width and gradient.', 'Kendali kedalaman terutama dari lebar dan gradien anomali.'],
          ['Amplitude mixes magnetization and volume; the two trade off.', 'Amplitudo mencampur magnetisasi dan volume; keduanya saling menukar.'],
          ['A gridded map reveals strike direction and the 3D shape.', 'Peta grid mengungkap arah strike dan bentuk 3D.'],
          ['Regional-field removal can create or hide anomalies — always report the method used.', 'Penghilangan medan regional dapat menciptakan atau menyembunyikan anomali — selalu laporkan metodenya.'],
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Estimate the anomaly of a small magnetized sphere, then see how depth changes it.',
        id: 'Perkirakan anomali sebuah bola termagnetisasi kecil, lalu lihat bagaimana kedalaman mengubahnya.',
      },
      minutes: 5,
      blocks: [
        p(
          'Consider a sphere of radius 1 m, susceptibility χ = 0.05, buried 2 m deep in a field F₀ = 50,000 nT. Its volume is 4.19 m³ and its induced magnetization is M = χF₀/μ₀ ≈ 1.99 A/m, giving a moment m ≈ 8.3 A·m².',
          'Tinjau bola berjari-jari 1 m, suseptibilitas χ = 0,05, terkubur 2 m di medan F₀ = 50.000 nT. Volumenya 4,19 m³ dan magnetisasi terinduksinya M = χF₀/μ₀ ≈ 1,99 A/m, sehingga momennya m ≈ 8,3 A·m².',
        ),
        p(
          'Directly above a vertically magnetized dipole, the anomalous field is approximately B ≈ (μ₀/4π)(2m/z³). Substituting gives about 2 × 10⁻⁷ T, or roughly 200 nT. The sign depends on the field inclination and on whether the body is more or less magnetic than its host.',
          'Tepat di atas dipol yang termagnetisasi vertikal, medan anomalinya kira-kira B ≈ (μ₀/4π)(2m/z³). Substitusi memberi sekitar 2 × 10⁻⁷ T, atau kira-kira 200 nT. Tandanya bergantung pada inklinasi medan dan apakah tubuh lebih atau kurang magnetik daripada host-nya.',
        ),
        p(
          'Move the same sphere to 4 m depth. The moment is unchanged, but z³ increases by a factor of eight, so the peak anomaly drops to roughly 25 nT. In the workspace, this is exactly what the depth slider shows: a dramatic loss of amplitude and a broader anomaly.',
          'Pindahkan bola yang sama ke kedalaman 4 m. Momennya tidak berubah, tetapi z³ naik delapan kali, sehingga anomali puncaknya turun menjadi kira-kira 25 nT. Di workspace, inilah yang ditunjukkan slider kedalaman: kehilangan amplitudo yang dramatis dan anomali yang lebih lebar.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'Remanence, demagnetization, near-field geometry and regional-field choices can all break the simple induced-dipole picture.',
        id: 'Remanensi, demagnetisasi, geometri medan dekat, dan pilihan medan regional dapat merusak gambaran dipol terinduksi yang sederhana.',
      },
      minutes: 4,
      blocks: [
        p(
          'The model assumes induced magnetization only. Many rocks carry remanent magnetization acquired in a past field, which can point in a different direction and even reverse the anomaly’s sign. It also ignores self-demagnetization, important for strongly magnetic bodies, and treats the host as non-magnetic.',
          'Model mengasumsikan hanya magnetisasi terinduksi. Banyak batuan membawa magnetisasi remanen dari medan masa lalu, yang dapat menunjuk arah berbeda dan bahkan membalik tanda anomali. Model juga mengabaikan self-demagnetization, penting untuk tubuh sangat magnetik, dan menganggap host non-magnetik.',
        ),
        list(
          ['A dipole is a far-field approximation; near a body use the prism formula.', 'Dipol adalah aproximasi medan jauh; dekat tubuh gunakan rumus prisma.'],
          ['Anomaly amplitude cannot separate susceptibility from volume.', 'Amplitudo anomali tidak dapat memisahkan suseptibilitas dari volume.'],
          ['Cultural iron produces sharp, intense anomalies that can mask geology.', 'Besi kultural menghasilkan anomali tajam dan kuat yang dapat menutupi geologi.'],
          ['A magnetic anomaly is not a map of “metal”; it is a map of magnetization contrast.', 'Anomali magnetik bukan peta “logam”; ia peta kontras magnetisasi.'],
        ),
        p(
          'The forward simulator is therefore a tool for building intuition about the 1/r³ geometry and the projection onto the ambient field. It is not a survey design package, and it does not remove the need for careful field corrections.',
          'Simulator forward karena itu adalah alat untuk membangun intuisi tentang geometri 1/r³ dan proyeksinya pada medan ambient. Ia bukan paket desain survei, dan tidak menghilangkan kebutuhan koreksi lapangan yang cermat.',
        ),
      ],
    },
  ],
}
