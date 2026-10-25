import { eq, figure, list, note, p, type MethodTheory } from './types'

export const refractionTheory: MethodTheory = {
  methodId: 'refraction',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'A shot at one end and receivers along a line record first-arrival travel times. The data are a time–distance curve.',
        id: 'Ledakan di satu ujung dan receiver sepanjang lintasan merekam waktu tiba pertama. Datanya adalah kurva waktu–jarak.',
      },
      minutes: 4,
      blocks: [
        figure('refraction-acquisition'),
        p(
          'In a refraction survey a source is triggered at the surface and a line of receivers records the ground motion. Instead of the whole waveform, we usually pick the first arrival: the earliest energy that reaches each receiver. This gives a travel time t for every source–receiver offset x.',
          'Pada survei refraksi, sumber dipicu di permukaan dan sederet receiver merekam gerakan tanah. Alih-alih seluruh bentuk gelombang, kita biasanya memilih tiba pertama: energi paling awal yang mencapai setiap receiver. Ini memberi waktu tempuh t untuk setiap offset sumber–receiver x.',
        ),
        p(
          'The resulting t–x curve is piecewise approximately linear. The slope of each segment is the inverse of a layer velocity, and the break points (crossover distances) mark where a deeper, faster layer starts to arrive first. The intercept time of the head-wave branch carries depth information.',
          'Kurva t–x yang dihasilkan kira-kira linear secara bertahap. Kemiringan setiap segmen adalah kebalikan kecepatan lapisan, dan titik patah (jarak crossover) menandai mulai tibanya lapisan lebih dalam yang lebih cepat. Waktu intercept cabang gelombang kepala membawa informasi kedalaman.',
        ),
        list(
          ['Display units: milliseconds for time, metres for offset.', 'Satuan tampilan: milidetik untuk waktu, meter untuk offset.'],
          ['Source–receiver geometry: shot position, receiver spacing, spread length.', 'Geometri sumber–receiver: posisi tembakan, jarak receiver, panjang bentangan.'],
          ['First-arrival picking is an interpretation step, not raw data.', 'Picking tiba pertama adalah langkah interpretasi, bukan data mentah.'],
          ['A reversed or split spread helps identify dipping interfaces.', 'Bentangan terbalik atau terbelah membantu mengidentifikasi bidang batas miring.'],
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'The physics, step by step', id: 'Fisikanya, langkah demi langkah' },
      summary: {
        en: 'Snell’s law allows critical refraction when a deeper layer is faster. The head wave then travels along the interface and returns to the surface.',
        id: 'Hukum Snell memungkinkan refraksi kritis bila lapisan lebih dalam lebih cepat. Gelombang kepala lalu menjalar sepanjang bidang batas dan kembali ke permukaan.',
      },
      minutes: 7,
      blocks: [
        p(
          'When a wave crosses an interface, the angles obey Snell’s law: sin i₁/V₁ = sin i₂/V₂. If V₂ > V₁, the refracted ray bends away from the normal. At the critical angle the refracted ray runs parallel to the interface, and energy begins to travel along it.',
          'Ketika gelombang melintasi bidang batas, sudutnya mengikuti hukum Snell: sin i₁/V₁ = sin i₂/V₂. Jika V₂ > V₁, sinar terrefraksi membelok menjauhi garis normal. Pada sudut kritis, sinar terrefraksi berjalan sejajar bidang batas, dan energi mulai menjalar sepanjang bidang itu.',
        ),
        eq('\\sin i_c = \\frac{V_1}{V_2}', 'Critical angle exists only when V₂ > V₁.', 'Sudut kritis hanya ada bila V₂ > V₁.'),
        p(
          'The critically refracted energy continuously radiates back into the upper layer as a head wave. Its path has three parts: down from the source to the interface, along the interface, and up to the receiver. Adding the three travel times gives a straight line in t–x space whose slope is 1/V₂.',
          'Energi yang terrefraksi kritis terus-menerus memancar kembali ke lapisan atas sebagai gelombang kepala. Lintasannya terdiri dari tiga bagian: turun dari sumber ke bidang batas, sepanjang bidang batas, dan naik ke receiver. Menjumlahkan ketiga waktu tempuh memberi garis lurus dalam ruang t–x dengan kemiringan 1/V₂.',
        ),
        eq(
          't_h(x) = \\frac{x}{V_2} + \\frac{2h\\cos i_c}{V_1}',
          'Head-wave travel time for a horizontal interface.',
          'Waktu tempuh gelombang kepala untuk bidang batas horizontal.',
        ),
        p(
          'The direct wave travels at V₁ and follows t = x/V₁. Beyond the crossover distance the head wave arrives first and becomes the first arrival. The intercept time tᵢ = 2h cos i_c/V₁ lets us estimate the thickness h once V₁, V₂ and the intercept are known.',
          'Gelombang langsung menjalar dengan V₁ dan mengikuti t = x/V₁. Di luar jarak crossover, gelombang kepala tiba lebih dulu dan menjadi tiba pertama. Waktu intercept tᵢ = 2h cos i_c/V₁ memungkinkan perkiraan ketebalan h setelah V₁, V₂, dan intercept diketahui.',
        ),
        note(
          'A geometric approximation',
          'Aproximasi geometri',
          'This ray picture assumes sharp, planar interfaces and ignores amplitude, attenuation and the finite width of the head-wave zone. It is a kinematic model: it predicts arrival times, not full waveforms.',
          'Gambaran sinar ini mengasumsikan bidang batas tajam dan planar serta mengabaikan amplitudo, atenuasi, dan lebar berhingga zona gelombang kepala. Ini model kinematik: ia memprediksi waktu tiba, bukan bentuk gelombang penuh.',
        ),
      ],
    },
    {
      id: 'model',
      title: { en: 'From travel times to layer depths', id: 'Dari waktu tempuh menjadi kedalaman lapisan' },
      summary: {
        en: 'Segment slopes give velocities; intercepts give depths. Multiple layers require layer stripping, and some geometries are invisible.',
        id: 'Kemiringan segmen memberi kecepatan; intercept memberi kedalaman. Beberapa lapisan memerlukan layer stripping, dan sebagian geometri tak terlihat.',
      },
      minutes: 5,
      blocks: [
        figure('refraction-airport'),
        p(
          'For a two-layer model the procedure is direct: fit the direct-wave branch to get V₁, fit the head-wave branch to get V₂, read the intercept, and solve for h. For more layers the same idea repeats, but each deeper branch depends on all the layers above it. This is why interpretation is usually done with forward modelling and layer stripping rather than a single formula.',
          'Untuk model dua lapis prosedurnya langsung: fit cabang gelombang langsung untuk V₁, fit cabang gelombang kepala untuk V₂, baca intercept, lalu selesaikan h. Untuk lebih banyak lapisan, gagasan yang sama berulang, tetapi setiap cabang lebih dalam bergantung pada semua lapisan di atasnya. Karena itu interpretasi biasanya dilakukan dengan pemodelan forward dan layer stripping, bukan satu rumus tunggal.',
        ),
        p(
          'In the workspace you set layer velocities and thicknesses, choose a spread length, and compute the travel-time curves. The synthetic picks show which branch is first at each offset. Comparing the computed crossover with a picked one is the forward-modelling habit: propose a model, predict the data, adjust.',
          'Di workspace Anda menetapkan kecepatan dan ketebalan lapisan, memilih panjang bentangan, lalu menghitung kurva waktu tempuh. Pick sintetik menunjukkan cabang mana yang pertama pada setiap offset. Membandingkan crossover terhitung dengan yang dipick adalah kebiasaan pemodelan forward: usulkan model, prediksi data, sesuaikan.',
        ),
        list(
          ['Slope of a branch → layer velocity.', 'Kemiringan cabang → kecepatan lapisan.'],
          ['Intercept time → depth to the refractor.', 'Waktu intercept → kedalaman refraktor.'],
          ['Crossover distance → where the deeper layer becomes first arrival.', 'Jarak crossover → tempat lapisan lebih dalam menjadi tiba pertama.'],
          ['Reversed shots → dip information and consistency checks.', 'Tembakan terbalik → informasi kemiringan dan pemeriksaan konsistensi.'],
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Predict the crossover distance and intercept for a two-layer case with V₁ = 400 m/s, V₂ = 1,600 m/s and h = 10 m.',
        id: 'Prediksi jarak crossover dan intercept untuk kasus dua lapis dengan V₁ = 400 m/s, V₂ = 1.600 m/s dan h = 10 m.',
      },
      minutes: 4,
      blocks: [
        p(
          'The critical angle satisfies sin i_c = 400/1,600 = 0.25, so i_c ≈ 14.5°. The intercept time is tᵢ = 2 × 10 × cos(14.5°)/400 ≈ 48.4 ms. The direct wave follows t = x/400 and the head wave t = 0.0484 + x/1,600 (in seconds).',
          'Sudut kritis memenuhi sin i_c = 400/1.600 = 0,25, sehingga i_c ≈ 14,5°. Waktu intercept tᵢ = 2 × 10 × cos(14,5°)/400 ≈ 48,4 ms. Gelombang langsung mengikuti t = x/400 dan gelombang kepala t = 0,0484 + x/1.600 (dalam sekon).',
        ),
        eq('x_c = \\frac{t_i}{1/V_1 - 1/V_2} \\approx 25.8\\ \\mathrm{m}', 'Beyond ~26 m the head wave arrives first.', 'Di luar ~26 m gelombang kepala tiba lebih dulu.'),
        p(
          'At offsets shorter than about 26 m the direct wave wins; beyond that the head wave wins and the t–x curve steepens to the slower slope 1/1,600. If the refractor were deeper, the intercept and crossover would both move to larger values. If V₂ were only slightly larger than V₁, the crossover would be far away and the depth estimate much less robust.',
          'Pada offset lebih pendek dari sekitar 26 m gelombang langsung menang; di luarnya gelombang kepala menang dan kurva t–x melandai ke kemiringan 1/1.600. Jika refraktor lebih dalam, intercept dan crossover sama-sama bergeser ke nilai lebih besar. Jika V₂ hanya sedikit lebih besar dari V₁, crossover berada jauh dan perkiraan kedalaman jauh lebih rapuh.',
        ),
        p(
          'Notice that the depth depends on the velocity contrast through cos i_c. An error in V₁ propagates into both the intercept and the depth. This sensitivity is a recurring theme in refraction interpretation.',
          'Perhatikan bahwa kedalaman bergantung pada kontras kecepatan melalui cos i_c. Kesalahan pada V₁ merambat ke intercept dan kedalaman. Sensitivitas ini tema berulang dalam interpretasi refraksi.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'Hidden layers, velocity inversions, lateral changes and long offsets all test the simple layered model.',
        id: 'Lapisan tersembunyi, inversi kecepatan, perubahan lateral, dan offset panjang menguji model berlapis sederhana.',
      },
      minutes: 4,
      blocks: [
        p(
          'The textbook two-layer formula assumes a horizontal interface and V₂ > V₁. A low-velocity layer beneath a faster one cannot be seen as a first arrival: the head wave from below arrives later, so the layer is “hidden”. A thin high-velocity layer can also be missed if its head wave is not recorded at the available offsets.',
          'Rumus dua lapis buku teks mengasumsikan bidang batas horizontal dan V₂ > V₁. Lapisan berkecepatan rendah di bawah lapisan lebih cepat tidak dapat terlihat sebagai tiba pertama: gelombang kepala dari bawah tiba lebih lambat, sehingga lapisan itu “tersembunyi”. Lapisan tipis berkecepatan tinggi juga dapat terlewat bila gelombang kepalanya tidak terekam pada offset yang tersedia.',
        ),
        list(
          ['Longer spreads are needed to see deeper refractors.', 'Bentangan lebih panjang diperlukan untuk melihat refraktor lebih dalam.'],
          ['A velocity inversion breaks the simple slope interpretation.', 'Inversi kecepatan merusak interpretasi kemiringan sederhana.'],
          ['Lateral velocity changes make 1D models misleading.', 'Perubahan kecepatan lateral membuat model 1D menyesatkan.'],
          ['First-arrival picking is subjective; report uncertainty.', 'Picking tiba pertama bersifat subjektif; laporkan ketidakpastiannya.'],
        ),
        p(
          'The simulator is a kinematic teaching model. It shows how arrival times depend on layer velocities and depths, and why crossover and intercept matter. It does not model amplitudes, attenuation, dipping layers or full wave propagation.',
          'Simulator adalah model pengajaran kinematik. Ia menunjukkan bagaimana waktu tiba bergantung pada kecepatan dan kedalaman lapisan, serta mengapa crossover dan intercept penting. Ia tidak memodelkan amplitudo, atenuasi, lapisan miring, atau perambatan gelombang penuh.',
        ),
      ],
    },
  ],
}
