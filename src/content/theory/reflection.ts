import { eq, figure, list, note, p, type MethodTheory } from './types'

export const reflectionTheory: MethodTheory = {
  methodId: 'reflection',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'Receivers record reflections as amplitude versus two-way time at many source–receiver offsets; processing turns this into an image.',
        id: 'Receiver merekam refleksi sebagai amplitudo terhadap waktu dua arah pada banyak offset sumber–receiver; pengolahan mengubahnya menjadi citra.',
      },
      minutes: 4,
      blocks: [
        figure('reflection-acquisition'),
        p(
          'A seismic source — a hammer, a vibrator or an explosive — sends elastic waves into the ground. Receivers at the surface record the ground motion as a function of time. Each source–receiver pair produces one trace; a line of receivers produces a shot record.',
          'Sumber seismik — palu, vibrator, atau bahan peledak — mengirim gelombang elastik ke dalam tanah. Receiver di permukaan merekam gerakan tanah sebagai fungsi waktu. Setiap pasangan sumber–receiver menghasilkan satu trace; sederet receiver menghasilkan shot record.',
        ),
        p(
          'Reflections arrive after the wave has travelled down to an interface and back up. Because the source and receiver are separated by an offset, the arrival time is longer than the zero-offset two-way time. Sorting traces by their midpoint and applying normal moveout (NMO) aligns the reflections so they can be stacked.',
          'Refleksi tiba setelah gelombang menjalar turun ke bidang batas dan kembali ke atas. Karena sumber dan receiver terpisah oleh offset, waktu tibanya lebih panjang daripada waktu dua arah pada zero offset. Menyortir trace berdasarkan titik tengahnya dan menerapkan normal moveout (NMO) menyelaraskan refleksi sehingga dapat ditumpuk.',
        ),
        eq('t^2 = t_0^2 + \\frac{x^2}{V_{\\mathrm{rms}}^2}', 'NMO approximation for offset x.', 'Aproximasi NMO untuk offset x.'),
        p(
          'The synthetic workspace shows a zero-offset section and a small gather. The section is what a processed stack approximates; the gather shows the offset-dependent moveout before stacking.',
          'Workspace sintetik menampilkan penampang zero offset dan gather kecil. Penampang adalah pendekatan hasil stack terolah; gather menunjukkan moveout yang bergantung offset sebelum stacking.',
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'The physics, step by step', id: 'Fisikanya, langkah demi langkah' },
      summary: {
        en: 'Reflections occur where acoustic impedance changes. The reflection coefficient sets amplitude and polarity; the wavelet is convolved with the reflectivity series.',
        id: 'Refleksi terjadi di tempat impedansi akustik berubah. Koefisien refleksi menentukan amplitudo dan polaritas; wavelet dikonvolusi dengan deret reflektivitas.',
      },
      minutes: 6,
      blocks: [
        p(
          'At normal incidence, the relevant property is acoustic impedance Z = ρVp, the product of density and compressional velocity. When a wave meets a boundary between two media, the amplitude ratio of the reflected to incident wave follows directly from continuity of pressure and particle velocity.',
          'Pada insidensi normal, properti yang relevan adalah impedansi akustik Z = ρVp, hasil kali densitas dan kecepatan kompresional. Ketika gelombang menemui bidang batas antara dua medium, rasio amplitudo gelombang pantul terhadap gelombang datang mengikuti kontinuitas tekanan dan kecepatan partikel.',
        ),
        eq('R = \\frac{Z_2 - Z_1}{Z_2 + Z_1}', 'Normal-incidence reflection coefficient.', 'Koefisien refleksi pada insidensi normal.'),
        p(
          'A positive R means the reflected wavelet has the same polarity as the incident wavelet; a negative R means it is reversed. The transmitted wave loses the reflected energy, and multiple transmissions reduce deeper amplitudes. The workspace includes cumulative transmission loss ∏(1 − R²) in its relative amplitudes.',
          'R positif berarti wavelet pantul berpolaritas sama dengan wavelet datang; R negatif berarti terbalik. Gelombang transmisi kehilangan energi yang dipantulkan, dan transmisi berganda mengurangi amplitudo di kedalaman. Workspace memasukkan kehilangan transmisi kumulatif ∏(1 − R²) dalam amplitudo relatifnya.',
        ),
        p(
          'The recorded trace is modelled as the convolution of a source wavelet with the reflectivity series. Each interface contributes a spike at its two-way time, scaled by R; the wavelet smears each spike into a short oscillation. Two reflectors closer than about a quarter wavelength interfere, producing a tuning effect rather than two separate events.',
          'Trace terekam dimodelkan sebagai konvolusi wavelet sumber dengan deret reflektivitas. Setiap bidang batas menyumbang spike pada waktu dua arahnya, diskalakan oleh R; wavelet menyebarkan setiap spike menjadi osilasi pendek. Dua reflektor yang lebih dekat dari sekitar seperempat panjang gelombang saling berinterferensi, menghasilkan efek tuning, bukan dua peristiwa terpisah.',
        ),
        eq('s(t) = w(t) * r(t)', 'Convolutional model of a primary reflection trace.', 'Model konvolusi trace refleksi primer.'),
        note(
          'Primaries only',
          'Hanya primer',
          'The teaching model includes primary reflections only. Multiples, mode conversions, attenuation, anisotropy and amplitude-versus-offset effects are deliberately excluded.',
          'Model pengajaran hanya mencakup refleksi primer. Multiple, konversi mode, atenuasi, anisotropi, dan efek amplitudo-terhadap-offset sengaja dikecualikan.',
        ),
      ],
    },
    {
      id: 'model',
      title: { en: 'From traces to a layered model', id: 'Dari trace menjadi model berlapis' },
      summary: {
        en: 'A reflectivity series is built from layer properties, convolved with a wavelet, and displayed in time. Depth requires velocities.',
        id: 'Deret reflektivitas dibangun dari properti lapisan, dikonvolusi dengan wavelet, dan ditampilkan dalam waktu. Kedalaman memerlukan kecepatan.',
      },
      minutes: 5,
      blocks: [
        figure('reflection-fold'),
        p(
          'The forward model starts with layer densities and velocities. It computes impedance contrasts, places reflection coefficients at the correct two-way times, convolves with a Ricker wavelet, and optionally adds transmission losses. The result is a synthetic trace or section that can be compared with a real one.',
          'Model forward dimulai dari densitas dan kecepatan lapisan. Ia menghitung kontras impedansi, menempatkan koefisien refleksi pada waktu dua arah yang benar, mengkonvolusi dengan wavelet Ricker, dan secara opsional menambahkan kehilangan transmisi. Hasilnya adalah trace atau penampang sintetik yang dapat dibandingkan dengan yang nyata.',
        ),
        p(
          'The mapping from time to depth uses the same velocities. In a real workflow, velocities are estimated from moveout, wells or geological knowledge; in the workspace they are known because they generated the data. This is an important distinction: the displayed depth is a conversion, not a recovered model.',
          'Pemetaan dari waktu ke kedalaman memakai kecepatan yang sama. Dalam alur kerja nyata, kecepatan diperkirakan dari moveout, sumur, atau pengetahuan geologi; di workspace kecepatan diketahui karena ia yang menghasilkan data. Ini perbedaan penting: kedalaman yang ditampilkan adalah konversi, bukan model hasil pemulihan.',
        ),
        list(
          ['Reflection time gives interface position in time.', 'Waktu refleksi memberi posisi bidang batas dalam waktu.'],
          ['Amplitude and polarity give the impedance contrast, not the absolute impedance.', 'Amplitudo dan polaritas memberi kontras impedansi, bukan impedansi absolut.'],
          ['Wavelet frequency limits vertical resolution to about λ/4.', 'Frekuensi wavelet membatasi resolusi vertikal sekitar λ/4.'],
          ['A stacked section is an image, not yet an interpretation.', 'Penampang hasil stack adalah citra, belum interpretasi.'],
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Compute a reflection coefficient for a sand–shale interface, then its two-way time and resolution.',
        id: 'Hitung koefisien refleksi untuk bidang batas pasir–serpih, lalu waktu dua arah dan resolusinya.',
      },
      minutes: 4,
      blocks: [
        p(
          'Take a sand with ρ₁ = 2,000 kg/m³ and Vp₁ = 2,000 m/s, over a shale with ρ₂ = 2,400 kg/m³ and Vp₂ = 2,500 m/s. The impedances are Z₁ = 4.0 × 10⁶ and Z₂ = 6.0 × 10⁶ kg/(m²·s).',
          'Ambil pasir dengan ρ₁ = 2.000 kg/m³ dan Vp₁ = 2.000 m/s, di atas serpih dengan ρ₂ = 2.400 kg/m³ dan Vp₂ = 2.500 m/s. Impedansinya Z₁ = 4,0 × 10⁶ dan Z₂ = 6,0 × 10⁶ kg/(m²·s).',
        ),
        eq('R = \\frac{6.0 - 4.0}{6.0 + 4.0} = 0.2', 'A positive reflection with 20 % of the incident amplitude.', 'Refleksi positif dengan 20 % amplitudo datang.'),
        p(
          'If the interface is 500 m deep and the average velocity above it is 2,000 m/s, the zero-offset two-way time is t₀ = 2 × 500 / 2,000 = 0.5 s. A 30 Hz wavelet has wavelength λ = 2,000/30 ≈ 67 m, so vertical resolution is about λ/4 ≈ 17 m. Beds thinner than this will interfere.',
          'Jika bidang batas berada 500 m di bawah permukaan dan kecepatan rata-rata di atasnya 2.000 m/s, waktu dua arah zero offset t₀ = 2 × 500 / 2.000 = 0,5 s. Wavelet 30 Hz memiliki panjang gelombang λ = 2.000/30 ≈ 67 m, sehingga resolusi vertikal sekitar λ/4 ≈ 17 m. Lapisan yang lebih tipis akan berinterferensi.',
        ),
        p(
          'Now imagine a gas-charged sand below: velocity and density both drop, so the impedance decreases and R becomes negative. The event flips polarity. Recognising that flip is a useful interpretation skill, but it is not proof of gas — a similar contrast can come from other lithologies.',
          'Bayangkan pasir berisi gas di bawahnya: kecepatan dan densitas sama-sama turun, sehingga impedansi berkurang dan R menjadi negatif. Peristiwanya berbalik polaritas. Mengenali pembalikan itu adalah keterampilan interpretasi yang berguna, tetapi bukan bukti gas — kontras serupa dapat berasal dari litologi lain.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'The 1D primaries-only model is a teaching idealisation. Real sections include multiples, noise, 3D effects and processing choices.',
        id: 'Model 1D hanya-primer adalah idealisasi pengajaran. Penampang nyata memuat multiple, noise, efek 3D, dan pilihan pengolahan.',
      },
      minutes: 4,
      blocks: [
        p(
          'The largest simplification is the 1D layered earth with normal incidence. Real reflections are recorded over a range of angles, and amplitude varies with offset in ways that carry information about rock properties — but also complicate the simple R formula. Multiples bounce between interfaces and can be mistaken for deeper primaries.',
          'Penyederhanaan terbesar adalah bumi berlapis 1D dengan insidensi normal. Refleksi nyata terekam pada rentang sudut, dan amplitudonya bervariasi terhadap offset dengan cara yang membawa informasi properti batuan — tetapi juga mempersulit rumus R sederhana. Multiple memantul antar-bidang batas dan dapat disalahartikan sebagai primer yang lebih dalam.',
        ),
        list(
          ['Thin beds produce tuning, not separate reflections.', 'Lapisan tipis menghasilkan tuning, bukan refleksi terpisah.'],
          ['A wavelet is not a spike; phase and frequency shape the image.', 'Wavelet bukan spike; fase dan frekuensi membentuk citra.'],
          ['Stacking and migration alter amplitudes and positions.', 'Stacking dan migrasi mengubah amplitudo dan posisi.'],
          ['A bright spot is an amplitude anomaly with several possible causes.', 'Bright spot adalah anomali amplitudo dengan beberapa kemungkinan penyebab.'],
        ),
        p(
          'The simulator is honest about being a forward model: it shows the response of a chosen layered model, primaries only. It does not process field data, and it does not invert for impedance. Those steps belong to a full seismic workflow and require additional data and expertise.',
          'Simulator jujur sebagai model forward: ia menunjukkan respons model berlapis yang dipilih, hanya primer. Ia tidak mengolah data lapangan, dan tidak menginversi impedansi. Langkah itu bagian dari alur kerja seismik lengkap dan memerlukan data serta keahlian tambahan.',
        ),
      ],
    },
  ],
}
