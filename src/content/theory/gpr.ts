import { eq, list, note, p, type MethodTheory } from './types'

export const gprTheory: MethodTheory = {
  methodId: 'gpr',
  chapters: [
    {
      id: 'measurement',
      title: { en: 'What we actually measure', id: 'Apa yang sebenarnya kita ukur' },
      summary: {
        en: 'A radar antenna sends a short pulse into the ground and listens for echoes. The basic data are echo amplitude versus two-way travel time.',
        id: 'Antena radar mengirim pulsa pendek ke dalam tanah lalu mendengarkan gema. Data dasarnya adalah amplitudo gema terhadap waktu tempuh dua arah.',
      },
      minutes: 5,
      blocks: [
        p(
          'Ground-penetrating radar uses an antenna that both transmits and receives. It radiates a short electromagnetic pulse — typically 10 to 1000 MHz — into the ground. Every time the pulse crosses a boundary where the dielectric permittivity or the electrical conductivity changes, part of the energy reflects back.',
          'Radar penembus tanah memakai antena yang sekaligus memancarkan dan menerima. Antena meradiasikan pulsa elektromagnetik pendek — biasanya 10 sampai 1000 MHz — ke dalam tanah. Setiap kali pulsa melewati bidang batas tempat permitivitas dielektrik atau konduktivitas listrik berubah, sebagian energi dipantulkan kembali.',
        ),
        p(
          'The instrument records the returning signal as a function of two-way travel time. Moving the antenna along a line and stacking the traces side by side produces a radargram: horizontal distance on one axis, time on the other, and amplitude as colour or brightness. This is the raw measurement. Depth only appears after we assume a wave velocity.',
          'Instrumen merekam sinyal yang kembali sebagai fungsi waktu tempuh dua arah. Menggerakkan antena sepanjang lintasan dan menyusun trace berdampingan menghasilkan radargram: jarak horizontal pada satu sumbu, waktu pada sumbu lain, dan amplitudo sebagai warna atau kecerahan. Inilah pengukuran mentahnya. Kedalaman baru muncul setelah kita mengasumsikan kecepatan gelombang.',
        ),
        eq('t_{\\mathrm{TWT}} = \\frac{2z}{v}', 'Two-way time is depth divided by velocity, out and back.', 'Waktu dua arah adalah kedalaman dibagi kecepatan, pergi dan kembali.'),
        p(
          'Two practical numbers shape the survey. The wavelength λ = v/f controls resolution; interfaces closer than about a quarter wavelength blur into one event. The time window controls how deep we can see: it must be long enough for the echo to return from the deepest target, and late enough to catch the whole wavelet.',
          'Dua angka praktis membentuk survei. Panjang gelombang λ = v/f mengendalikan resolusi; bidang batas yang jaraknya kurang dari sekitar seperempat panjang gelombang melebur menjadi satu peristiwa. Jendela waktu mengendalikan seberapa dalam kita bisa melihat: harus cukup panjang agar gema dari target terdalam kembali, dan cukup akhir untuk menangkap seluruh wavelet.',
        ),
        list(
          ['Center frequency sets wavelength, resolution and attenuation.', 'Center frequency menentukan panjang gelombang, resolusi, dan atenuasi.'],
          ['Trace spacing sets horizontal sampling; too coarse and small targets are missed.', 'Jarak antar-trace menentukan sampling horizontal; terlalu jarang dan target kecil terlewat.'],
          ['Time window and sampling rate set the recorded time axis.', 'Jendela waktu dan laju sampling menentukan sumbu waktu terekam.'],
          ['Noise level should be reported; a clean synthetic radargram is an idealisation.', 'Tingkat noise harus dilaporkan; radargram sintetik yang bersih adalah idealisasi.'],
        ),
      ],
    },
    {
      id: 'physics',
      title: { en: 'The physics, step by step', id: 'Fisikanya, langkah demi langkah' },
      summary: {
        en: 'In low-loss ground, radar behaves like a wave whose speed is set by permittivity; contrasts in permittivity and conductivity create the reflections.',
        id: 'Di tanah dengan rugi-rugi rendah, radar berperilaku seperti gelombang yang kecepatannya ditentukan permitivitas; kontras permitivitas dan konduktivitas menciptakan refleksi.',
      },
      minutes: 7,
      blocks: [
        p(
          'Start from Maxwell’s equations. In the ground, the electric field of the pulse pushes charges and rotates dipoles. For radar frequencies in dry or moderately wet soil, the displacement current dominates the conduction current. This is the low-loss condition σ/(ωε) ≪ 1, and it lets us treat the pulse as a travelling wave rather than a diffusing field.',
          'Mulai dari persamaan Maxwell. Di dalam tanah, medan listrik pulsa mendorong muatan dan memutar dipol. Pada frekuensi radar di tanah kering atau agak lembap, arus perpindahan mendominasi arus konduksi. Inilah syarat rugi-rugi rendah σ/(ωε) ≪ 1, yang memungkinkan kita memperlakukan pulsa sebagai gelombang menjalar, bukan medan yang berdifusi.',
        ),
        eq('v = \\frac{c}{\\sqrt{\\varepsilon_r}}', 'Wave speed in a non-magnetic, low-loss medium.', 'Kecepatan gelombang dalam medium non-magnetik dengan rugi-rugi rendah.'),
        p(
          'When the wave reaches an interface, the change in impedance forces part of the energy to reflect and part to continue. At normal incidence the reflection coefficient depends only on the square roots of the relative permittivities. A dry-to-wet transition therefore reflects strongly, while two similar soils reflect almost nothing.',
          'Ketika gelombang mencapai bidang batas, perubahan impedansi memaksa sebagian energi dipantulkan dan sebagian diteruskan. Pada insidensi normal, koefisien refleksi hanya bergantung pada akar permitivitas relatif. Transisi kering-ke-basah karena itu memantul kuat, sedangkan dua tanah yang mirip hampir tidak memantulkan apa pun.',
        ),
        eq(
          'R = \\frac{\\sqrt{\\varepsilon_{r1}} - \\sqrt{\\varepsilon_{r2}}}{\\sqrt{\\varepsilon_{r1}} + \\sqrt{\\varepsilon_{r2}}}',
          'Normal-incidence reflection coefficient.',
          'Koefisien refleksi pada insidensi normal.',
        ),
        p(
          'Real ground also absorbs energy. Conduction losses turn the wave into heat, and the amplitude falls approximately exponentially with distance. In the low-loss approximation the attenuation coefficient scales with conductivity and with the square root of permittivity. This is why radar sees far in dry sand and very little in wet clay.',
          'Tanah nyata juga menyerap energi. Rugi-rugi konduksi mengubah gelombang menjadi panas, dan amplitudo menurun kira-kira secara eksponensial terhadap jarak. Dalam aproximasi rugi-rugi rendah, koefisien atenuasi sebanding dengan konduktivitas dan akar permitivitas. Inilah sebabnya radar melihat jauh di pasir kering dan sangat sedikit di lempung basah.',
        ),
        eq('\\alpha \\approx \\frac{\\sigma}{2}\\sqrt{\\frac{\\mu_0}{\\varepsilon_0\\varepsilon_r}}', 'Low-loss attenuation coefficient.', 'Koefisien atenuasi rugi-rugi rendah.'),
      ],
    },
    {
      id: 'model',
      title: { en: 'From echoes to a subsurface picture', id: 'Dari gema menjadi gambaran bawah permukaan' },
      summary: {
        en: 'A layered model plus reflection coefficients, transmission losses, spreading and a wavelet produce a synthetic radargram. Time becomes depth only after a velocity model is chosen.',
        id: 'Model berlapis ditambah koefisien refleksi, kehilangan transmisi, spreading, dan wavelet menghasilkan radargram sintetik. Waktu menjadi kedalaman hanya setelah model kecepatan dipilih.',
      },
      minutes: 6,
      blocks: [
        p(
          'The forward model works in one direction only. We prescribe layers with thickness, εr and σ, place targets, and compute what the antenna would record. Each interface contributes a reflection coefficient; the wave loses energy as it crosses interfaces and as it travels. A Ricker wavelet gives the pulse its shape, and the reflected wavelets are added at their two-way arrival times.',
          'Model forward bekerja hanya dalam satu arah. Kita menetapkan lapisan dengan ketebalan, εr, dan σ, menempatkan target, lalu menghitung apa yang akan direkam antena. Setiap bidang batas menyumbang koefisien refleksi; gelombang kehilangan energi saat melintasi bidang batas dan saat menjalar. Wavelet Ricker memberi bentuk pulsa, dan wavelet yang terpantul dijumlahkan pada waktu tiba dua arahnya.',
        ),
        p(
          'To turn the time axis into depth we use the same velocity model that generated the data. In the workspace, depth conversions are explicitly interpretation aids computed from the known synthetic model — they are not recovered from the data by inversion. In a real survey, velocity would come from common-midpoint analysis, boreholes, or a calibrated petrophysical relation.',
          'Untuk mengubah sumbu waktu menjadi kedalaman kita memakai model kecepatan yang sama yang menghasilkan data. Di workspace, konversi kedalaman secara eksplisit merupakan alat bantu interpretasi yang dihitung dari model sintetik yang diketahui — bukan hasil pemulihan data melalui inversi. Pada survei nyata, kecepatan berasal dari analisis common-midpoint, lubang bor, atau relasi petrofisika yang terkalibrasi.',
        ),
        p(
          'The mapping from model to measurement is many-to-one. A thin layer with a strong contrast and a thicker layer with a weaker contrast can produce similar events; a wet layer and a denser dry layer can both slow the wave. Forward modelling teaches what a model would look like, but it does not prove that the model is the only explanation.',
          'Pemetaan dari model ke pengukuran bersifat banyak-ke-satu. Lapisan tipis dengan kontras kuat dan lapisan lebih tebal dengan kontras lemah dapat menghasilkan peristiwa yang mirip; lapisan basah dan lapisan kering yang lebih padat sama-sama dapat memperlambat gelombang. Pemodelan ke depan mengajarkan bagaimana suatu model akan tampak, tetapi tidak membuktikan bahwa model itu satu-satunya penjelasan.',
        ),
        note(
          'What the forward model does not do',
          'Apa yang tidak dilakukan model forward',
          'It does not invert the radargram for layer properties, and it does not simulate 3D scattering, antenna radiation patterns or frequency-dependent soil properties.',
          'Ia tidak menginversi radargram untuk memperoleh properti lapisan, dan tidak menyimulasikan hamburan 3D, pola radiasi antena, atau sifat tanah yang bergantung frekuensi.',
        ),
      ],
    },
    {
      id: 'example',
      title: { en: 'A worked example', id: 'Contoh perhitungan' },
      summary: {
        en: 'Follow one interface from permittivity contrast to reflection coefficient, travel time and apparent depth.',
        id: 'Ikuti satu bidang batas dari kontras permitivitas ke koefisien refleksi, waktu tempuh, dan kedalaman semu.',
      },
      minutes: 5,
      blocks: [
        p(
          'Take dry sand with εr = 4 over a wet sand layer with εr = 16. The interface is 2 m deep. First compute the wave speed in the dry sand: v = 0.3/√4 = 0.15 m/ns. The two-way travel time is t = 2 × 2 / 0.15 = 26.7 ns.',
          'Ambil pasir kering dengan εr = 4 di atas lapisan pasir basah dengan εr = 16. Bidang batasnya berada 2 m di bawah permukaan. Hitung dulu kecepatan gelombang di pasir kering: v = 0.3/√4 = 0,15 m/ns. Waktu tempuh dua arahnya t = 2 × 2 / 0,15 = 26,7 ns.',
        ),
        eq(
          'R = \\frac{2 - 4}{2 + 4} = -0.33',
          'Negative R means the reflected pulse is polarity-reversed.',
          'R negatif berarti pulsa pantul terbalik polaritasnya.',
        ),
        p(
          'The negative sign is not a mistake. The wave travels from a faster medium into a slower one, so the reflected pulse flips polarity. In the radargram this appears as a strong event with reversed phase. If the water content changes the velocity to 0.075 m/ns below the interface, the same 1 m of wet sand adds 26.7 ns of travel time — the time axis is stretched where the ground is wetter.',
          'Tanda negatif bukan kesalahan. Gelombang menjalar dari medium lebih cepat ke medium lebih lambat, sehingga pulsa pantul terbalik polaritasnya. Di radargram ini tampak sebagai peristiwa kuat dengan fase terbalik. Jika kadar air mengubah kecepatan menjadi 0,075 m/ns di bawah bidang batas, 1 m pasir basah yang sama menambah 26,7 ns waktu tempuh — sumbu waktu merenggang di bagian tanah yang lebih basah.',
        ),
        p(
          'Notice the two separate skills. The forward calculation predicts the arrival time from a known depth. Interpretation goes the other way: an arrival time plus an assumed velocity gives an apparent depth. The workspace shows both, and labels the second as a conversion, not an inversion.',
          'Perhatikan dua keterampilan yang terpisah. Perhitungan forward memprediksi waktu tiba dari kedalaman yang diketahui. Interpretasi berjalan sebaliknya: waktu tiba ditambah kecepatan yang diasumsikan memberi kedalaman semu. Workspace menampilkan keduanya, dan menandai yang kedua sebagai konversi, bukan inversi.',
        ),
      ],
    },
    {
      id: 'limits',
      title: { en: 'Limits and honest interpretation', id: 'Batas dan interpretasi yang jujur' },
      summary: {
        en: 'Radar is powerful in resistive, low-loss ground and nearly blind in conductive clay. Thin layers, multiples and 3D effects complicate simple pictures.',
        id: 'Radar kuat di tanah resistif dengan rugi-rugi rendah dan hampir buta di lempung konduktif. Lapisan tipis, multiple, dan efek 3D mempersulit gambaran sederhana.',
      },
      minutes: 4,
      blocks: [
        p(
          'The low-loss approximation is the first limit. In wet clay, saline soil or seawater, conduction dominates and the radar pulse is absorbed within a metre or less. A clean synthetic radargram in such a medium would be misleading; the synthetic model should be read together with its attenuation warning.',
          'Aproximasi rugi-rugi rendah adalah batas pertama. Di lempung basah, tanah asin, atau air laut, konduksi mendominasi dan pulsa radar terserap dalam satu meter atau kurang. Radargram sintetik yang bersih di medium seperti itu akan menyesatkan; model sintetik harus dibaca bersama peringatan atenuasinya.',
        ),
        list(
          ['Thin beds act as tuning effects, not separate reflections.', 'Lapisan tipis bertindak sebagai efek tuning, bukan refleksi terpisah.'],
          ['Multiples and antenna ringing are not modelled in the basic synthetic.', 'Multiple dan ringing antena tidak dimodelkan pada sintetik dasar.'],
          ['A 2D section assumes no out-of-plane scattering.', 'Penampang 2D mengasumsikan tidak ada hamburan keluar bidang.'],
          ['Different models can fit the same radargram; depth needs an independent velocity constraint.', 'Model berbeda dapat cocok dengan radargram yang sama; kedalaman memerlukan kendali kecepatan independen.'],
        ),
        p(
          'The honest conclusion is modest: radar maps changes in electromagnetic properties, not “objects”. An anomaly is a hypothesis. The simulator is designed to make that hypothesis explicit, with its assumptions visible, rather than to promise a unique answer.',
          'Kesimpulan jujurnya sederhana: radar memetakan perubahan sifat elektromagnetik, bukan “benda”. Anomali adalah hipotesis. Simulator dirancang agar hipotesis itu eksplisit, dengan asumsinya terlihat, bukan untuk menjanjikan jawaban tunggal.',
        ),
      ],
    },
  ],
}
