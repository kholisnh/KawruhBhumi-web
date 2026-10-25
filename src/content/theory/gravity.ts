import { eq, figure, list, note, p, type MethodTheory } from './types'

export const gravityTheory: MethodTheory = {
  methodId: 'gravity',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'A gravimeter measures tiny variations in gravitational acceleration caused by subsurface density contrasts.',
        id: 'Gravimeter mengukur variasi sangat kecil percepatan gravitasi yang disebabkan kontras densitas bawah permukaan.',
      },
      minutes: 4,
      blocks: [
        figure('gravity-acquisition'),
        p(
          'A gravimeter measures the local acceleration due to gravity. The absolute value is dominated by the Earth as a whole, so surveys use relative instruments and study the small differences between stations. In exploration geophysics the useful unit is the milligal: 1 mGal = 10⁻⁵ m/s².',
          'Gravimeter mengukur percepatan gravitasi lokal. Nilai absolutnya didominasi bumi secara keseluruhan, sehingga survei memakai instrumen relatif dan mempelajari perbedaan kecil antar-stasiun. Dalam geofisika eksplorasi, satuan yang berguna adalah miligal: 1 mGal = 10⁻⁵ m/s².',
        ),
        p(
          'A dense body adds a little extra downward attraction; a cavity or a salt dome subtracts some. The amplitude is small — microgals to a few mGal for near-surface targets — and must be separated from tides, instrument drift, latitude, elevation and terrain effects. Those corrections are outside the teaching model, which starts from the anomaly itself.',
          'Tubuh padat menambah sedikit tarikan ke bawah; rongga atau kubah garam mengurangi sebagian. Amplitudonya kecil — mikrogal sampai beberapa mGal untuk target dangkal — dan harus dipisahkan dari pasang surut, drift instrumen, lintang, elevasi, dan efek topografi. Koreksi itu di luar model pengajaran, yang langsung mulai dari anomalinya.',
        ),
        list(
          ['Display unit: mGal (and µGal for microgravity work).', 'Satuan tampilan: mGal (dan µGal untuk microgravity).'],
          ['Geometry: station spacing along a profile or across a grid.', 'Geometri: jarak stasiun sepanjang profil atau grid.'],
          ['Density contrast Δρ is the model property being varied.', 'Kontras densitas Δρ adalah properti model yang divariasikan.'],
          ['Noise in the synthetic profile is deterministic and seeded.', 'Noise pada profil sintetik bersifat deterministik dengan seed.'],
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'The physics, step by step', id: 'Fisikanya, langkah demi langkah' },
      summary: {
        en: 'Newton’s law gives the attraction of every mass element; integrating over a body produces the anomaly at the surface.',
        id: 'Hukum Newton memberi tarikan setiap elemen massa; integrasi atas tubuh menghasilkan anomali di permukaan.',
      },
      minutes: 7,
      blocks: [
        p(
          'Newton’s law of gravitation says that every mass attracts every other mass. For a point mass M observed at distance r, the acceleration points toward the mass and decreases as 1/r². A gravimeter measures only the vertical component, which adds the geometric factor z/r for a body below the surface.',
          'Hukum gravitasi Newton menyatakan setiap massa menarik massa lain. Untuk massa titik M yang diamati pada jarak r, percepatan mengarah ke massa dan menurun sebagai 1/r². Gravimeter hanya mengukur komponen vertikal, yang menambahkan faktor geometri z/r untuk tubuh di bawah permukaan.',
        ),
        eq('g_z = \\frac{GM}{r^2}\\,\\frac{z}{r}', 'Vertical attraction of a buried point mass.', 'Tarikan vertikal massa titik terkubur.'),
        p(
          'A real body is not a point. Divide it into small volume elements, each with mass Δρ dV, and add their contributions vectorially. For a body of constant density contrast this volume integral has closed forms for spheres and rectangular prisms. The workspace uses those exact formulas, so the calculation is analytic rather than discretised.',
          'Tubuh nyata bukan titik. Bagi menjadi elemen volume kecil, masing-masing bermassa Δρ dV, lalu jumlahkan kontribusinya secara vektor. Untuk tubuh dengan kontras densitas konstan, integral volume ini memiliki bentuk tertutup untuk bola dan prisma persegi. Workspace memakai rumus eksak tersebut, sehingga perhitungannya analitik, bukan terdiskretisasi.',
        ),
        eq(
          '\\Delta g_z(\\mathbf{r}) = G\\int_V \\Delta\\rho(\\mathbf{r}\')\\,\\frac{z\' - z}{|\\mathbf{r}\' - \\mathbf{r}|^3}\\,dV\'',
          'Vertical component of the anomalous attraction.',
          'Komponen vertikal tarikan anomali.',
        ),
        p(
          'Because the integrand is linear in Δρ, anomalies from several bodies add. This superposition is exact for the gravity field and is one reason potential-field methods are mathematically clean. It is also why separating the contributions of nearby bodies is an interpretation choice, not something the data do automatically.',
          'Karena integran linear terhadap Δρ, anomali dari beberapa tubuh saling menjumlah. Superposisi ini eksak untuk medan gravitasi dan salah satu alasan metode medan potensial bersih secara matematis. Ini juga sebabnya memisahkan kontribusi tubuh-tubuh berdekatan adalah pilihan interpretasi, bukan sesuatu yang dilakukan data secara otomatis.',
        ),
        note(
          'Units matter',
          'Satuan penting',
          'The solver works in SI (m, kg/m³, m/s²) and converts to mGal only for display. A factor-of-10 unit error is easy to make and hard to see on a smooth anomaly curve.',
          'Solver bekerja dalam SI (m, kg/m³, m/s²) dan hanya mengonversi ke mGal untuk tampilan. Kesalahan satuan faktor 10 mudah dibuat dan sulit terlihat pada kurva anomali yang halus.',
        ),
      ],
    },
    {
      id: 'model',
      title: { en: 'From an anomaly to density structure', id: 'Dari anomali menjadi struktur densitas' },
      summary: {
        en: 'The width of an anomaly grows with depth; its amplitude depends on both density contrast and volume. The two cannot be separated from one profile alone.',
        id: 'Lebar anomali bertambah dengan kedalaman; amplitudonya bergantung pada kontras densitas dan volume. Keduanya tidak dapat dipisahkan dari satu profil saja.',
      },
      minutes: 5,
      blocks: [
        figure('gravity-basin'),
        p(
          'The forward map takes a density model and produces a gravity profile or map. A compact shallow body gives a narrow, high-amplitude anomaly; the same mass spread over a larger, deeper volume gives a broad, low-amplitude anomaly. Depth sensitivity falls rapidly with distance, so the method is naturally biased toward shallow structure.',
          'Peta forward mengambil model densitas dan menghasilkan profil atau peta gravitasi. Tubuh dangkal yang kompak memberi anomali sempit beramplitudo tinggi; massa yang sama tersebar pada volume lebih besar dan lebih dalam memberi anomali lebar beramplitudo rendah. Sensitivitas kedalaman menurun cepat terhadap jarak, sehingga metode ini secara alami condong ke struktur dangkal.',
        ),
        p(
          'In the workspace, body position, depth, size and Δρ are chosen, then the exact response is computed. Changing one parameter at a time shows the trade-offs directly. That is the pedagogical point: amplitude alone does not give density, and width alone does not give depth without assuming a geometry.',
          'Di workspace, posisi tubuh, kedalaman, ukuran, dan Δρ dipilih, lalu respons eksaknya dihitung. Mengubah satu parameter setiap kali memperlihatkan trade-off secara langsung. Itulah poin pedagogisnya: amplitudo saja tidak memberi densitas, dan lebar saja tidak memberi kedalaman tanpa mengasumsikan geometri.',
        ),
        list(
          ['Use the anomaly width to estimate depth for a known shape.', 'Gunakan lebar anomali untuk memperkirakan kedalaman bila bentuknya diketahui.'],
          ['Use the map to constrain strike length and 3D geometry.', 'Gunakan peta untuk membatasi panjang strike dan geometri 3D.'],
          ['Compare profiles across several lines before trusting a 2D model.', 'Bandingkan profil pada beberapa lintasan sebelum mempercayai model 2D.'],
          ['Report the regional-field removal; it changes the anomaly you interpret.', 'Laporkan penghilangan medan regional; ia mengubah anomali yang Anda interpretasikan.'],
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Compute the peak anomaly of a dense sphere and see how quickly it fades with depth.',
        id: 'Hitung anomali puncak bola padat dan lihat seberapa cepat ia melemah terhadap kedalaman.',
      },
      minutes: 4,
      blocks: [
        p(
          'Take a sphere of radius 2 m and density contrast Δρ = 1,000 kg/m³, centred 5 m below the surface. Its excess mass is M = Δρ × (4/3)πr³ ≈ 33,500 kg. Directly above the centre, the vertical attraction is g = GMz/r³ with r = 5 m.',
          'Ambil bola berjari-jari 2 m dengan kontras densitas Δρ = 1.000 kg/m³, pusatnya 5 m di bawah permukaan. Massa berlebihnya M = Δρ × (4/3)πr³ ≈ 33.500 kg. Tepat di atas pusat, tarikan vertikalnya g = GMz/r³ dengan r = 5 m.',
        ),
        eq('g_z \\approx 6.674\\times10^{-11}\\times33{,}500\\times5/125 \\approx 8.9\\times10^{-8}\\,\\mathrm{m/s^2}', 'About 0.009 mGal.', 'Sekitar 0,009 mGal.'),
        p(
          'That is a small anomaly, typical of near-surface gravity work and the reason microgal instruments and careful corrections are needed. Doubling the depth to 10 m reduces the attraction by about a factor of eight, while the anomaly becomes roughly twice as wide. The total excess mass is unchanged.',
          'Itu anomali kecil, tipikal pekerjaan gravitasi dekat permukaan dan alasan instrumen mikrogal serta koreksi cermat diperlukan. Menggandakan kedalaman menjadi 10 m mengurangi tarikan sekitar delapan kali, sementara anomalinya menjadi kira-kira dua kali lebih lebar. Massa berlebih totalnya tidak berubah.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'Gravity is deeply non-unique: many mass distributions produce the same field. Corrections and noise also shape the anomaly.',
        id: 'Gravitasi sangat tidak tunggal: banyak distribusi massa menghasilkan medan yang sama. Koreksi dan noise juga membentuk anomalinya.',
      },
      minutes: 4,
      blocks: [
        p(
          'The central limitation is non-uniqueness. An infinite family of density distributions can produce the same external field, and the “null space” is large. Additional geology, boreholes, seismic constraints or petrophysics are needed to choose among them. The forward simulator deliberately shows only the forward direction.',
          'Keterbatasan utamanya adalah ketidaktunggalan. Keluarga distribusi densitas yang tak berhingga dapat menghasilkan medan luar yang sama, dan “ruang nol”-nya besar. Geologi tambahan, lubang bor, kendala seismik, atau petrofisika diperlukan untuk memilih di antaranya. Simulator forward sengaja hanya menunjukkan arah forward.',
        ),
        list(
          ['Terrain and near-surface density variations can dominate small targets.', 'Topografi dan variasi densitas dekat permukaan dapat mendominasi target kecil.'],
          ['Tidal, drift and latitude corrections are assumed already applied.', 'Koreksi pasang surut, drift, dan lintang diasumsikan sudah diterapkan.'],
          ['A point-mass model is a far-field approximation; prisms are more faithful.', 'Model massa titik adalah aproximasi medan jauh; prisma lebih setia.'],
          ['A negative anomaly is a density deficit, not necessarily a hole.', 'Anomali negatif adalah defisit densitas, belum tentu sebuah lubang.'],
        ),
        p(
          'Used honestly, gravity is a reconnaissance and geometry tool: it sees broad density structure, guides drilling, and complements seismic and electromagnetic methods. It rarely identifies a unique body on its own.',
          'Jika digunakan secara jujur, gravitasi adalah alat rekonaisans dan geometri: ia melihat struktur densitas yang lebar, memandu pengeboran, dan melengkapi metode seismik serta elektromagnetik. Ia jarang mengidentifikasi tubuh tunggal sendirian.',
        ),
      ],
    },
  ],
}
