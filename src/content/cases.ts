import type { MethodId } from './methods'
import { L, type Bilingual } from './site'

export interface CaseStudy {
  id: string
  methodId: MethodId
  year: number
  place: Bilingual
  title: Bilingual
  question: Bilingual
  setup: Bilingual
  finding: Bilingual
  lesson: Bilingual
  tryIt: Bilingual
  figureId: FigureId
  sourceId: string
}

export type FigureId =
  | 'gpr-acquisition'
  | 'gpr-peat'
  | 'mag-acquisition'
  | 'mag-profile'
  | 'gravity-acquisition'
  | 'gravity-basin'
  | 'reflection-acquisition'
  | 'reflection-fold'
  | 'reflection-tarakan'
  | 'refraction-acquisition'
  | 'refraction-airport'
  | 'resistivity-acquisition'
  | 'resistivity-aquifer'
  | 'hvsr-acquisition'
  | 'hvsr-curve'

export interface FigureMeta {
  title: Bilingual
  caption: Bilingual
}

export const figureMeta: Record<FigureId, FigureMeta> = {
  'gpr-acquisition': {
    title: L('GPR acquisition geometry', 'Geometri akuisisi GPR'),
    caption: L(
      'A shielded antenna is moved along a line while it transmits and receives short radar pulses. Trace spacing controls horizontal sampling. Original schematic by KawruhBhumi Lab.',
      'Antena terlindung digerakkan sepanjang lintasan sambil memancarkan dan menerima pulsa radar pendek. Spasi trace mengendalikan sampling horizontal. Skema asli KawruhBhumi Lab.',
    ),
  },
  'gpr-peat': {
    title: L('Peat thickness from a radargram', 'Ketebalan gambut dari radargram'),
    caption: L(
      'A strong reflection marks the peat–mineral-soil boundary. Boreholes calibrate the radar velocity, turning two-way time into thickness. Redrawn after Rais et al. (2026), CC BY-compatible journal terms.',
      'Refleksi kuat menandai batas gambut–tanah mineral. Lubang bor mengkalibrasi kecepatan radar sehingga waktu dua arah menjadi ketebalan. Digambar ulang setelah Rais dkk. (2026).',
    ),
  },
  'mag-acquisition': {
    title: L('Total-field magnetic profile', 'Profil magnetik medan total'),
    caption: L(
      'A proton-precession magnetometer measures the total field at stations along a profile. Diurnal drift and regional trends must be removed before anomaly interpretation. Original schematic.',
      'Magnetometer presesi proton mengukur medan total pada stasiun sepanjang profil. Drift diurnal dan tren regional harus dihilangkan sebelum interpretasi anomali. Skema asli.',
    ),
  },
  'mag-profile': {
    title: L('Magnetic anomaly over a shallow body', 'Anomali magnetik di atas tubuh dangkal'),
    caption: L(
      'A dipolar anomaly is symmetric about the body in a vertical-field setting; its width and amplitude constrain depth and magnetization. Schematic after the survey geometry of Safitri et al. (2026).',
      'Anomali dipol simetris terhadap tubuh pada medan vertikal; lebarnya dan amplitudonya membatasi kedalaman dan magnetisasi. Skema mengikuti geometri survei Safitri dkk. (2026).',
    ),
  },
  'gravity-acquisition': {
    title: L('Relative gravity survey', 'Survei gravitasi relatif'),
    caption: L(
      'A gravimeter measures small differences in gravitational acceleration between stations. Drift, tide, elevation and terrain corrections precede anomaly modelling. Original schematic.',
      'Gravimeter mengukur perbedaan kecil percepatan gravitasi antarstasiun. Koreksi drift, pasang surut, elevasi, dan topografi dilakukan sebelum pemodelan anomali. Skema asli.',
    ),
  },
  'gravity-basin': {
    title: L('Gravity expression of a sedimentary basin', 'Ekspresi gravitasi cekungan sedimen'),
    caption: L(
      'Low-density basin fill produces a broad negative anomaly. The shape depends on density contrast, depth and basin geometry — not on depth alone. Original schematic.',
      'Isi cekungan berdensitas rendah menghasilkan anomali negatif lebar. Bentuknya bergantung pada kontras densitas, kedalaman, dan geometri cekungan — bukan kedalaman saja. Skema asli.',
    ),
  },
  'reflection-acquisition': {
    title: L('Common-shot reflection geometry', 'Geometri refleksi common-shot'),
    caption: L(
      'A source at the surface radiates elastic waves; receivers at increasing offsets record reflections. Normal moveout and stacking turn many traces into one zero-offset image. Original schematic.',
      'Sumber di permukaan meradiasikan gelombang elastik; receiver pada offset meningkat merekam refleksi. Normal moveout dan stacking mengubah banyak trace menjadi satu citra zero-offset. Skema asli.',
    ),
  },
  'reflection-fold': {
    title: L('Anticline and syncline in a seismic section', 'Antiklin dan sinklin pada penampang seismik'),
    caption: L(
      'Reflections dip away from an anticline crest and toward a syncline trough. In a time section, the apparent geometry also depends on velocity. Original schematic.',
      'Refleksi miring menjauhi puncak antiklin dan menuju palung sinklin. Pada penampang waktu, geometri semu juga bergantung pada kecepatan. Skema asli.',
    ),
  },
  'reflection-tarakan': {
    title: L('Rollover fold above mobile shale', 'Lipatan rollover di atas serpih mobil'),
    caption: L(
      'Listric normal faults detach on mobile shale; hanging-wall rollover and crestal grabens form above the detachment. Simplified after Erdi et al. (2023), CC BY-NC 4.0.',
      'Sesar normal listrik terlepas pada serpih mobil; rollover hanging-wall dan graben krestal terbentuk di atas detachment. Disederhanakan setelah Erdi dkk. (2023), CC BY-NC 4.0.',
    ),
  },
  'refraction-acquisition': {
    title: L('Seismic refraction spread', 'Bentangan refraksi seismik'),
    caption: L(
      'A hammer or accelerated-weight source is struck at one end of a geophone line. First-arrival times versus offset reveal the velocity of each layer. Original schematic.',
      'Sumber palu atau accelerated weight drop dipukul di ujung lintasan geofon. Waktu tiba pertama terhadap offset mengungkap kecepatan tiap lapisan. Skema asli.',
    ),
  },
  'refraction-airport': {
    title: L('Airport site investigation', 'Investigasi situs bandara'),
    caption: L(
      'Refraction tomography and MASW resolve shallow low-modulus layers and the groundwater table beneath a taxiway. Schematic after Diniyarti et al. (2026), CC BY-SA 4.0.',
      'Tomografi refraksi dan MASW meresolusi lapisan dangkal bermodulus rendah dan muka air tanah di bawah taxiway. Skema setelah Diniyarti dkk. (2026), CC BY-SA 4.0.',
    ),
  },
  'resistivity-acquisition': {
    title: L('Four-electrode resistivity array', 'Susunan resistivitas empat elektroda'),
    caption: L(
      'Current electrodes A–B inject direct current; potential electrodes M–N measure the voltage. Apparent resistivity is computed from current, voltage and the geometric factor. Original schematic.',
      'Elektroda arus A–B menginjeksikan arus searah; elektroda potensial M–N mengukur tegangan. Resistivitas semu dihitung dari arus, tegangan, dan faktor geometri. Skema asli.',
    ),
  },
  'resistivity-aquifer': {
    title: L('Resistivity model of a shallow aquifer', 'Model resistivitas akuifer dangkal'),
    caption: L(
      'A saturated sandy aquifer is more conductive than dry overburden but more resistive than clay. The inversion is non-unique; boreholes are essential. Original schematic.',
      'Akuifer pasir jenuh lebih konduktif daripada lapisan penutup kering tetapi lebih resistif daripada lempung. Inversinya tidak unik; lubang bor sangat penting. Skema asli.',
    ),
  },
  'hvsr-acquisition': {
    title: L('Three-component microtremor station', 'Stasiun mikrotremor tiga komponen'),
    caption: L(
      'A three-component seismometer records ambient vibrations. The horizontal-to-vertical spectral ratio uses the two horizontal components and the vertical component. Original schematic.',
      'Seismometer tiga komponen merekam getaran ambien. Rasio spektral horizontal-terhadap-vertikal memakai dua komponen horizontal dan satu komponen vertikal. Skema asli.',
    ),
  },
  'hvsr-curve': {
    title: L('Reading an H/V curve', 'Membaca kurva H/V'),
    caption: L(
      'The fundamental resonance f0 is the peak of the H/V curve; A0 is its amplitude. A flat curve indicates little impedance contrast or a very thick/low-velocity column. Original schematic.',
      'Resonansi dasar f0 adalah puncak kurva H/V; A0 adalah amplitudonya. Kurva datar menunjukkan kontras impedansi kecil atau kolom sangat tebal/berkecepatan rendah. Skema asli.',
    ),
  },
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'kubu-raya-peat',
    methodId: 'gpr',
    year: 2026,
    place: L('Kubu Raya, West Kalimantan', 'Kubu Raya, Kalimantan Barat'),
    title: L('How thick is the peat?', 'Seberapa tebal gambut itu?'),
    question: L(
      'Can cheap, non-invasive radar replace dense coring to estimate peat thickness and volume?',
      'Bisakah radar non-invasif yang murah menggantikan pengamboran rapat untuk memperkirakan ketebalan dan volume gambut?',
    ),
    setup: L(
      'An 80 MHz GPR system was towed along 23 tracks; three boreholes calibrated the peat velocity.',
      'Sistem GPR 80 MHz ditarik sepanjang 23 lintasan; tiga lubang bor mengkalibrasi kecepatan gambut.',
    ),
    finding: L(
      'Peat was 0.8–4.2 m thick, thickest in the east. The calibrated velocity was 0.026 m/ns and the estimated peat volume was 4.8 × 10⁷ m³.',
      'Gambut setebal 0,8–4,2 m, paling tebal di timur. Kecepatan terkalibrasi 0,026 m/ns dan volume gambut diperkirakan 4,8 × 10⁷ m³.',
    ),
    lesson: L(
      'Radar gives continuous cover, but the thickness scale depends on a velocity calibrated independently — the boreholes are part of the measurement, not an afterthought.',
      'Radar memberi cakupan kontinu, tetapi skala ketebalan bergantung pada kecepatan yang dikalibrasi secara independen — lubang bor adalah bagian dari pengukuran, bukan tambahan belakangan.',
    ),
    tryIt: L('Lower εr and watch the two-way time shorten at the same depth.', 'Turunkan εr dan lihat waktu dua arah memendek pada kedalaman yang sama.'),
    figureId: 'gpr-peat',
    sourceId: 'rais2026',
  },
  {
    id: 'ulm-banjarbaru',
    methodId: 'magnetic',
    year: 2026,
    place: L('Banjarbaru, South Kalimantan', 'Banjarbaru, Kalimantan Selatan'),
    title: L('What lies under the campus?', 'Apa yang ada di bawah kampus?'),
    question: L(
      'Can a small magnetic survey distinguish shallow rock units beneath a planned building?',
      'Bisakah survei magnetik kecil membedakan satuan batuan dangkal di bawah bangunan yang direncanakan?',
    ),
    setup: L(
      'Fifty-five stations at 5 m spacing used a proton-precession magnetometer around the ULM Auditorium.',
      'Lima puluh lima stasiun dengan spasi 5 m memakai magnetometer presesi proton di sekitar Auditorium ULM.',
    ),
    finding: L(
      'The total-field anomaly ranged from −1252 to +1725 nT. Two-dimensional models were interpreted as claystone, siltstone and sandstone of the Dahor Formation, with susceptibility about 0.01–0.02 SI.',
      'Anomali medan total berkisar −1252 hingga +1725 nT. Model dua dimensi ditafsirkan sebagai batulempung, batulanau, dan batupasir Formasi Dahor, dengan suseptibilitas sekitar 0,01–0,02 SI.',
    ),
    lesson: L(
      'Magnetic maps respond to susceptibility contrast, not to “rock type” directly. The same geometry with a different magnetization would tell a different story.',
      'Peta magnetik merespons kontras suseptibilitas, bukan “jenis batuan” secara langsung. Geometri yang sama dengan magnetisasi berbeda akan bercerita lain.',
    ),
    tryIt: L('Change the body depth and see how the anomaly widens and weakens.', 'Ubah kedalaman tubuh dan lihat anomali melebar serta melemah.'),
    figureId: 'mag-profile',
    sourceId: 'safitri2026',
  },
  {
    id: 'ppu-gravity',
    methodId: 'gravity',
    year: 2025,
    place: L('Penajam Paser Utara, East Kalimantan', 'Penajam Paser Utara, Kalimantan Timur'),
    title: L('Gravity before the capital', 'Gravitasi sebelum ibu kota'),
    question: L(
      'What can regional gravity mapping tell planners about the subsurface of a new capital region?',
      'Apa yang dapat diberitahukan pemetaan gravitasi regional tentang bawah permukaan kawasan ibu kota baru?',
    ),
    setup: L(
      'A gravity survey was mapped and interpreted together with regional geology across Penajam Paser Utara.',
      'Survei gravitasi dipetakan dan ditafsirkan bersama geologi regional di Penajam Paser Utara.',
    ),
    finding: L(
      'The study uses gravity anomalies to analyse subsurface geology and density structure in the region, providing a regional framework rather than a site-specific foundation design.',
      'Studi ini memakai anomali gravitasi untuk menganalisis geologi bawah permukaan dan struktur densitas regional, memberikan kerangka regional, bukan desain fondasi spesifik situs.',
    ),
    lesson: L(
      'Gravity is a regional screening tool. A broad anomaly narrows where to look; it does not replace drilling or seismic at a construction site.',
      'Gravitasi adalah alat penyaringan regional. Anomali lebar mempersempit tempat yang perlu diperiksa; ia tidak menggantikan pengeboran atau seismik di lokasi konstruksi.',
    ),
    tryIt: L('Make the body deeper and wider; watch the anomaly broaden.', 'Buat tubuh lebih dalam dan lebar; lihat anomalinya melebar.'),
    figureId: 'gravity-basin',
    sourceId: 'subagio2025',
  },
  {
    id: 'lower-kutai',
    methodId: 'reflection',
    year: 2022,
    place: L('Lower Kutai Basin, East Kalimantan', 'Cekungan Kutai Bawah, Kalimantan Timur'),
    title: L('Seeing a folded basin', 'Melihat cekungan yang terlipat'),
    question: L(
      'How do seismic, gravity and magnetotelluric data combine to reveal a folded sedimentary basin?',
      'Bagaimana data seismik, gravitasi, dan magnetotelurik bergabung mengungkap cekungan sedimen yang terlipat?',
    ),
    setup: L(
      'Seismic sections, gravity models and 2D MT inversion were integrated across the Samarinda Anticlinorium.',
      'Penampang seismik, model gravitasi, dan inversi MT 2D diintegrasikan melintasi Antiklinorium Samarinda.',
    ),
    finding: L(
      'The basin fill includes sandstone, black shale, claystone and basement. Conductive MT zones follow thermally altered black shale, interpreted as potential source rock.',
      'Isi cekungan mencakup batupasir, serpih hitam, batulempung, dan basement. Zona MT konduktif mengikuti serpih hitam yang mengalami alterasi termal, ditafsirkan sebagai batuan sumber potensial.',
    ),
    lesson: L(
      'A reflection section is strongest when it is not alone. MT and gravity add information the seismic image cannot supply by itself.',
      'Penampang refleksi paling kuat ketika tidak berdiri sendiri. MT dan gravitasi menambah informasi yang tidak dapat diberikan citra seismik sendirian.',
    ),
    tryIt: L('Raise the velocity contrast and watch reflection strength increase.', 'Naikkan kontras kecepatan dan lihat kekuatan refleksi meningkat.'),
    figureId: 'reflection-fold',
    sourceId: 'irawati2022',
  },
  {
    id: 'apt-pranoto',
    methodId: 'refraction',
    year: 2026,
    place: L('Samarinda, East Kalimantan', 'Samarinda, Kalimantan Timur'),
    title: L('Why is the taxiway subsiding?', 'Mengapa taxiway mengalami penurunan?'),
    question: L(
      'Can seismic methods map the shallow layers and groundwater table beneath an airport taxiway?',
      'Bisakah metode seismik memetakan lapisan dangkal dan muka air tanah di bawah taxiway bandara?',
    ),
    setup: L(
      'Seismic refraction tomography and MASW were combined and checked against nearby boreholes and SPT data.',
      'Tomografi refraksi seismik dan MASW digabungkan lalu diperiksa terhadap lubang bor dan data SPT di sekitarnya.',
    ),
    finding: L(
      'Shallow layers had lower elastic moduli than deeper layers; brittleness increased with depth. The Vp/Vs ratio suggested a groundwater table at about 2.5–3 m.',
      'Lapisan dangkal memiliki modulus elastik lebih rendah daripada lapisan dalam; kerapuhan meningkat dengan kedalaman. Rasio Vp/Vs menunjukkan muka air tanah sekitar 2,5–3 m.',
    ),
    lesson: L(
      'Refraction gives layer velocities, but elastic moduli require density and Poisson’s ratio assumptions. The groundwater interpretation depends on a Vp/Vs model.',
      'Refraksi memberi kecepatan lapisan, tetapi modulus elastik memerlukan asumsi densitas dan rasio Poisson. Interpretasi air tanah bergantung pada model Vp/Vs.',
    ),
    tryIt: L('Change the water-table depth in the model and compare the travel-time curve.', 'Ubah kedalaman muka air tanah pada model dan bandingkan kurva waktu tempuh.'),
    figureId: 'refraction-airport',
    sourceId: 'diniyarti2026',
  },
  {
    id: 'tanah-bumbu',
    methodId: 'resistivity',
    year: 2024,
    place: L('Tanah Bumbu, South Kalimantan', 'Tanah Bumbu, Kalimantan Selatan'),
    title: L('Where is the shallow groundwater?', 'Di mana air tanah dangkal?'),
    question: L(
      'Which resistivity array best reveals a shallow aquifer in a mixed soil–rock setting?',
      'Susunan resistivitas mana yang paling baik mengungkap akuifer dangkal pada setting tanah–batuan campuran?',
    ),
    setup: L(
      'Wenner and dipole–dipole profiles were measured and processed with RES2DINV to build 2D resistivity sections.',
      'Profil Wenner dan dipol–dipol diukur dan diolah dengan RES2DINV untuk membangun penampang resistivitas 2D.',
    ),
    finding: L(
      'The sections identified zones with high groundwater probability and compared how the two arrays image the same subsurface.',
      'Penampang mengidentifikasi zona dengan probabilitas air tanah tinggi dan membandingkan bagaimana kedua susunan mencitrakan bawah permukaan yang sama.',
    ),
    lesson: L(
      'Resistivity is ambiguous: low values can mean water, clay or salinity. The array geometry and independent borehole information decide which interpretation is plausible.',
      'Resistivitas bersifat ambigu: nilai rendah dapat berarti air, lempung, atau salinitas. Geometri susunan dan informasi lubang bor independen menentukan interpretasi yang masuk akal.',
    ),
    tryIt: L('Switch the VES array and compare the sensitivity to the deep layer.', 'Ganti susunan VES dan bandingkan sensitivitas terhadap lapisan dalam.'),
    figureId: 'resistivity-aquifer',
    sourceId: 'wibawa2024',
  },
  {
    id: 'ppu-hvsr',
    methodId: 'hvsr',
    year: 2023,
    place: L('Penajam Paser Utara, East Kalimantan', 'Penajam Paser Utara, Kalimantan Timur'),
    title: L('Listening to the ground before building', 'Mendengarkan tanah sebelum membangun'),
    question: L(
      'How does the new capital region respond to seismic shaking?',
      'Bagaimana kawasan ibu kota baru merespons guncangan seismik?',
    ),
    setup: L(
      'Microtremor data from 21 three-component seismometers were processed into H/V curves.',
      'Data mikrotremor dari 21 seismometer tiga komponen diolah menjadi kurva H/V.',
    ),
    finding: L(
      'Dominant frequency ranged from 0.58 to 13.04 Hz and amplification from 1.41 to 6.41. The study classified the area as low to medium seismic hazard.',
      'Frekuensi dominan berkisar 0,58 hingga 13,04 Hz dan amplifikasi 1,41 hingga 6,41. Studi mengklasifikasikan kawasan sebagai bahaya seismik rendah hingga menengah.',
    ),
    lesson: L(
      'A low f0 means a thick or low-velocity column; a high A0 means a strong impedance contrast. Neither number is a building code by itself.',
      'f0 rendah berarti kolom tebal atau berkecepatan rendah; A0 tinggi berarti kontras impedansi kuat. Tidak ada satu pun angka itu yang menjadi kode bangunan dengan sendirinya.',
    ),
    tryIt: L('Thicken the low-Vs layer and watch f0 move to a lower frequency.', 'Tebalkan lapisan Vs rendah dan lihat f0 bergeser ke frekuensi lebih rendah.'),
    figureId: 'hvsr-curve',
    sourceId: 'mawadah2023',
  },
  {
    id: 'tarakan-folds',
    methodId: 'reflection',
    year: 2023,
    place: L('Tarakan Basin, offshore East Kalimantan', 'Cekungan Tarakan, lepas pantai Kalimantan Timur'),
    title: L('Folds above moving shale', 'Lipatan di atas serpih yang bergerak'),
    question: L(
      'How do listric faults and mobile shale create the folds we interpret on a seismic section?',
      'Bagaimana sesar listrik dan serpih mobil membentuk lipatan yang kita tafsirkan pada penampang seismik?',
    ),
    setup: L(
      'Three-dimensional seismic reflection data imaged normal faults and shale structures in the Neogene section.',
      'Data seismik refleksi tiga dimensi mencitrakan sesar normal dan struktur serpih pada bagian Neogen.',
    ),
    finding: L(
      'Faults up to 74 km long detach on a mobile shale unit. Hanging-wall rollover folds and crestal grabens formed above the detachment as the delta prograded.',
      'Sesar sepanjang hingga 74 km terlepas pada satuan serpih mobil. Lipatan rollover hanging-wall dan graben krestal terbentuk di atas detachment saat delta bergerak maju.',
    ),
    lesson: L(
      'Not every anticline is a buckle fold. Some are rollover folds caused by slip on a listric fault above a weak layer.',
      'Tidak setiap antiklin adalah lipatan tekuk. Sebagian adalah lipatan rollover akibat slip pada sesar listrik di atas lapisan lemah.',
    ),
    tryIt: L('Compare a symmetric anticline with a rollover geometry in the reflection examples.', 'Bandingkan antiklin simetris dengan geometri rollover pada contoh refleksi.'),
    figureId: 'reflection-tarakan',
    sourceId: 'erdi2023',
  },
]

export const caseStudiesByMethod = (methodId: MethodId): CaseStudy[] => caseStudies.filter((c) => c.methodId === methodId)
