import type { MethodId } from './methods'

interface LText {
  en: string
  id: string
}

export interface GuidedExperiment {
  id: string
  title: LText
  question: LText
  steps: LText[]
  observe: LText
}

const L = (en: string, id: string): LText => ({ en, id })

export const experimentsByMethod: Record<MethodId, GuidedExperiment[]> = {
  gpr: [
    {
      id: 'frequency-depth',
      title: L('Frequency versus depth', 'Frekuensi versus kedalaman'),
      question: L(
        'Will a 900 MHz antenna see deeper or shallower than a 250 MHz antenna?',
        'Apakah antena 900 MHz melihat lebih dalam atau lebih dangkal daripada antena 250 MHz?',
      ),
      steps: [
        L('Predict the trade-off between resolution and penetration.', 'Prediksi trade-off antara resolusi dan penetrasi.'),
        L('Open the sand-over-bedrock scenario and note the reflector depth.', 'Buka skenario pasir di atas batuan dan catat kedalaman reflektor.'),
        L('Run at 250, 500 and 900 MHz; compare arrival time and clarity.', 'Jalankan pada 250, 500, dan 900 MHz; bandingkan waktu tiba dan kejelasan.'),
      ],
      observe: L(
        'Higher frequency usually sharpens shallow events but attenuates faster; lower frequency penetrates farther with lower resolution.',
        'Frekuensi lebih tinggi biasanya mempertajam event dangkal tetapi lebih cepat teratenuasi; frekuensi rendah menembus lebih dalam dengan resolusi lebih rendah.',
      ),
    },
    {
      id: 'wet-clay',
      title: L('Why wet clay hides targets', 'Mengapa lempung basah menyembunyikan target'),
      question: L('What happens to the radargram when conductivity rises?', 'Apa yang terjadi pada radargram ketika konduktivitas naik?'),
      steps: [
        L('Compare the dry-sand and wet-clay scenarios.', 'Bandingkan skenario pasir kering dan lempung basah.'),
        L('Run both without changing the antenna frequency.', 'Jalankan keduanya tanpa mengubah frekuensi antena.'),
        L('Look at the maximum useful two-way time and target visibility.', 'Perhatikan waktu dua arah berguna maksimum dan visibilitas target.'),
      ],
      observe: L(
        'Conductive ground attenuates the signal quickly, so deep reflections disappear even when the target is present.',
        'Tanah konduktif meredam sinyal dengan cepat, sehingga refleksi dalam hilang meskipun target ada.',
      ),
    },
    {
      id: 'pipe-signature',
      title: L('Reading a pipe hyperbola', 'Membaca hiperbola pipa'),
      question: L('How does target depth change the shape of a diffraction hyperbola?', 'Bagaimana kedalaman target mengubah bentuk hiperbola difraksi?'),
      steps: [
        L('Open the buried-pipe scenario and pick the apex.', 'Buka skenario pipa terbenam dan pilih puncak hiperbola.'),
        L('Move the pipe deeper and rerun.', 'Pindahkan pipa lebih dalam lalu jalankan ulang.'),
        L('Compare the apex time and the width of the hyperbola.', 'Bandingkan waktu puncak dan lebar hiperbola.'),
      ],
      observe: L(
        'A deeper pipe produces a later apex and a flatter, wider hyperbola; the shape encodes both depth and velocity.',
        'Pipa yang lebih dalam menghasilkan puncak lebih lambat dan hiperbola lebih datar serta lebar; bentuknya menyandikan kedalaman dan kecepatan.',
      ),
    },
  ],
  magnetic: [
    {
      id: 'depth-width',
      title: L('Depth controls anomaly width', 'Kedalaman mengendalikan lebar anomali'),
      question: L('What happens to a dipole anomaly when the source is buried deeper?', 'Apa yang terjadi pada anomali dipol jika sumber dikubur lebih dalam?'),
      steps: [
        L('Run the buried-sphere scenario and record the anomaly width.', 'Jalankan skenario bola terbenam dan catat lebar anomali.'),
        L('Increase the depth while keeping susceptibility fixed.', 'Tambahkan kedalaman dengan suseptibilitas tetap.'),
        L('Compare peak amplitude and half-width.', 'Bandingkan amplitudo puncak dan setengah lebar.'),
      ],
      observe: L(
        'Deeper sources give broader, weaker anomalies; amplitude falls faster than width grows.',
        'Sumber lebih dalam memberi anomali lebih lebar dan lemah; amplitudo turun lebih cepat daripada pertumbuhan lebar.',
      ),
    },
    {
      id: 'inclination',
      title: L('The magnetic latitude effect', 'Efek lintang magnetik'),
      question: L('Why does a dike look different near the equator?', 'Mengapa dike tampak berbeda dekat ekuator?'),
      steps: [
        L('Compare the high-inclination dike with the equatorial dike.', 'Bandingkan dike inklinasi tinggi dengan dike ekuatorial.'),
        L('Run both and note the symmetry of the anomaly.', 'Jalankan keduanya dan perhatikan simetri anomalinya.'),
        L('Relate the shape to the inducing-field direction.', 'Hubungkan bentuknya dengan arah medan penginduksi.'),
      ],
      observe: L(
        'Near the equator the induced magnetization is more horizontal, so the anomaly becomes asymmetric or bipolar.',
        'Dekat ekuator magnetisasi induksi lebih horizontal, sehingga anomali menjadi asimetris atau bipolar.',
      ),
    },
    {
      id: 'susceptibility',
      title: L('Contrast, not just size', 'Kontras, bukan hanya ukuran'),
      question: L('Can a small high-susceptibility body mimic a large weak body?', 'Dapatkah benda kecil bersuseptibilitas tinggi meniru benda besar yang lemah?'),
      steps: [
        L('Run a small sphere with high susceptibility.', 'Jalankan bola kecil dengan suseptibilitas tinggi.'),
        L('Then run a larger sphere with low susceptibility.', 'Lalu jalankan bola lebih besar dengan suseptibilitas rendah.'),
        L('Match the peak amplitudes and compare the widths.', 'Samakan amplitudo puncak dan bandingkan lebarnya.'),
      ],
      observe: L(
        'Peak amplitude alone is ambiguous; the width and shape help separate size from susceptibility.',
        'Amplitudo puncak saja ambigu; lebar dan bentuk membantu memisahkan ukuran dari suseptibilitas.',
      ),
    },
  ],
  gravity: [
    {
      id: 'depth-breadth',
      title: L('Depth broadens the anomaly', 'Kedalaman melebarkan anomali'),
      question: L('How does burial depth change a gravity anomaly?', 'Bagaimana kedalaman penguburan mengubah anomali gravitasi?'),
      steps: [
        L('Run the shallow-cavity scenario.', 'Jalankan skenario rongga dangkal.'),
        L('Increase the cavity depth and rerun.', 'Tambahkan kedalaman rongga lalu jalankan ulang.'),
        L('Compare the anomaly breadth and peak value.', 'Bandingkan lebar dan nilai puncak anomali.'),
      ],
      observe: L(
        'A deeper body produces a broader, lower-amplitude anomaly because its mass is farther from the stations.',
        'Benda lebih dalam menghasilkan anomali lebih lebar dan rendah karena massanya lebih jauh dari stasiun.',
      ),
    },
    {
      id: 'density-contrast',
      title: L('Sign follows density contrast', 'Tanda mengikuti kontras densitas'),
      question: L('When does a cavity produce a negative anomaly?', 'Kapan rongga menghasilkan anomali negatif?'),
      steps: [
        L('Run a low-density sphere and note the sign.', 'Jalankan bola berdensitas rendah dan catat tandanya.'),
        L('Change the contrast to positive and rerun.', 'Ubah kontras menjadi positif lalu jalankan ulang.'),
        L('Compare the anomaly shape and zero crossings.', 'Bandingkan bentuk anomali dan persilangan nol.'),
      ],
      observe: L(
        'The sign is set by density contrast; the geometry controls the shape, not the sign.',
        'Tanda ditentukan oleh kontras densitas; geometri mengendalikan bentuk, bukan tanda.',
      ),
    },
    {
      id: 'radius-amplitude',
      title: L('Radius versus amplitude', 'Radius versus amplitudo'),
      question: L('Does doubling the radius double the anomaly?', 'Apakah menggandakan radius menggandakan anomali?'),
      steps: [
        L('Run a sphere with radius 1 km and record the peak.', 'Jalankan bola beradius 1 km dan catat puncaknya.'),
        L('Double the radius at the same depth and density contrast.', 'Gandakan radius pada kedalaman dan kontras densitas yang sama.'),
        L('Compare the peak ratio with the volume ratio.', 'Bandingkan rasio puncak dengan rasio volume.'),
      ],
      observe: L(
        'For a sphere the peak scales with volume, so doubling radius multiplies the amplitude by about eight.',
        'Untuk bola, puncak berskala dengan volume, sehingga menggandakan radius mengalikan amplitudo sekitar delapan.',
      ),
    },
  ],
  reflection: [
    {
      id: 'syncline-anticline',
      title: L('Syncline or anticline?', 'Sinklin atau antiklin?'),
      question: L('How do dipping reflections reveal fold geometry?', 'Bagaimana refleksi miring mengungkap geometri lipatan?'),
      steps: [
        L('Compare the syncline and anticline scenarios.', 'Bandingkan skenario sinklin dan antiklin.'),
        L('Run both and trace the same reflector across the section.', 'Jalankan keduanya dan lacak reflektor yang sama melintasi penampang.'),
        L('Decide whether the layers close upward or downward.', 'Tentukan apakah lapisan menutup ke atas atau ke bawah.'),
      ],
      observe: L(
        'Reflectors dip toward the fold axis in a syncline and away from it in an anticline; the section images geometry, not just depth.',
        'Reflektor miring menuju sumbu lipatan pada sinklin dan menjauhinya pada antiklin; penampang mencitrakan geometri, bukan hanya kedalaman.',
      ),
    },
    {
      id: 'offset-resolution',
      title: L('Source-receiver offset', 'Offset sumber-penerima'),
      question: L('Why does offset change the arrival time of a reflection?', 'Mengapa offset mengubah waktu tiba refleksi?'),
      steps: [
        L('Start with a near-offset trace.', 'Mulai dengan trace offset dekat.'),
        L('Increase the offset and observe the same reflector.', 'Tambahkan offset dan amati reflektor yang sama.'),
        L('Compare the normal-moveout curve with the zero-offset time.', 'Bandingkan kurva normal moveout dengan waktu zero-offset.'),
      ],
      observe: L(
        'Offset increases travel time along a hyperbolic moveout; stacking uses this curve to estimate velocity.',
        'Offset menambah waktu tempuh mengikuti moveout hiperbolik; stacking memakai kurva ini untuk memperkirakan kecepatan.',
      ),
    },
    {
      id: 'tuning',
      title: L('Thin-bed tuning', 'Tuning lapisan tipis'),
      question: L('What happens when two reflectors are closer than the wavelet?', 'Apa yang terjadi jika dua reflektor lebih dekat daripada wavelet?'),
      steps: [
        L('Run a model with a thick layer between two contrasts.', 'Jalankan model dengan lapisan tebal di antara dua kontras.'),
        L('Thin the layer until the reflections merge.', 'Tipiskan lapisan hingga refleksinya bergabung.'),
        L('Compare amplitude and apparent thickness.', 'Bandingkan amplitudo dan ketebalan tampak.'),
      ],
      observe: L(
        'Below the tuning thickness the reflections interfere; apparent amplitude and thickness no longer map simply to the layer.',
        'Di bawah ketebalan tuning, refleksi berinterferensi; amplitudo dan ketebalan tampak tidak lagi berkorelasi sederhana dengan lapisan.',
      ),
    },
  ],
  refraction: [
    {
      id: 'hidden-layer',
      title: L('The hidden layer', 'Lapisan tersembunyi'),
      question: L('Can a thin slow layer disappear from a refraction travel-time curve?', 'Dapatkah lapisan lambat tipis hilang dari kurva waktu tempuh refraksi?'),
      steps: [
        L('Run a three-layer model with a thin middle layer.', 'Jalankan model tiga lapisan dengan lapisan tengah tipis.'),
        L('Thin the layer further and rerun.', 'Tipiskan lapisan lebih lanjut lalu jalankan ulang.'),
        L('Look for a missing first-arrival branch.', 'Cari cabang first-arrival yang hilang.'),
      ],
      observe: L(
        'A thin low-velocity layer may never be the first arrival, so it is invisible in a simple refraction interpretation.',
        'Lapisan kecepatan rendah tipis mungkin tidak pernah menjadi first arrival, sehingga tak terlihat dalam interpretasi refraksi sederhana.',
      ),
    },
    {
      id: 'dip',
      title: L('Dipping interface', 'Bidang batas miring'),
      question: L('Why do forward and reverse profiles give different velocities?', 'Mengapa profil maju dan balik memberi kecepatan berbeda?'),
      steps: [
        L('Run a dipping-layer model in the forward direction.', 'Jalankan model lapisan miring arah maju.'),
        L('Reverse the profile direction.', 'Balik arah lintasan.'),
        L('Compare apparent velocities and intercept times.', 'Bandingkan kecepatan semu dan waktu intercept.'),
      ],
      observe: L(
        'Dip makes apparent velocity direction-dependent; forward and reverse shots are needed to separate dip from true velocity.',
        'Kemiringan membuat kecepatan semu bergantung arah; tembakan maju dan balik diperlukan untuk memisahkan kemiringan dari kecepatan sebenarnya.',
      ),
    },
    {
      id: 'geophone-spacing',
      title: L('Geophone spacing and resolution', 'Jarak geofon dan resolusi'),
      question: L('How does station spacing affect the recovered velocity structure?', 'Bagaimana jarak stasiun memengaruhi struktur kecepatan yang diperoleh?'),
      steps: [
        L('Run a profile with dense geophones.', 'Jalankan lintasan dengan geofon rapat.'),
        L('Increase the spacing and rerun.', 'Tambahkan jarak dan jalankan ulang.'),
        L('Compare the number of picks and layer resolution.', 'Bandingkan jumlah pick dan resolusi lapisan.'),
      ],
      observe: L(
        'Coarse spacing saves field time but may miss shallow or thin layers; resolution is limited by the sampling geometry.',
        'Jarak lebar menghemat waktu lapangan tetapi dapat melewatkan lapisan dangkal atau tipis; resolusi dibatasi geometri sampling.',
      ),
    },
  ],
  resistivity: [
    {
      id: 'array-compare',
      title: L('Wenner versus Schlumberger', 'Wenner versus Schlumberger'),
      question: L('How does the electrode array change the apparent-resistivity curve?', 'Bagaimana susunan elektroda mengubah kurva resistivitas semu?'),
      steps: [
        L('Run the same layered model with a Wenner array.', 'Jalankan model berlapis yang sama dengan susunan Wenner.'),
        L('Switch to Schlumberger and rerun.', 'Ganti ke Schlumberger lalu jalankan ulang.'),
        L('Compare curve shape and depth sensitivity.', 'Bandingkan bentuk kurva dan sensitivitas kedalaman.'),
      ],
      observe: L(
        'Different arrays sample the subsurface differently; the same model can produce different apparent-resistivity curves.',
        'Susunan berbeda menyampling bawah permukaan secara berbeda; model yang sama dapat menghasilkan kurva resistivitas semu berbeda.',
      ),
    },
    {
      id: 'conductive-layer',
      title: L('A conductive layer', 'Lapisan konduktif'),
      question: L('What does a low-resistivity layer do to a VES curve?', 'Apa yang dilakukan lapisan resistivitas rendah pada kurva VES?'),
      steps: [
        L('Run a resistive-over-conductive model.', 'Jalankan model resistif di atas konduktif.'),
        L('Lower the middle-layer resistivity.', 'Turunkan resistivitas lapisan tengah.'),
        L('Look for a descending branch and its minimum.', 'Cari cabang menurun dan minimumnya.'),
      ],
      observe: L(
        'A conductive layer produces a low-resistivity branch; its position and shape constrain depth and thickness.',
        'Lapisan konduktif menghasilkan cabang resistivitas rendah; posisi dan bentuknya membatasi kedalaman dan ketebalan.',
      ),
    },
    {
      id: 'depth-sounding',
      title: L('Depth of investigation', 'Kedalaman investigasi'),
      question: L('Does a longer array always see a deeper layer?', 'Apakah susunan lebih panjang selalu melihat lapisan lebih dalam?'),
      steps: [
        L('Run a VES curve with a short maximum spacing.', 'Jalankan kurva VES dengan spasi maksimum pendek.'),
        L('Increase the maximum spacing and rerun.', 'Tambahkan spasi maksimum lalu jalankan ulang.'),
        L('Compare whether the deep branch is resolved.', 'Bandingkan apakah cabang dalam teresolusi.'),
      ],
      observe: L(
        'Longer arrays increase depth of investigation but also average over a larger volume; equivalence still limits uniqueness.',
        'Susunan lebih panjang menambah kedalaman investigasi tetapi juga merata-ratakan volume lebih besar; ekuivalensi tetap membatasi keunikan.',
      ),
    },
  ],
  hvsr: [
    {
      id: 'thickness-frequency',
      title: L('Thickness sets the resonance', 'Ketebalan menentukan resonansi'),
      question: L('What happens to f0 when the soft surface layer thickens?', 'Apa yang terjadi pada f0 ketika lapisan lunak menebal?'),
      steps: [
        L('Run the IKN alluvium scenario and note f0.', 'Jalankan skenario aluvium IKN dan catat f0.'),
        L('Double the thickness of the soft layers.', 'Gandakan ketebalan lapisan lunak.'),
        L('Rerun and compare f0 with the quarter-wave estimate.', 'Jalankan ulang dan bandingkan f0 dengan estimasi seperempat gelombang.'),
      ],
      observe: L(
        'A thicker low-velocity column lowers f0 approximately as f0 ≈ Vs/(4H).',
        'Kolom kecepatan rendah yang lebih tebal menurunkan f0 kira-kira sebagai f0 ≈ Vs/(4H).',
      ),
    },
    {
      id: 'contrast',
      title: L('Impedance contrast and A0', 'Kontras impedansi dan A0'),
      question: L('Does a stronger Vs contrast always produce a larger H/V peak?', 'Apakah kontras Vs lebih kuat selalu menghasilkan puncak H/V lebih besar?'),
      steps: [
        L('Run a moderate-contrast model and note A0.', 'Jalankan model kontras sedang dan catat A0.'),
        L('Increase the half-space Vs and rerun.', 'Tambahkan Vs half-space lalu jalankan ulang.'),
        L('Compare A0 and the sharpness of the peak.', 'Bandingkan A0 dan ketajaman puncak.'),
      ],
      observe: L(
        'A stronger contrast usually sharpens and raises the peak, but attenuation and layer structure also matter.',
        'Kontras lebih kuat biasanya mempertajam dan menaikkan puncak, tetapi atenuasi dan struktur lapisan juga berpengaruh.',
      ),
    },
    {
      id: 'higher-mode-trap',
      title: L('The higher-mode trap', 'Jebakan mode lebih tinggi'),
      question: L('Can the largest H/V peak be a higher mode rather than f0?', 'Dapatkah puncak H/V terbesar merupakan mode lebih tinggi, bukan f0?'),
      steps: [
        L('Run a model with a sharp shallow contrast.', 'Jalankan model dengan kontras dangkal tajam.'),
        L('Compare the global maximum with the quarter-wave estimate.', 'Bandingkan maksimum global dengan estimasi seperempat gelombang.'),
        L('Read the diagnostics warning and the f0 marker.', 'Baca peringatan diagnostik dan penanda f0.'),
      ],
      observe: L(
        'The global maximum can sit above f0; the fundamental is the peak consistent with the quarter-wave depth estimate, not simply the tallest peak.',
        'Maksimum global dapat berada di atas f0; fundamental adalah puncak yang konsisten dengan estimasi kedalaman seperempat gelombang, bukan sekadar puncak tertinggi.',
      ),
    },
  ],
}
