import type { Lang } from '../i18n'

export interface Bilingual {
  en: string
  id: string
}

export const L = (en: string, id: string): Bilingual => ({ en, id })

export function tr(value: Bilingual, lang: Lang): string {
  return value[lang]
}

export const site = {
  brand: {
    name: 'KawruhBhumi Lab',
    shortName: 'KawruhBhumi',
    lab: 'Lab',
    tagline: L('Learn. Simulate. Discover.', 'Belajar · Simulasi · Eksplorasi'),
    description: L(
      'KawruhBhumi Lab is a simulation-based geophysics learning space that connects physics theory with the phenomena beneath the Earth’s surface. Explore geophysical methods, run virtual experiments, and build understanding through interactive visualizations.',
      'KawruhBhumi Lab adalah ruang belajar geofisika berbasis simulasi yang menghubungkan teori fisika dengan fenomena bawah permukaan Bumi. Eksplorasi berbagai metode geofisika, lakukan eksperimen virtual, dan bangun pemahaman melalui visualisasi interaktif.',
    ),
  },
  nav: {
    home: L('Home', 'Beranda'),
    methods: L('Methods', 'Metode'),
    theory: L('Theory', 'Teori'),
    simulator: L('Simulator', 'Simulator'),
    resources: L('Resources', 'Referensi'),
    about: L('About', 'Tentang'),
    launch: L('Open Simulator', 'Buka Simulator'),
    language: L('Language', 'Bahasa'),
  },
  landing: {
    badge: L('FRIENDLY GEOPHYSICS, BUILT TO BE UNDERSTOOD', 'GEOFISIKA RAMAH, DIRANCANG UNTUK DIPAHAMI'),
    title1: L('See what the ground', 'Lihat apa yang'),
    title2: L('is hiding.', 'tersembunyi di bawah tanah.'),
    subtitle: L(
      'KawruhBhumi Lab is a simulation-based geophysics learning space that connects physics theory with the phenomena beneath the Earth’s surface. Explore geophysical methods, run virtual experiments, and build understanding through interactive visualizations.',
      'KawruhBhumi Lab adalah ruang belajar geofisika berbasis simulasi yang menghubungkan teori fisika dengan fenomena bawah permukaan Bumi. Eksplorasi berbagai metode geofisika, lakukan eksperimen virtual, dan bangun pemahaman melalui visualisasi interaktif.',
    ),
    ctaPrimary: L('Explore the methods', 'Jelajahi metode'),
    ctaSecondary: L('Read the theory', 'Baca teorinya'),
    caption: L(
      'One synthetic Earth, seven physical perspectives. The scene is an illustrative schematic — not measured or simulated field data.',
      'Satu bumi sintetik, tujuh perspektif fisik. Ilustrasi ini bersifat skematik — bukan data lapangan atau hasil simulasi.',
    ),
    statMethods: L('Guided methods', 'Metode terpandu'),
    statChapters: L('Theory chapters', 'Bab teori'),
    statSolvers: L('Validated solvers', 'Solver tervalidasi'),
    pathsTitle: L('Three ways into the lab', 'Tiga pintu masuk ke laboratorium'),
    pathsSub: L(
      'No long scrolling page. Choose a door: the methods, the theory, or the simulator.',
      'Tidak ada halaman panjang yang harus digulir. Pilih pintunya: metode, teori, atau simulator.',
    ),
    paths: [
      {
        to: '/metode',
        title: L('Methods', 'Metode'),
        body: L(
          'Seven short profiles: what each method measures, why it works, and what it can reveal.',
          'Tujuh profil singkat: apa yang diukur tiap metode, mengapa bekerja, dan apa yang bisa diungkap.',
        ),
        cta: L('Browse methods', 'Lihat metode'),
      },
      {
        to: '/teori',
        title: L('Theory, slowly', 'Teori, perlahan'),
        body: L(
          'Chapter by chapter: the measurement, the physics, the forward model, and the honest limits.',
          'Bab demi bab: pengukuran, fisika, model forward, dan batasnya yang jujur.',
        ),
        cta: L('Open the library', 'Buka pustaka'),
      },
      {
        to: '/simulator',
        title: L('Simulator', 'Simulator'),
        body: L(
          'Change a layered model, run a validated solver, and read the synthetic response immediately.',
          'Ubah model berlapis, jalankan solver tervalidasi, dan baca respons sintetiknya langsung.',
        ),
        cta: L('Start simulating', 'Mulai simulasi'),
      },
    ],
    methodsTitle: L('Seven perspectives on the same ground', 'Tujuh perspektif atas tanah yang sama'),
    disclaimer: L(
      'Educational modelling only. Every solver states its approximations. HVSR includes a clearly labelled inversion experiment; no field measurement is claimed.',
      'Hanya pemodelan untuk edukasi. Setiap solver menyatakan aproximasinya. HVSR menyertakan eksperimen inversi yang diberi label jelas; tidak ada klaim pengukuran lapangan.',
    ),
    disclaimerLink: L('Read the full disclaimer', 'Baca disclaimer lengkap'),
  },
  methodsPage: {
    label: L('SIMULATION METHODS', 'METODE SIMULASI'),
    title: L('Seven ways to see beneath the surface', 'Tujuh cara melihat bawah permukaan'),
    sub: L(
      'Each method observes a different physical property of the same synthetic Earth. Pick a method to read its story, then open its chaptered theory or its workspace.',
      'Setiap metode mengamati properti fisik yang berbeda dari bumi sintetik yang sama. Pilih metode untuk membaca ceritanya, lalu buka teori berbasis bab atau workspace-nya.',
    ),
    theory: L('Read the theory', 'Baca teori'),
    simulator: L('Open simulator', 'Buka simulator'),
    property: L('Measured property', 'Properti yang diukur'),
    chapters: L('chapters', 'bab'),
  },
  methodPage: {
    back: L('All methods', 'Semua metode'),
    overview: L('In one paragraph', 'Dalam satu paragraf'),
    property: L('What is measured', 'Yang diukur'),
    mechanism: L('Why it works', 'Mengapa bekerja'),
    applications: L('Typical uses', 'Penggunaan umum'),
    theoryTitle: L('Guided theory', 'Teori terpandu'),
    theorySub: L('Five short chapters, from the measurement to the honest limits.', 'Lima bab singkat, dari pengukuran sampai batas yang jujur.'),
    startChapter: L('Start with chapter 1', 'Mulai dari bab 1'),
    openSimulator: L('Open the workspace', 'Buka workspace'),
    other: L('Other methods', 'Metode lain'),
    caseTitle: L('Field case', 'Studi kasus lapangan'),
    caseSub: L('A real survey, translated into the same physics used by this workspace.', 'Survei nyata yang diterjemahkan ke fisika yang sama dengan workspace ini.'),
    caseQuestion: L('Question', 'Pertanyaan'),
    caseSetup: L('Survey setup', 'Rancangan survei'),
    caseFinding: L('What was found', 'Temuan'),
    caseLesson: L('What it teaches', 'Pelajaran'),
    caseTry: L('Try it yourself', 'Coba sendiri'),
    caseSource: L('Read the source', 'Baca sumber'),
    caseOpen: L('Open the matching workspace', 'Buka workspace terkait'),
    caseFigure: L('Field-case figure', 'Gambar studi kasus'),
    minutes: L('min read', 'menit baca'),
  },
  theoryPage: {
    label: L('THEORY LIBRARY', 'PUSTAKA TEORI'),
    title: L('From a measurement to a model', 'Dari pengukuran menjadi model'),
    sub: L(
      'Slow, visual explanations written for curious students — not a formal textbook. Each method has five chapters: what we measure, the physics, the forward model, a worked example, and the limits.',
      'Penjelasan perlahan dan visual untuk pelajar yang penasaran — bukan buku teks formal. Setiap metode punya lima bab: apa yang diukur, fisikanya, model forward, contoh perhitungan, dan batasnya.',
    ),
    chapters: L('chapters', 'bab'),
    start: L('Start reading', 'Mulai membaca'),
    browse: L('Browse all chapters', 'Lihat semua bab'),
  },
  chapterPage: {
    theory: L('Theory', 'Teori'),
    method: L('Method', 'Metode'),
    minRead: L('min read', 'menit baca'),
    content: L('In this chapter', 'Dalam bab ini'),
    prev: L('Previous chapter', 'Bab sebelumnya'),
    next: L('Next chapter', 'Bab berikutnya'),
    allChapters: L('All chapters', 'Semua bab'),
    nextMethod: L('Next method', 'Metode berikutnya'),
    simulatorNote: L(
      'Every curve and section in the simulator is computed from the model and equations described here. Forward modelling shows what a given model would produce — it does not recover a unique model from data.',
      'Setiap kurva dan penampang di simulator dihitung dari model dan persamaan yang dijelaskan di sini. Pemodelan ke depan menunjukkan apa yang akan dihasilkan suatu model — ia tidak memulihkan model tunggal dari data.',
    ),
  },
  disclaimer: {
    label: L('HONEST DISCLAIMER', 'DISCLAIMER YANG JUJUR'),
    title: L('A learning tool, not a substitute for field work', 'Alat belajar, bukan pengganti kerja lapangan'),
    sub: L(
      'KawruhBhumi Lab is a small educational project. It is built with care, but it is not a commercial interpretation package or a calibrated instrument.',
      'KawruhBhumi Lab adalah proyek edukasi kecil. Dibuat dengan hati-hati, tetapi bukan paket interpretasi komersial atau instrumen terkalibrasi.',
    ),
    points: [
      {
        title: L('Synthetic data only', 'Hanya data sintetik'),
        body: L(
          'Every response is generated from an explicit model. No measured field data is included, and no result should be treated as a real survey.',
          'Semua respons dihasilkan dari model yang eksplisit. Tidak ada data lapangan yang disertakan, dan tidak ada hasil yang boleh dianggap survei nyata.',
        ),
      },
      {
        title: L('Forward modelling, never inversion', 'Pemodelan ke depan, bukan inversi'),
        body: L(
          'You choose a model and see its response. The app does not claim to recover Earth structure uniquely from observations.',
          'Anda memilih model lalu melihat responsnya. Aplikasi tidak mengklaim memulihkan struktur bumi secara tunggal dari observasi.',
        ),
      },
      {
        title: L('Simplified physics', 'Fisika yang disederhanakan'),
        body: L(
          'The solvers use 1D or 2.5D approximations, idealised sources and no full instrumentation effects. Each workspace lists its assumptions.',
          'Solver memakai aproximasi 1D atau 2.5D, sumber ideal, dan tanpa efek instrumentasi penuh. Setiap workspace mencantumkan asumsinya.',
        ),
      },
      {
        title: L('No professional warranty', 'Tanpa jaminan profesional'),
        body: L(
          'Do not use these outputs for engineering, safety, environmental or investment decisions without independent verification by a qualified professional.',
          'Jangan gunakan keluaran ini untuk keputusan teknik, keselamatan, lingkungan, atau investasi tanpa verifikasi independen oleh profesional yang kompeten.',
        ),
      },
    ],
    devLabel: L('DEVELOPMENT NOTE', 'CATATAN PENGEMBANGAN'),
    devTitle: L('Built with AI assistance', 'Dibangun dengan bantuan AI'),
    devBody: L(
      'This platform was developed with opencode using DeepSeek V4.1 Flash Free. It is an independent educational project and a work in progress; any errors or omissions remain the responsibility of the author, not the tools.',
      'Platform ini dikembangkan dengan opencode menggunakan DeepSeek V4.1 Flash Free. Ini adalah proyek edukasi independen yang masih terus disempurnakan; setiap kesalahan atau kekurangan tetap menjadi tanggung jawab penyusun, bukan alatnya.',
    ),
    devShort: L(
      'Developed with opencode using DeepSeek V4.1 Flash Free.',
      'Dikembangkan dengan opencode menggunakan DeepSeek V4.1 Flash Free.',
    ),
    feedbackTitle: L('Something looks wrong?', 'Ada yang terlihat keliru?'),
    feedbackBody: L(
      'Corrections are genuinely welcome — especially on the physics, references and wording. Please write to the address below and include the method, chapter, and (if relevant) the scenario and parameters.',
      'Koreksi sangat diterima — terutama pada fisika, referensi, dan penulisan. Silakan tulis ke alamat di bawah dan sertakan metode, bab, serta (jika relevan) skenario dan parameternya.',
    ),
    email: 'kholis.nh3@gmail.com',
    thanks: L('Thank you for helping make the lab more honest.', 'Terima kasih telah membantu membuat laboratorium ini lebih jujur.'),
  },
  footer: {
    docs: L('Explore', 'Jelajahi'),
    feedback: L('Feedback', 'Masukan'),
    disclaimer: L('Disclaimer', 'Disclaimer'),
    built: L('Built for teaching. Synthetic data only.', 'Dibuat untuk mengajar. Hanya data sintetik.'),
  },
} as const
