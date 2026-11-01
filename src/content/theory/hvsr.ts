import { eq, figure, list, note, p, type MethodTheory } from './types'

export const hvsrTheory: MethodTheory = {
  methodId: 'hvsr',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'A three-component seismometer records ambient vibrations. The horizontal-to-vertical spectral ratio compares the two horizontal spectra with the vertical spectrum.',
        id: 'Seismometer tiga komponen merekam getaran ambien. Rasio spektral horizontal-terhadap-vertikal membandingkan dua spektrum horizontal dengan spektrum vertikal.',
      },
      minutes: 5,
      blocks: [
        figure('hvsr-acquisition'),
        p(
          'HVSR — the horizontal-to-vertical spectral ratio — is a passive seismic method. Instead of hitting the ground with a source, we listen to the small vibrations that are always present: wind, traffic, waves, machinery and distant earthquakes. A three-component sensor records ground motion in two horizontal directions (north–east) and one vertical direction.',
          'HVSR — rasio spektral horizontal-terhadap-vertikal — adalah metode seismik pasif. Alih-alih memukul tanah dengan sumber, kita mendengarkan getaran kecil yang selalu ada: angin, lalu lintas, gelombang laut, mesin, dan gempa jauh. Sensor tiga komponen merekam gerakan tanah dalam dua arah horizontal (utara–timur) dan satu arah vertikal.',
        ),
        p(
          'The record is split into windows, each window is Fourier-transformed, and the horizontal amplitude spectrum is divided by the vertical amplitude spectrum. The result is a curve of H/V against frequency. A peak in that curve is interpreted as a resonance of the shallow velocity structure.',
          'Rekaman dibagi menjadi jendela, setiap jendela ditransformasi Fourier, lalu spektrum amplitudo horizontal dibagi spektrum amplitudo vertikal. Hasilnya adalah kurva H/V terhadap frekuensi. Puncak pada kurva itu ditafsirkan sebagai resonansi struktur kecepatan dangkal.',
        ),
        eq('\\mathrm{HV}(f) = \\frac{\\sqrt{H_N^2(f) + H_E^2(f)}}{V_Z(f)}', 'The basic H/V ratio in the frequency domain.', 'Rasio H/V dasar dalam domain frekuensi.'),
        p(
          'Two numbers summarize the curve. The dominant frequency f0 is the frequency of the main peak. The amplification A0 is the height of that peak relative to the low-frequency background. A low f0 usually means a thick or slow near-surface column; a high A0 means a strong impedance contrast.',
          'Dua angka merangkum kurva. Frekuensi dominan f0 adalah frekuensi puncak utama. Amplifikasi A0 adalah tinggi puncak itu relatif terhadap latar frekuensi rendah. f0 rendah biasanya berarti kolom dekat-permukaan yang tebal atau lambat; A0 tinggi berarti kontras impedansi yang kuat.',
        ),
        list(
          ['Use a three-component sensor with a known orientation.', 'Gunakan sensor tiga komponen dengan orientasi yang diketahui.'],
          ['Record long enough to average many windows, and reject transient noise.', 'Rekam cukup lama untuk merata-ratakan banyak jendela, dan tolak noise transien.'],
          ['Report f0 with a uncertainty or at least the window-to-window spread.', 'Laporkan f0 dengan ketidakpastian atau setidaknya sebaran antarjendela.'],
          ['Avoid interpreting a peak at the edge of the reliable frequency band.', 'Hindari menafsirkan puncak di tepi pita frekuensi yang andal.'],
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'Why a soft layer resonates', id: 'Mengapa lapisan lunak beresonansi' },
      summary: {
        en: 'Vertical shear waves trapped in a low-velocity layer interfere constructively at frequencies where the layer thickness is a quarter wavelength.',
        id: 'Gelombang geser vertikal yang terperangkap dalam lapisan berkecepatan rendah berinterferensi konstruktif pada frekuensi ketika ketebalan lapisan seperempat panjang gelombang.',
      },
      minutes: 7,
      blocks: [
        p(
          'Imagine a soft soil layer over a much stiffer half-space. A vertically travelling shear wave bounces between the free surface and the stiffer base. At most frequencies the reflections partly cancel. When the round trip is just right, they add in phase and the surface motion is amplified.',
          'Bayangkan lapisan tanah lunak di atas half-space yang jauh lebih kaku. Gelombang geser yang menjalar vertikal memantul antara permukaan bebas dan dasar yang lebih kaku. Pada sebagian besar frekuensi, refleksinya saling meniadakan sebagian. Ketika perjalanan bolak-balik tepat, keduanya bertambah sefase dan gerakan permukaan diperkuat.',
        ),
        eq('f_0 \\approx \\frac{V_S}{4H}', 'Quarter-wave resonance for a single soft layer of thickness H.', 'Resonansi seperempat gelombang untuk satu lapisan lunak setebal H.'),
        p(
          'The quarter-wave relation is a useful first guess, not a measurement. It assumes a single layer with a sharp base and a much higher velocity below. Real profiles are gradual, and the H/V peak is produced by the whole column, not by one boundary.',
          'Relasi seperempat gelombang adalah tebakan awal yang berguna, bukan pengukuran. Ia mengasumsikan satu lapisan dengan dasar tajam dan kecepatan yang jauh lebih tinggi di bawahnya. Profil nyata bertahap, dan puncak H/V dihasilkan oleh seluruh kolom, bukan oleh satu bidang batas.',
        ),
        eq('A_0 \\approx \\frac{Z_{\\mathrm{base}}}{Z_{\\mathrm{soil}}}', 'First-order amplification scales with the impedance contrast.', 'Amplifikasi orde pertama berskala dengan kontras impedansi.'),
        p(
          'The impedance Z = ρVs controls how much energy is reflected at the base. A large contrast traps energy and raises A0. A small contrast produces a weak, broad peak — sometimes no usable peak at all. The vertical component is not simply “the input”; it also contains Rayleigh-wave motion and local scattering.',
          'Impedansi Z = ρVs mengendalikan seberapa besar energi dipantulkan di dasar. Kontras besar memerangkap energi dan menaikkan A0. Kontras kecil menghasilkan puncak lemah dan lebar — kadang tidak ada puncak yang berguna. Komponen vertikal bukan sekadar “input”; ia juga mengandung gerakan gelombang Rayleigh dan hamburan lokal.',
        ),
        note(
          'A proxy, not a full Rayleigh-wave model',
          'Proksi, bukan model gelombang Rayleigh penuh',
          'The simulator approximates the H/V curve with the horizontal SH transfer function and assumes the incident vertical motion is unity. This reproduces the fundamental resonance and its qualitative sensitivity, but it is not a full ellipticity calculation.',
          'Simulator mengaproksimasi kurva H/V dengan fungsi transfer SH horizontal dan mengasumsikan gerakan vertikal insiden bernilai satu. Ini mereproduksi resonansi dasar dan sensitivitas kualitatifnya, tetapi bukan perhitungan eliptisitas penuh.',
        ),
      ],
    },
    {
      id: 'model',
      title: { en: 'From a curve to a velocity profile', id: 'Dari kurva ke profil kecepatan' },
      summary: {
        en: 'Inversion searches for layered Vs models whose H/V curve fits the observation. Many models can fit; the ensemble, not a single line, is the result.',
        id: 'Inversi mencari model Vs berlapis yang kurva H/V-nya cocok dengan observasi. Banyak model dapat cocok; ensembel, bukan satu garis tunggal, adalah hasilnya.',
      },
      minutes: 8,
      blocks: [
        figure('hvsr-curve'),
        p(
          'Forward modelling answers: “If the ground had this velocity profile, what H/V curve would I see?” Inversion asks the reverse question. We search the space of layer thicknesses and shear-wave velocities for models whose predicted curve matches the observed curve.',
          'Pemodelan ke depan menjawab: “Jika tanah memiliki profil kecepatan ini, kurva H/V seperti apa yang akan terlihat?” Inversi mengajukan pertanyaan sebaliknya. Kita mencari ruang ketebalan lapisan dan kecepatan gelombang geser untuk model yang kurva prediksinya cocok dengan kurva observasi.',
        ),
        p(
          'The search is nonlinear and non-unique. A thick slow layer and a thin fast layer can produce a similar fundamental frequency. The inversion therefore returns an ensemble of acceptable models and a misfit, not a unique truth. The best model is only the best among those sampled.',
          'Pencarian bersifat nonlinear dan tidak unik. Lapisan tebal yang lambat dan lapisan tipis yang cepat dapat menghasilkan frekuensi dasar yang mirip. Karena itu inversi mengembalikan ensembel model yang dapat diterima dan misfit, bukan kebenaran tunggal. Model terbaik hanyalah yang terbaik di antara yang tersampel.',
        ),
        eq('\\chi^2 = \\frac{1}{N}\\sum_{i=1}^{N}\\left[\\ln \\mathrm{HV}_{\\mathrm{obs}}(f_i) - \\ln \\mathrm{HV}_{\\mathrm{mod}}(f_i)\\right]^2', 'Log-space misfit used by the educational search.', 'Misfit dalam ruang log yang dipakai pencarian edukatif.'),
        p(
          'The workspace uses a neighborhood-algorithm-style search inspired by Wathelet et al. (2004): start with a broad random sample, keep the best models, and refine around them with a shrinking perturbation. It is transparent and fast enough for a browser, but it is not Geopsy and should not be used for engineering decisions.',
          'Workspace memakai pencarian bergaya neighborhood algorithm yang terinspirasi Wathelet dkk. (2004): mulai dari sampel acak yang lebar, pertahankan model terbaik, lalu perbaiki di sekitarnya dengan perturbasi yang mengecil. Metode ini transparan dan cukup cepat untuk peramban, tetapi bukan Geopsy dan tidak boleh dipakai untuk keputusan teknik.',
        ),
        list(
          ['More layers fit the curve better but increase non-uniqueness.', 'Lebih banyak lapisan mencocokkan kurva lebih baik tetapi menambah ketidakunikan.'],
          ['The Vs envelope shows where the data constrain the model — and where they do not.', 'Envelope Vs menunjukkan di mana data membatasi model — dan di mana tidak.'],
          ['A low misfit does not prove the model is geologically correct.', 'Misfit rendah tidak membuktikan model benar secara geologis.'],
          ['Boreholes or independent geophysical data are needed to choose among candidates.', 'Lubang bor atau data geofisika independen diperlukan untuk memilih di antara kandidat.'],
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Estimate f0 for a 30 m soft layer, then see how thickness and velocity trade off.',
        id: 'Perkirakan f0 untuk lapisan lunak 30 m, lalu lihat bagaimana ketebalan dan kecepatan saling bertukar.',
      },
      minutes: 5,
      blocks: [
        p(
          'Take a 30 m layer with Vs = 200 m/s over bedrock with Vs = 900 m/s. The quarter-wave estimate is f0 ≈ 200/(4 × 30) = 1.67 Hz. A full transfer-function calculation puts the peak close to this value, with A0 controlled by the impedance contrast.',
          'Ambil lapisan 30 m dengan Vs = 200 m/s di atas batuan dasar Vs = 900 m/s. Perkiraan seperempat gelombang adalah f0 ≈ 200/(4 × 30) = 1,67 Hz. Perhitungan fungsi transfer penuh menempatkan puncak dekat nilai ini, dengan A0 dikendalikan oleh kontras impedansi.',
        ),
        eq('f_0 \\approx \\frac{200}{4 \\times 30} = 1.67\\ \\mathrm{Hz}', 'The same resonance can be produced by a thicker, slower layer or a thinner, faster one.', 'Resonansi yang sama dapat dihasilkan oleh lapisan yang lebih tebal dan lambat atau lebih tipis dan cepat.'),
        p(
          'Double the thickness to 60 m and f0 halves to about 0.83 Hz. Halve the velocity to 100 m/s and f0 also halves. This trade-off is why a single peak cannot determine both thickness and velocity without additional information.',
          'Gandakan ketebalan menjadi 60 m dan f0 menjadi sekitar 0,83 Hz. Turunkan kecepatan menjadi 100 m/s dan f0 juga menjadi setengah. Pertukaran inilah sebabnya satu puncak tidak dapat menentukan ketebalan dan kecepatan secara bersamaan tanpa informasi tambahan.',
        ),
        p(
          'In the workspace, change one layer at a time and watch the curve. Then run the inversion and compare the best model with the model that generated the target. The difference is not a bug; it is the non-uniqueness made visible.',
          'Di workspace, ubah satu lapisan setiap kali dan amati kurvanya. Lalu jalankan inversi dan bandingkan model terbaik dengan model yang menghasilkan target. Perbedaannya bukan bug; itulah ketidakunikan yang dibuat terlihat.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'HVSR is cheap and useful for site resonance, but it is not a soil profile, a building code, or a substitute for boreholes.',
        id: 'HVSR murah dan berguna untuk resonansi situs, tetapi bukan profil tanah, kode bangunan, atau pengganti lubang bor.',
      },
      minutes: 4,
      blocks: [
        p(
          'The method assumes that ambient noise contains enough horizontal and vertical energy across the band of interest. Quiet sites, strong wind, nearby machinery and directional sources can bias the curve. The SESAME guidelines recommend window selection, rejection criteria and a check of the peak’s sharpness and stability.',
          'Metode mengasumsikan noise ambien mengandung cukup energi horizontal dan vertikal pada pita yang diminati. Situs sunyi, angin kencang, mesin di dekatnya, dan sumber terarah dapat membiaskan kurva. Pedoman SESAME merekomendasikan pemilihan jendela, kriteria penolakan, dan pemeriksaan ketajaman serta kestabilan puncak.',
        ),
        list(
          ['A peak at the edge of the band is not a reliable f0.', 'Puncak di tepi pita bukan f0 yang andal.'],
          ['A flat curve can mean a small impedance contrast or a very thick column.', 'Kurva datar dapat berarti kontras impedansi kecil atau kolom sangat tebal.'],
          ['The inversion is non-unique; report an ensemble and a depth range.', 'Inversi tidak unik; laporkan ensembel dan rentang kedalaman.'],
          ['Site resonance is not the same as site hazard; amplification depends on the full profile and the input motion.', 'Resonansi situs tidak sama dengan bahaya situs; amplifikasi bergantung pada profil lengkap dan gerakan input.'],
          ['Never use a classroom H/V inversion as a foundation or zoning decision.', 'Jangan pernah memakai inversi H/V kelas sebagai keputusan fondasi atau zonasi.'],
        ),
        p(
          'The honest conclusion is that HVSR gives a resonance frequency and an amplification estimate. Those are valuable screening numbers. Turning them into a velocity profile requires inversion, independent constraints, and a clear statement of uncertainty.',
          'Kesimpulan jujurnya adalah HVSR memberi frekuensi resonansi dan perkiraan amplifikasi. Itu angka penyaringan yang berharga. Mengubahnya menjadi profil kecepatan memerlukan inversi, kendala independen, dan pernyataan ketidakpastian yang jelas.',
        ),
        note(
          'Educational implementation — deliberate 1D proxy',
          'Implementasi edukatif — proksi 1D yang disengaja',
          'The solver uses a 1D layered SH transfer function, fixed density and Vp/Vs, and an approximate H/V proxy. This is a deliberate scope decision for a browser teaching tool, not a claim of full Rayleigh ellipticity or site-response modelling. The inversion is a simplified neighborhood algorithm, not a Geopsy-compatible workflow. Use it to learn the logic, not to produce a professional site report.',
          'Solver memakai fungsi transfer SH berlapis 1D, densitas dan Vp/Vs tetap, serta proksi H/V. Ini adalah keputusan lingkup yang disengaja untuk alat belajar berbasis peramban, bukan klaim eliptisitas Rayleigh penuh atau pemodelan respons situs. Inversinya adalah neighborhood algorithm sederhana, bukan alur kerja yang kompatibel dengan Geopsy. Gunakan untuk memahami logikanya, bukan untuk menghasilkan laporan situs profesional.',
        ),
      ],
    },
  ],
}
