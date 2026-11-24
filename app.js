/**
 * CertiSkill BNSP - Digital Certification & Competency Portal
 * Complete Client-Side Controller with Strict Anti-Cheat Online Exam (CBT)
 * 
 * Features:
 * 1. 6-Tab SPA Router (Beranda, Katalog, Jadwal & Materi, Ujian Online, Sertifikasi, Profile)
 * 2. Strict Online Exam (CBT BNSP):
 *    - Real-time webcam integration (getUserMedia) with fallback proctor simulator
 *    - Tab-switch tracking (visibilitychange / window blur)
 *    - Tolerance: Max 3 times. If tab switched > 3 times, auto-terminates with score 0 (Diskualifikasi)
 *    - Fullscreen enforcement
 *    - Question palette (Answered, Doubtful, Unanswered)
 *    - Official BNSP SKKNI Examination Questions
 *    - Berita Acara Pelanggaran with accurate timestamps
 */

// Simulated verifiable certificates database
const CERTIFICATE_DATABASE = {
  'CERT-2026-8891': {
    id: 'CERT-2026-8891',
    bnspRegNumber: 'MET.000.004891 2026',
    status: 'valid',
    statusText: 'Kompeten (Aktif)',
    recipientName: 'Raden Bagus Prakoso, S.Kom',
    recipientId: 'NIK-327320******0004',
    programTitle: 'Arsitektur Keamanan Awan & Perlindungan Data',
    schemeCode: 'SKM-BNSP-CSO-26',
    skkniStandard: 'SKKNI Nomor 145 Tahun 2021',
    issuerName: 'Lembaga Sertifikasi Profesi Teknologi Digital Nasional',
    issuerAccreditation: 'Badan Nasional Sertifikasi Profesi (BNSP)',
    issuanceDate: '14 Februari 2026',
    expiryDate: '14 Februari 2029',
    timestampAuthority: 'Otoritas Stempel Waktu Resmi Indonesia (TSA-ID-01)',
    sha256Hash: '7e2f9814c8d5b1e94820a4b0810283c4f91a0b38472910482049102938475610',
    competencies: [
      'J.622000.001.01: Merancang arsitektur keamanan Zero Trust pada lingkungan cloud',
      'J.622000.004.01: Mengimplementasikan tata kelola enkripsi data sensitif (AES-256)',
      'J.622000.009.01: Melakukan audit kepatuhan regulasi UU Perlindungan Data Pribadi',
      'J.622000.012.01: Mengelola prosedur tanggap darurat insiden siber dan mitigasi kebocoran'
    ]
  },
  'CERT-2025-5519': {
    id: 'CERT-2025-5519',
    bnspRegNumber: 'MET.000.005519 2025',
    status: 'valid',
    statusText: 'Kompeten (Aktif)',
    recipientName: 'Raden Bagus Prakoso, S.Kom',
    recipientId: 'NIK-327320******0004',
    programTitle: 'Perekayasa Model Pembelajaran Mesin (ML Engineer)',
    schemeCode: 'SKM-BNSP-MLE-04',
    skkniStandard: 'SKKNI Nomor 299 Tahun 2020',
    issuerName: 'Lembaga Sertifikasi Kecerdasan Buatan Terapan',
    issuerAccreditation: 'Badan Nasional Sertifikasi Profesi (BNSP)',
    issuanceDate: '18 Mei 2025',
    expiryDate: '18 Mei 2028',
    timestampAuthority: 'Otoritas Stempel Waktu Resmi Indonesia (TSA-ID-01)',
    sha256Hash: '4f81029384756102938475610293847561029384756102938475610293847561',
    competencies: [
      'J.620100.015.01: Menyiapkan data latih dan rekayasa fitur model AI',
      'J.620100.021.01: Melatih model pembelajaran mesin berakurasi tinggi',
      'J.620100.028.01: Mengintegrasikan model prediktif pada pipeline MLOps produksi'
    ]
  },
  'CERT-2024-4402': {
    id: 'CERT-2024-4402',
    bnspRegNumber: 'MET.000.001102 2023',
    status: 'expired',
    statusText: 'Masa Berlaku Berakhir',
    recipientName: 'Raden Bagus Prakoso, S.Kom',
    recipientId: 'NIK-327320******0004',
    programTitle: 'Petugas Perlindungan Data Pribadi (DPO)',
    schemeCode: 'SKM-BNSP-DPO-08',
    skkniStandard: 'SKKNI Nomor 103 Tahun 2023',
    issuerName: 'Lembaga Sertifikasi Tata Kelola Kepatuhan Digital',
    issuerAccreditation: 'Badan Nasional Sertifikasi Profesi (BNSP)',
    issuanceDate: '10 Januari 2024',
    expiryDate: '10 Januari 2026',
    timestampAuthority: 'Otoritas Stempel Waktu Resmi Indonesia (TSA-ID-01)',
    sha256Hash: '3a18b76c54e2098d71243105a987c0e145283f60871938420195827364510294',
    competencies: [
      'J.631100.001.01: Menyusun Analisis Dampak Perlindungan Data (DPIA)',
      'J.631100.003.01: Melakukan audit kepatuhan pengolahan data pribadi pihak ketiga',
      'J.631100.005.01: Mengelola pemenuhan hak-hak subjek pemilik data pribadi'
    ]
  }
};

// Unit SKKNI Scheme Specifications Catalog & Training Details
const SCHEME_DETAILS_DATA = {
  'CSO-26': {
    code: 'SKM-BNSP-CSO-26',
    title: 'Auditor Forensik Digital & Tanggap Insiden Siber',
    skkni: 'SKKNI Nomor 145 Tahun 2021',
    image: 'assets/images/cyber-security-lab.jpg',
    imageAlt: 'Simulasi investigasi forensik digital dan analisis serangan siber di laboratorium TUK',
    trainingTitle: 'Pelatihan Intensif Investigasi Forensik Digital & Penanganan Insiden Keamanan',
    theoryPractice: '30% Teori & Regulasi SKKNI, 70% Simulasi Lab Insiden Siber',
    tools: 'Autopsy, Wireshark, Volatility Memory Forensics, FTK Imager, Kali Linux',
    facility: 'Laboratorium Siber Terisolasi (Air-gapped Network) & Server Bukti Digital',
    units: [
      'J.622000.001.01 - Melakukan identifikasi artefak bukti digital pada sistem operasi',
      'J.622000.002.01 - Melakukan akuisisi data dan bit-stream image penyimpanan secara forensik',
      'J.622000.003.01 - Memelihara rantai integritas barang bukti elektronik (Chain of Custody)',
      'J.622000.004.01 - Menganalisis jejak serangan siber dan eksfiltrasi data jaringan',
      'J.622000.005.01 - Menyusun Berita Acara Pemeriksaan Teknis Forensik Digital'
    ]
  },
  'MLE-04': {
    code: 'SKM-BNSP-MLE-04',
    title: 'Perekayasa Model Pembelajaran Mesin (ML Engineer)',
    skkni: 'SKKNI Nomor 299 Tahun 2020',
    image: 'assets/images/ai-ml-workshop.jpg',
    imageAlt: 'Lokakarya pelatihan perekayasa model pembelajaran mesin dan arsitektur data pipeline AI',
    trainingTitle: 'Pelatihan Rekayasa Model Machine Learning & Pipeline MLOps Skala Produksi',
    theoryPractice: '25% Teori Algoritma Matematika, 75% Rekayasa Fitur & Deployment Model',
    tools: 'Python 3.11, Scikit-Learn, PyTorch, MLflow, Docker, FastAPI',
    facility: 'GPU High Performance Compute Cluster (NVIDIA Dedicated Lab)',
    units: [
      'J.620100.015.01 - Melakukan pembersihan data tabular dan pra-pemrosesan teks',
      'J.620100.016.01 - Merancang arsitektur model klasifikasi dan regresi terawasi',
      'J.620100.018.01 - Melakukan tuning hyperparameter model menggunakan k-fold cross validation',
      'J.620100.022.01 - Membangun container Docker untuk serving model berbasis REST API',
      'J.620100.025.01 - Melakukan monitoring performa inferensi model di server produksi'
    ]
  },
  'SWA-01': {
    code: 'SKM-BNSP-SWA-01',
    title: 'Arsitek Solusi Perangkat Lunak Skala Besar',
    skkni: 'SKKNI Nomor 044 Tahun 2020',
    image: 'assets/images/software-architecture.jpg',
    imageAlt: 'Pelatihan arsitektur sistem perangkat lunak terdistribusi dan pola desain microservices',
    trainingTitle: 'Pelatihan Perancangan Arsitektur Perangkat Lunak Enterprise & Sistem Terdistribusi',
    theoryPractice: '35% Pola Arsitektur Enterprise, 65% Hands-on Modeling & Stress Testing',
    tools: 'C4 Model, Apache Kafka, Kubernetes, Redis, Terraform, PlantUML',
    facility: 'Enterprise Cloud Sandbox Multi-Node & Infrastructure as Code Simulator',
    units: [
      'J.620100.030.01 - Menentukan strategi dekomposisi layanan microservices',
      'J.620100.031.01 - Merancang pola integrasi sistem antarmuka berbasis Message Broker',
      'J.620100.033.01 - Menetapkan standar keamanan data at-rest dan in-transit',
      'J.620100.035.01 - Menganalisis kapasitas beban throughput dan mitigasi single point of failure',
      'J.620100.038.01 - Menyusun dokumen Software Architecture Document (SAD)'
    ]
  },
  'DPO-08': {
    code: 'SKM-BNSP-DPO-08',
    title: 'Petugas Perlindungan Data Pribadi (DPO)',
    skkni: 'SKKNI Nomor 103 Tahun 2023',
    image: 'assets/images/data-protection.jpg',
    imageAlt: 'Sesi pelatihan kepatuhan regulasi perlindungan data pribadi UU PDP dan audit pemrosesan data',
    trainingTitle: 'Pelatihan Sertifikasi DPO: Tata Kelola Privasi Data & Kepatuhan UU No. 27/2022',
    theoryPractice: '50% Regulasi & Standar ISO 27701, 50% Audit Dokumen DPIA & Studi Kasus',
    tools: 'Data Privacy Impact Assessment (DPIA) Toolkit, Privacy Notice Framework',
    facility: 'Ruang Simulasi Wawancara Audit Kepatuhan & Penyusunan Dokumen Hukum',
    units: [
      'J.631100.001.01 - Menyusun kebijakan internal pemrosesan data pribadi korporasi',
      'J.631100.002.01 - Melaksanakan penilaian dampak perlindungan data pribadi (DPIA)',
      'J.631100.004.01 - Menangani prosedur pelaporan insiden kegagalan perlindungan data dalam 3x24 jam',
      'J.631100.006.01 - Memberikan rekomendasi kepatuhan tata kelola privasi kepada manajemen'
    ]
  },
  'DEV-02': {
    code: 'SKM-BNSP-DEV-02',
    title: 'Pengembang Aplikasi Web Tingkat Lanjut (Lead Fullstack)',
    skkni: 'SKKNI Nomor 044 Tahun 2020',
    image: 'assets/images/web-dev-training.jpg',
    imageAlt: 'Pelatihan pengembangan web fullstack modern penulisan clean code dan pipeline CI CD',
    trainingTitle: 'Pelatihan Fullstack Engineering: API Berkeamanan Tinggi & CI/CD Pipeline',
    theoryPractice: '20% Arsitektur Web Modern, 80% Coding Praktik & Integrasi Pipeline',
    tools: 'Node.js, TypeScript, PostgreSQL, Docker, GitHub Actions, Jest, Vitest',
    facility: 'Workstation Dual-Screen Laboratorium Rekayasa Perangkat Lunak TUK',
    units: [
      'J.620100.007.01 - Mengimplementasikan rancangan antarmuka responsif dan aksesibel',
      'J.620100.009.01 - Mengembangkan logika backend berbasis arsitektur REST / GraphQL',
      'J.620100.011.01 - Menerapkan pengujian unit dan otomatisasi integrasi (CI/CD)'
    ]
  },
  'NET-07': {
    code: 'SKM-BNSP-NET-07',
    title: 'Administrator Pertahanan Jaringan Komputer',
    skkni: 'SKKNI Nomor 321 Tahun 2016',
    image: 'assets/images/network-security.jpg',
    imageAlt: 'Pelatihan administrasi pertahanan jaringan komputer konfigurasi firewall dan filter IDS IPS',
    trainingTitle: 'Pelatihan Konfigurasi Pertahanan Jaringan, Firewall L7 & Segmentasi Zero Trust',
    theoryPractice: '25% Teori Protokol & Topologi Jaringan, 75% Konfigurasi Hardware Riil',
    tools: 'pfSense Enterprise, Cisco IOS, Snort IDS/IPS, OpenVPN, Wireshark',
    facility: 'Rack Server Fisik & Router/Switch Enterprise Laboratorium Jaringan TUK',
    units: [
      'J.612000.005.01 - Mengonfigurasi rule firewall dan filter akses paket data',
      'J.612000.008.01 - Memasang dan memantau sistem deteksi intrusi (IDS/IPS)',
      'J.612000.012.01 - Mengonfigurasi jalur komunikasi terenkripsi VPN IPsec/SSL'
    ]
  }
};

// Official BNSP SKKNI Exam Questions (5 Comprehensive Questions)
const EXAM_QUESTIONS_POOL = [
  {
    id: 1,
    unit: 'Unit: J.622000.001.01 (Identifikasi Artefak Bukti Digital)',
    prompt: 'Saat melakukan investigasi pada komputer target yang masih dalam kondisi menyala (live system), tindakan manakah yang pertama kali HARUS dilakukan sesuai prinsip Order of Volatility (RFC 3227)?',
    options: [
      { key: 'A', text: 'Mencabut kabel daya secara paksa untuk mencegah malware mengeksekusi payload destruktif.' },
      { key: 'B', text: 'Melakukan akuisisi memori RAM (volatil) sebelum data hilang akibat reboot atau shutdown sistem.' },
      { key: 'C', text: 'Melakukan kloning bit-stream pada media hard disk utama (non-volatil).' },
      { key: 'D', text: 'Memeriksa histori peramban internet dan riwayat unduhan berkas.' }
    ],
    correctKey: 'B'
  },
  {
    id: 2,
    unit: 'Unit: J.622000.002.01 (Akuisisi Data Forensik)',
    prompt: 'Mengapa perangkat pemblokir penulisan fisik (Hardware Write Blocker) wajib dipasang di antara media barang bukti dan workstation forensik saat proses kloning?',
    options: [
      { key: 'A', text: 'Mempercepat kecepatan transfer data akuisisi melalui port SATA/NVMe.' },
      { key: 'B', text: 'Menghilangkan proteksi kata sandi pada media penyimpanan yang disita.' },
      { key: 'C', text: 'Mencegah sistem operasi forensik menulis atau memodifikasi sekecil apa pun data pada barang bukti asli.' },
      { key: 'D', text: 'Mengonversi sistem berkas NTFS menjadi format citra RAW (dd) secara instan.' }
    ],
    correctKey: 'C'
  },
  {
    id: 3,
    unit: 'Unit: J.622000.003.01 (Chain of Custody & Integritas Hash)',
    prompt: 'Dalam pembuktian di pengadilan, bagaimana auditor forensik membuktikan bahwa berkas citra bukti forensik (image file) 100% identik dengan kondisi fisik saat penyitaan?',
    options: [
      { key: 'A', text: 'Mencocokkan nilai hash kriptografis (SHA-256 / MD5) berkas citra dengan hash media sumber saat penyitaan.' },
      { key: 'B', text: 'Menunjukkan tanda tangan basah saksi pada segel kantong antistatis.' },
      { key: 'C', text: 'Memeriksa kesamaan ukuran partisi kapasitas hard disk dalam satuan Gigabyte.' },
      { key: 'D', text: 'Mencetak struktur pohon direktori (tree listing) berkas sistem operasi.' }
    ],
    correctKey: 'A'
  },
  {
    id: 4,
    unit: 'Unit: J.622000.004.01 (Analisis Jejak Penetrasi)',
    prompt: 'Pada sistem operasi Windows, artefak manakah yang paling akurat untuk membuktikan bahwa sebuah berkas program biner (.exe) pernah dieksekusi oleh pengguna beserta stempel waktu terakhir eksekusinya?',
    options: [
      { key: 'A', text: 'Berkas Windows Prefetch (.pf) dan catatan UserAssist pada Registry NTUSER.DAT.' },
      { key: 'B', text: 'Berkas hosts pada C:\\Windows\\System32\\drivers\\etc\\hosts.' },
      { key: 'C', text: 'Log berkas sementara di direktori C:\\Windows\\Temp.' },
      { key: 'D', text: 'Koleksi shortcut di folder Recent Documents.' }
    ],
    correctKey: 'A'
  },
  {
    id: 5,
    unit: 'Unit: J.622000.005.01 (Penyusunan Berita Acara Pemeriksaan)',
    prompt: 'Berdasarkan Undang-Undang ITE, informasi elektronik dapat dijadikan alat bukti hukum yang sah apabila memenuhi kriteria keaslian, yaitu:',
    options: [
      { key: 'A', text: 'Dibuat dengan perangkat lunak komersial berlisensi internasional.' },
      { key: 'B', text: 'Dapat diakses, ditampilkan, dijamin keutuhannya, dan dapat dipertanggungjawabkan.' },
      { key: 'C', text: 'Telah dicetak ke atas kertas bermeterai oleh notaris publik.' },
      { key: 'D', text: 'Disimpan pada media komputasi awan yang berlokasi di wilayah Indonesia.' }
    ],
    correctKey: 'B'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const navTabButtons = document.querySelectorAll('.nav-tab-btn');
  const mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const toast = document.getElementById('toast');

  // Modals
  const certModal = document.getElementById('cert-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCertContent = document.getElementById('modal-cert-content');
  const modalCopyLinkBtn = document.getElementById('modal-copy-link-btn');
  const modalDownloadSimBtn = document.getElementById('modal-download-sim-btn');

  const registerModal = document.getElementById('register-modal');
  const regModalCloseBtn = document.getElementById('reg-modal-close-btn');
  const regSchemeDisplay = document.getElementById('reg-scheme-display');
  const schemeRegisterForm = document.getElementById('scheme-register-form');

  let currentActiveCert = null;

  // 1. Toast Notification Helper
  let toastTimer = null;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // 2. Tab Navigation Switcher Engine
  function switchTab(tabId) {
    const targetPane = document.getElementById(`view-${tabId}`);
    if (!targetPane) return;

    // Check if leaving exam while exam is active
    if (examActive && tabId !== 'ujian') {
      const confirmLeave = confirm('PERHATIAN: Ujian online berproktor sedang berlangsung! Berpindah halaman akan dihitung sebagai pelanggaran tab (Toleransi maks 3 kali). Tetap ingin pindah?');
      if (!confirmLeave) return;
      registerTabViolation('Pindah ke tab navigasi: ' + tabId);
    }

    navTabButtons.forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    mobileNavButtons.forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', match);
    });

    tabPanes.forEach(pane => pane.classList.remove('active'));
    targetPane.classList.add('active');

    if (mobileDrawer.classList.contains('open')) {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  mobileNavButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  document.querySelector('.brand-logo').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('beranda');
  });

  document.getElementById('header-user-btn').addEventListener('click', () => switchTab('profil'));

  // Quick jump buttons on Beranda
  const btnHeroStartExam = document.getElementById('btn-hero-start-exam');
  if (btnHeroStartExam) {
    btnHeroStartExam.addEventListener('click', () => switchTab('ujian'));
  }
  const btnGoToExamReminder = document.getElementById('btn-go-to-exam-reminder');
  if (btnGoToExamReminder) {
    btnGoToExamReminder.addEventListener('click', () => switchTab('ujian'));
  }
  const btnJumpKatalog = document.getElementById('btn-jump-katalog');
  if (btnJumpKatalog) {
    btnJumpKatalog.addEventListener('click', () => switchTab('katalog'));
  }
  const btnViewMateriBeranda = document.getElementById('btn-view-materi-beranda');
  if (btnViewMateriBeranda) {
    btnViewMateriBeranda.addEventListener('click', () => switchTab('jadwal'));
  }

  document.querySelectorAll('.footer-tab-link').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // 3. Theme Toggle (Light / Dark)
  const savedTheme = localStorage.getItem('certiskill_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      themeToggleBtn.setAttribute('aria-label', 'Beralih ke mode terang');
      themeToggleBtn.innerHTML = '<span class="material-symbols-outlined theme-icon" aria-hidden="true">light_mode</span>';
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      themeToggleBtn.setAttribute('aria-label', 'Beralih ke mode gelap');
      themeToggleBtn.innerHTML = '<span class="material-symbols-outlined theme-icon" aria-hidden="true">dark_mode</span>';
    }
    localStorage.setItem('certiskill_theme', theme);
  }

  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    applyTheme(isDark ? 'light' : 'dark');
  });

  mobileMenuBtn.addEventListener('click', () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    mobileDrawer.setAttribute('aria-hidden', isExpanded);
    mobileDrawer.classList.toggle('open');
  });

  // ===================================================================
  // 4. CBT EXAM ENGINE WITH CAMERA & 3-STRIKE TAB VIOLATION DETECTION
  // ===================================================================
  let examActive = false;
  let tabViolationsCount = 0;
  const MAX_ALLOWED_VIOLATIONS = 3;
  let violationLogs = []; // { time, reason }
  let userAnswers = {}; // { questionId: 'A' | 'B' | 'C' | 'D' }
  let doubtfulQuestions = {}; // { questionId: true/false }
  let currentQuestionIndex = 0; // 0 to 4
  let examTimerInterval = null;
  let timeRemainingSeconds = 15 * 60; // 15 minutes
  let webcamStream = null;

  // Screens
  const examLobbyScreen = document.getElementById('exam-lobby-screen');
  const examActiveScreen = document.getElementById('exam-active-screen');
  const examResultScreen = document.getElementById('exam-result-screen');
  const examResultCardWrap = document.getElementById('exam-result-card-wrap');

  // Video elements
  const lobbyVideoPreview = document.getElementById('lobby-video-preview');
  const activeExamVideo = document.getElementById('active-exam-video');
  const lobbyCamPlaceholder = document.getElementById('lobby-cam-placeholder');
  const lobbyCamBadge = document.getElementById('lobby-cam-badge');
  const btnRequestWebcam = document.getElementById('btn-request-webcam');
  const btnStartActiveExam = document.getElementById('btn-start-active-exam');

  // Question sheet elements
  const currentQIndexSpan = document.getElementById('current-q-index');
  const qUnitRef = document.getElementById('q-unit-ref');
  const qPromptText = document.getElementById('q-prompt-text');
  const optionsListContainer = document.getElementById('options-list-container');
  const btnPrevQuestion = document.getElementById('btn-prev-question');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const btnFlagDoubt = document.getElementById('btn-flag-doubt');
  const flagDoubtText = document.getElementById('flag-doubt-text');
  const questionNavPalette = document.getElementById('question-nav-palette');
  const examTimerDisplay = document.getElementById('exam-timer-display');
  const violationCountText = document.getElementById('violation-count-text');
  const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');

  // Violation Alert Modal Elements
  const tabViolationModal = document.getElementById('tab-violation-modal');
  const modalCurrentStrikes = document.getElementById('modal-current-strikes');
  const btnAckViolation = document.getElementById('btn-ack-violation');

  // Finish Confirmation Modal
  const confirmFinishModal = document.getElementById('confirm-finish-modal');
  const btnFinishExamTrigger = document.getElementById('btn-finish-exam-trigger');
  const closeFinishModalBtn = document.getElementById('close-finish-modal-btn');
  const btnCancelFinish = document.getElementById('btn-cancel-finish');
  const btnConfirmSubmitExam = document.getElementById('btn-confirm-submit-exam');
  const summaryAnsweredCount = document.getElementById('summary-answered-count');
  const summaryDoubtCount = document.getElementById('summary-doubt-count');

  // Request Webcam Access
  async function setupWebcam(targetVideoElement) {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        webcamStream = stream;
        if (targetVideoElement) {
          targetVideoElement.srcObject = stream;
        }
        if (lobbyCamPlaceholder) {
          lobbyCamPlaceholder.style.display = 'none';
        }
        if (lobbyCamBadge) {
          lobbyCamBadge.textContent = 'Kamera Aktif & Terhubung';
          lobbyCamBadge.className = 'status-badge badge-success';
        }
        showToast('Kamera pengawas berhasil diaktifkan.');
        return true;
      }
    } catch (err) {
      console.warn('Webcam permission denied or not available:', err);
      // Simulated camera mode fallback
      if (lobbyCamPlaceholder) {
        lobbyCamPlaceholder.innerHTML = `
          <span class="material-symbols-outlined text-warning" aria-hidden="true">videocam</span>
          <p><strong>Mode Pengawasan Sensor Virtual Aktif:</strong> Kamera fisik tidak dapat diakses (${err.name}). Sistem mengaktifkan sensor AI kehadiran asesi.</p>
        `;
      }
      if (lobbyCamBadge) {
        lobbyCamBadge.textContent = 'Sensor Virtual AI Aktif';
        lobbyCamBadge.className = 'status-badge badge-warning';
      }
      showToast('Mode pengawasan virtual AI aktif.');
      return false;
    }
  }

  btnRequestWebcam.addEventListener('click', () => {
    setupWebcam(lobbyVideoPreview);
  });

  // Start Active Exam
  btnStartActiveExam.addEventListener('click', async () => {
    // Attempt fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen request bypassed:', e);
    }

    // Switch screens
    examLobbyScreen.style.display = 'none';
    examResultScreen.style.display = 'none';
    examActiveScreen.style.display = 'block';

    // Transfer webcam stream to active video
    if (webcamStream) {
      activeExamVideo.srcObject = webcamStream;
    } else {
      setupWebcam(activeExamVideo);
    }

    // Reset Exam State
    examActive = true;
    tabViolationsCount = 0;
    violationLogs = [];
    userAnswers = {};
    doubtfulQuestions = {};
    currentQuestionIndex = 0;
    timeRemainingSeconds = 15 * 60;
    updateViolationDisplay();

    // Render first question
    renderQuestion(currentQuestionIndex);
    renderQuestionPalette();

    // Start timer
    startExamTimer();

    showToast('Sesi ujian berproktor telah dimulai. Jangan tinggalkan tab ini!');
  });

  // Timer Engine
  function startExamTimer() {
    clearInterval(examTimerInterval);
    updateTimerText();
    examTimerInterval = setInterval(() => {
      timeRemainingSeconds--;
      updateTimerText();

      if (timeRemainingSeconds <= 0) {
        clearInterval(examTimerInterval);
        submitExam(false, 'Waktu ujian telah habis.');
      }
    }, 1000);
  }

  function updateTimerText() {
    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    examTimerDisplay.textContent = formatted;

    const timerBox = document.querySelector('.timer-countdown-box');
    if (timerBox) {
      if (timeRemainingSeconds < 120) {
        timerBox.classList.add('urgent');
      } else {
        timerBox.classList.remove('urgent');
      }
    }
  }

  // Fullscreen toggle button
  btnToggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // -------------------------------------------------------------------
  // STRICT TAB SWITCH & BLUR DETECTION LISTENER
  // -------------------------------------------------------------------
  function registerTabViolation(sourceReason) {
    if (!examActive) return;

    tabViolationsCount++;
    const nowTimeStr = new Date().toLocaleTimeString('id-ID');
    violationLogs.push({
      strike: tabViolationsCount,
      timestamp: nowTimeStr,
      reason: sourceReason || 'Berpindah tab atau membuka aplikasi lain di luar jendela ujian'
    });

    updateViolationDisplay();

    // Check if exceeded max limit (> 3 times) -> Immediate Disqualification (Score 0)
    if (tabViolationsCount > MAX_ALLOWED_VIOLATIONS) {
      // Disqualify candidate immediately!
      terminateExamDueToCheating();
    } else {
      // Show warning modal
      modalCurrentStrikes.textContent = tabViolationsCount;
      tabViolationModal.classList.add('open');
      tabViolationModal.setAttribute('aria-hidden', 'false');
      btnAckViolation.focus();
    }
  }

  // Listen to tab visibility change (most reliable tab switch trigger)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && examActive) {
      registerTabViolation('Pindah tab browser (Status: Jendela disembunyikan / tidak aktif)');
    }
  });

  // Listen to window blur (window unfocused / switched to another software or alt-tab)
  window.addEventListener('blur', () => {
    if (examActive && !tabViolationModal.classList.contains('open') && !confirmFinishModal.classList.contains('open')) {
      registerTabViolation('Kehilangan fokus jendela (Asesi membuka aplikasi lain atau menekan Alt+Tab)');
    }
  });

  // Update visual violation counters
  function updateViolationDisplay() {
    violationCountText.textContent = `${tabViolationsCount} / ${MAX_ALLOWED_VIOLATIONS} Kali`;

    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`strike-dot-${i}`);
      if (dot) {
        if (i <= tabViolationsCount) {
          dot.classList.add('active-strike');
        } else {
          dot.classList.remove('active-strike');
        }
      }
    }
  }

  // Acknowledge warning and continue
  btnAckViolation.addEventListener('click', () => {
    tabViolationModal.classList.remove('open');
    tabViolationModal.setAttribute('aria-hidden', 'true');
    // Re-request fullscreen
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  });

  // -------------------------------------------------------------------
  // DISQUALIFICATION (SCORE 0) TERMINATION
  // -------------------------------------------------------------------
  function terminateExamDueToCheating() {
    examActive = false;
    clearInterval(examTimerInterval);

    // Close any open modals
    tabViolationModal.classList.remove('open');
    tabViolationModal.setAttribute('aria-hidden', 'true');
    confirmFinishModal.classList.remove('open');
    confirmFinishModal.setAttribute('aria-hidden', 'true');

    // Exit fullscreen
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    // Switch to Result Screen
    examActiveScreen.style.display = 'none';
    examResultScreen.style.display = 'block';

    const logItemsHtml = violationLogs.map(log => `
      <li>
        <span>Pelanggaran Ke-${log.strike}: <em>${escapeHtml(log.reason)}</em></span>
        <strong>Pukul ${log.timestamp} WIB</strong>
      </li>
    `).join('');

    examResultCardWrap.innerHTML = `
      <div class="result-card-disqualified" role="alert">
        <div class="disqualify-badge-icon" aria-hidden="true">
          <span class="material-symbols-outlined">block</span>
        </div>

        <h2 class="disqualify-heading">UJIAN DIHENTIKAN: DISKUALIFIKASI RESMI</h2>
        <p class="disqualify-reason">
          Sistem mencatat Anda telah berpindah tab atau meninggalkan jendela ujian sebanyak <strong>${tabViolationsCount} kali</strong> (melebihi batas toleransi maksimal 3 kali). Sesuai dengan Peraturan Tata Tertib Uji Kompetensi Berproktor BNSP, Anda dinyatakan <strong>GUGUR DENGAN NILAI 0</strong>.
        </p>

        <div class="score-zero-hero">
          <span class="score-zero-label">NILAI AKHIR ASESMEN:</span>
          <div class="score-zero-number font-mono">0 / 100</div>
          <span class="score-zero-status">TIDAK KOMPETEN (DISKUALIFIKASI KECURANGAN)</span>
        </div>

        <div class="violation-log-box">
          <div class="violation-log-title">
            <span class="material-symbols-outlined text-danger" aria-hidden="true">history</span>
            Berita Acara Pelanggaran Integritas Ujian (Otomatis Terekam):
          </div>
          <ul class="violation-log-list">
            ${logItemsHtml}
          </ul>
        </div>

        <div style="display:flex; justify-content:center; gap:0.85rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" id="btn-retake-exam-simulation">
            <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">replay</span>
            Ulangi Simulasi Ujian (Reset Sesi)
          </button>
          <button type="button" class="btn btn-outline" id="btn-back-to-portal-dashboard">
            <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">home</span>
            Kembali ke Beranda Asesi
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-retake-exam-simulation').addEventListener('click', () => {
      examResultScreen.style.display = 'none';
      examLobbyScreen.style.display = 'block';
    });

    document.getElementById('btn-back-to-portal-dashboard').addEventListener('click', () => {
      switchTab('beranda');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Ujian otomatis dibatalkan: Nilai 0 karena pelanggaran integritas.');
  }

  // -------------------------------------------------------------------
  // NORMAL EXAM SUBMISSION & SCORING
  // -------------------------------------------------------------------
  function submitExam(normalFinish = true, optionalReason = '') {
    examActive = false;
    clearInterval(examTimerInterval);

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    confirmFinishModal.classList.remove('open');
    confirmFinishModal.setAttribute('aria-hidden', 'true');

    examActiveScreen.style.display = 'none';
    examResultScreen.style.display = 'block';

    // Calculate score
    let correctAnswersCount = 0;
    EXAM_QUESTIONS_POOL.forEach(q => {
      if (userAnswers[q.id] === q.correctKey) {
        correctAnswersCount++;
      }
    });

    const PASSING_GRADE = 80;
    const finalScore = Math.round((correctAnswersCount / EXAM_QUESTIONS_POOL.length) * 100);
    const isPassed = finalScore >= PASSING_GRADE;

    let statusText = isPassed ? 'LOLOS (KOMPETEN / K)' : 'GAGAL (BELUM KOMPETEN / BK)';
    let badgeClass = isPassed ? 'badge-success' : 'badge-danger';

    examResultCardWrap.innerHTML = `
      <div class="result-card-normal">
        <div style="display:inline-flex; align-items:center; gap:0.5rem; margin-bottom:1rem;" class="status-badge ${badgeClass}">
          <span class="material-symbols-outlined" aria-hidden="true">${isPassed ? 'verified' : 'cancel'}</span>
          <span>Hasil Asesmen: ${statusText}</span>
        </div>

        <h2 style="font-size:1.65rem; font-weight:800; color:var(--text-main); margin-bottom:0.5rem;">
          ${isPassed ? 'Selamat! Anda Dinyatakan Lolos & Kompeten' : 'Mohon Maaf, Anda Belum Lolos Ujian'}
        </h2>
        <p class="text-muted text-sm" style="max-width:540px; margin:0 auto 1.5rem auto;">
          ${isPassed ? 'Nilai akhir Anda berhasil mencapai ambang batas kelulusan minimal 80 poin. Berkas direkomendasikan terbit Sertifikat Kompetensi BNSP.' : 'Nilai akhir Anda belum mencapai ambang batas kelulusan minimal 80 poin (Passing Grade: 80). Diperlukan minimal 4 butir soal benar untuk dinyatakan Lolos.'}
        </p>

        <div style="background-color:${isPassed ? 'var(--color-primary-subtle)' : 'var(--color-danger-bg)'}; border:2px solid ${isPassed ? 'var(--color-primary-border)' : 'var(--color-danger-border)'}; padding:1.25rem; border-radius:var(--radius-sm); display:inline-block; min-width:240px; margin-bottom:1.5rem;">
          <span class="font-bold text-xs text-subtle" style="display:block;">NILAI AKHIR ASESMEN:</span>
          <div class="normal-score-badge" style="color:${isPassed ? 'var(--color-primary)' : 'var(--color-danger)'};">${finalScore} / 100</div>
          <span class="text-xs font-mono font-bold" style="color:${isPassed ? 'var(--color-primary-dark)' : 'var(--color-danger)'}; display:block; margin-top:0.25rem;">
            Benar ${correctAnswersCount} dari ${EXAM_QUESTIONS_POOL.length} Butir Soal (Passing Grade: 80)
          </span>
          <span class="text-xs font-bold" style="color:${isPassed ? 'var(--color-success)' : 'var(--color-danger)'}; display:block; margin-top:0.25rem;">
            Status: ${isPassed ? 'MEMENUHI SYARAT KELULUSAN' : 'TIDAK MEMENUHI SYARAT KELULUSAN'}
          </span>
        </div>

        <div style="background-color:var(--bg-surface-muted); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-color-subtle); max-width:520px; margin:0 auto 1.5rem auto; text-align:left; font-size:0.85rem; line-height:1.6;">
          <div>Asesi : <strong>Raden Bagus Prakoso, S.Kom</strong></div>
          <div>Skema : <strong>Auditor Forensik Digital (SKM-BNSP-CSO-26)</strong></div>
          <div>Passing Grade : <strong>Minimal 80 Poin</strong></div>
          <div>Status Pelanggaran Tab: <strong class="text-success">${tabViolationsCount} Kali (Memenuhi Protokol Integritas)</strong></div>
          <div>Rekomendasi Asesor: <strong style="color:${isPassed ? 'var(--color-success)' : 'var(--color-danger)'};">${isPassed ? 'DIREKOMENDASIKAN TERBIT SERTIFIKAT BNSP' : 'DIREKOMENDASIKAN MENGIKUTI REMEDIAL UJIAN TEORI'}</strong></div>
        </div>

        <div style="display:flex; justify-content:center; gap:0.85rem; flex-wrap:wrap;">
          ${isPassed ? `
            <button type="button" class="btn btn-primary" id="btn-view-earned-after-exam">
              <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">military_tech</span>
              Buka Tab Sertifikasi Saya
            </button>
          ` : `
            <button type="button" class="btn btn-primary" id="btn-retake-exam-normal">
              <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">replay</span>
              Uji Coba Remedial Ulang
            </button>
            <button type="button" class="btn btn-outline" id="btn-learn-materials">
              <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">menu_book</span>
              Pelajari Materi & Kisi-Kisi SKKNI
            </button>
          `}
        </div>
      </div>
    `;

    const btnViewEarned = document.getElementById('btn-view-earned-after-exam');
    if (btnViewEarned) {
      btnViewEarned.addEventListener('click', () => {
        switchTab('sertifikasi');
      });
    }

    const btnRetakeNormal = document.getElementById('btn-retake-exam-normal');
    if (btnRetakeNormal) {
      btnRetakeNormal.addEventListener('click', () => {
        examResultScreen.style.display = 'none';
        examLobbyScreen.style.display = 'block';
      });
    }

    const btnLearnMaterials = document.getElementById('btn-learn-materials');
    if (btnLearnMaterials) {
      btnLearnMaterials.addEventListener('click', () => {
        switchTab('jadwal');
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Ujian selesai. Nilai Anda: ${finalScore} (${isPassed ? 'Lolos' : 'Gagal'})`);
  }

  // -------------------------------------------------------------------
  // QUESTION RENDERING & PALETTE MANAGEMENT
  // -------------------------------------------------------------------
  function renderQuestion(index) {
    const q = EXAM_QUESTIONS_POOL[index];
    if (!q) return;

    currentQIndexSpan.textContent = index + 1;
    qUnitRef.textContent = q.unit;
    qPromptText.textContent = q.prompt;

    // Check doubtful status
    const isDoubt = doubtfulQuestions[q.id] === true;
    flagDoubtText.textContent = isDoubt ? 'Ragu-ragu (Aktif)' : 'Tandai Ragu-ragu';
    btnFlagDoubt.classList.toggle('active', isDoubt);

    // Render options
    optionsListContainer.innerHTML = '';
    q.options.forEach(opt => {
      const isSelected = userAnswers[q.id] === opt.key;
      const optCard = document.createElement('div');
      optCard.className = `option-item-card ${isSelected ? 'selected' : ''}`;
      optCard.setAttribute('role', 'radio');
      optCard.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      optCard.setAttribute('tabindex', '0');

      optCard.innerHTML = `
        <div class="option-radio-key">${opt.key}</div>
        <div class="option-text-label">${escapeHtml(opt.text)}</div>
      `;

      optCard.addEventListener('click', () => {
        userAnswers[q.id] = opt.key;
        renderQuestion(currentQuestionIndex);
        renderQuestionPalette();
      });

      optCard.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          userAnswers[q.id] = opt.key;
          renderQuestion(currentQuestionIndex);
          renderQuestionPalette();
        }
      });

      optionsListContainer.appendChild(optCard);
    });

    // Update navigation buttons disabled states
    btnPrevQuestion.disabled = index === 0;
    if (index === EXAM_QUESTIONS_POOL.length - 1) {
      btnNextQuestion.innerHTML = `
        Tinjau & Selesai
        <span class="material-symbols-outlined btn-icon-end" aria-hidden="true">task_alt</span>
      `;
    } else {
      btnNextQuestion.innerHTML = `
        Soal Berikutnya
        <span class="material-symbols-outlined btn-icon-end" aria-hidden="true">arrow_forward</span>
      `;
    }
  }

  function renderQuestionPalette() {
    questionNavPalette.innerHTML = '';
    EXAM_QUESTIONS_POOL.forEach((q, idx) => {
      const pBtn = document.createElement('button');
      pBtn.type = 'button';
      pBtn.className = 'palette-q-btn';
      pBtn.textContent = idx + 1;

      if (idx === currentQuestionIndex) {
        pBtn.classList.add('current');
      }

      const isAnswered = userAnswers[q.id] !== undefined;
      const isDoubtful = doubtfulQuestions[q.id] === true;

      if (isDoubtful) {
        pBtn.classList.add('doubtful');
      } else if (isAnswered) {
        pBtn.classList.add('answered');
      }

      pBtn.addEventListener('click', () => {
        currentQuestionIndex = idx;
        renderQuestion(currentQuestionIndex);
        renderQuestionPalette();
      });

      questionNavPalette.appendChild(pBtn);
    });
  }

  // Navigation handlers
  btnPrevQuestion.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion(currentQuestionIndex);
      renderQuestionPalette();
    }
  });

  btnNextQuestion.addEventListener('click', () => {
    if (currentQuestionIndex < EXAM_QUESTIONS_POOL.length - 1) {
      currentQuestionIndex++;
      renderQuestion(currentQuestionIndex);
      renderQuestionPalette();
    } else {
      openConfirmFinishModal();
    }
  });

  btnFlagDoubt.addEventListener('click', () => {
    const qId = EXAM_QUESTIONS_POOL[currentQuestionIndex].id;
    doubtfulQuestions[qId] = !doubtfulQuestions[qId];
    renderQuestion(currentQuestionIndex);
    renderQuestionPalette();
  });

  // Finish exam triggers
  function openConfirmFinishModal() {
    const answeredCount = Object.keys(userAnswers).length;
    let doubtCount = 0;
    Object.values(doubtfulQuestions).forEach(v => { if (v) doubtCount++; });

    summaryAnsweredCount.textContent = answeredCount;
    summaryDoubtCount.textContent = doubtCount;

    confirmFinishModal.classList.add('open');
    confirmFinishModal.setAttribute('aria-hidden', 'false');
  }

  btnFinishExamTrigger.addEventListener('click', openConfirmFinishModal);
  closeFinishModalBtn.addEventListener('click', () => {
    confirmFinishModal.classList.remove('open');
    confirmFinishModal.setAttribute('aria-hidden', 'true');
  });
  btnCancelFinish.addEventListener('click', () => {
    confirmFinishModal.classList.remove('open');
    confirmFinishModal.setAttribute('aria-hidden', 'true');
  });

  btnConfirmSubmitExam.addEventListener('click', () => {
    submitExam(true);
  });

  // Anti-Cheat: Disable right-click & copy on exam card
  const examQuestionContainer = document.getElementById('exam-question-container');
  if (examQuestionContainer) {
    examQuestionContainer.addEventListener('contextmenu', (e) => {
      if (examActive) {
        e.preventDefault();
        showToast('Klik kanan dinonaktifkan demi integritas ujian BNSP.');
      }
    });

    examQuestionContainer.addEventListener('copy', (e) => {
      if (examActive) {
        e.preventDefault();
        showToast('Menyalin teks dilarang selama sesi ujian online.');
      }
    });
  }

  // ===================================================================
  // 5. EXISTING TAB FEATURES (VERIFIKASI, KATALOG, JADWAL, PROFILE)
  // ===================================================================
  const berandaVerifyForm = document.getElementById('beranda-verify-form');
  const berandaCertInput = document.getElementById('beranda-cert-input');
  const berandaResultArea = document.getElementById('beranda-result-area');
  const sampleChips = document.querySelectorAll('.sample-chip');

  function runBerandaVerification(rawId) {
    const cleanId = rawId.trim().toUpperCase();
    if (!cleanId) {
      showToast('Mohon masukkan nomor seri sertifikat terlebih dahulu.');
      berandaCertInput.focus();
      return;
    }

    berandaResultArea.innerHTML = `
      <div class="state-container state-initial" role="alert" style="background-color:var(--color-primary-subtle); border:1px solid var(--color-primary-border);">
        <div class="spinner" aria-hidden="true"></div>
        <div>
          <strong style="display:block; color:var(--color-primary-dark);">Menghubungi Basis Data Otoritas BNSP...</strong>
          <span style="font-size:0.85rem; color:var(--text-muted);">Memvalidasi tanda tangan digital dan nomor registrasi: ${escapeHtml(cleanId)}</span>
        </div>
      </div>
    `;

    setTimeout(() => {
      const record = CERTIFICATE_DATABASE[cleanId];
      if (record) {
        currentActiveCert = record;
        let badgeStyle = 'background-color:var(--color-success); color:#fff;';
        if (record.status === 'expired') badgeStyle = 'background-color:var(--color-warning); color:#fff;';

        berandaResultArea.innerHTML = `
          <div class="state-container state-success" role="region" aria-label="Hasil Verifikasi Sertifikat">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
              <span class="status-badge" style="${badgeStyle}">
                <span class="material-symbols-outlined" style="font-size:1rem;" aria-hidden="true">verified</span>
                ${record.statusText}
              </span>
              <span class="font-mono text-xs text-subtle">Reg: ${record.bnspRegNumber}</span>
            </div>
            <strong style="font-size:1.05rem; color:var(--text-main); display:block;">${escapeHtml(record.recipientName)}</strong>
            <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:0.5rem;">${escapeHtml(record.programTitle)}</p>
            <div style="font-size:0.775rem; color:var(--text-subtle); line-height:1.5; margin-bottom:0.75rem;">
              <div>Lembaga: ${escapeHtml(record.issuerName)}</div>
              <div>Berlaku Hingga: <strong>${escapeHtml(record.expiryDate)}</strong></div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="btn-open-beranda-detail">
              <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">visibility</span>
              Buka Lembar Rincian Unit Kompetensi
            </button>
          </div>
        `;

        document.getElementById('btn-open-beranda-detail').addEventListener('click', () => {
          openCertificateModal(record);
        });
      } else {
        berandaResultArea.innerHTML = `
          <div class="state-container state-error" role="alert">
            <strong style="color:var(--color-danger); display:flex; align-items:center; gap:0.4rem; font-size:0.95rem;">
              <span class="material-symbols-outlined" aria-hidden="true">error</span>
              Dokumen Tidak Ditemukan dalam Direktori BNSP
            </strong>
            <p style="font-size:0.85rem; color:var(--text-main); margin-top:0.35rem;">
              Nomor <code class="font-mono">${escapeHtml(cleanId)}</code> tidak terdaftar pada pangkalan data LSP berlisensi.
            </p>
          </div>
        `;
      }
    }, 350);
  }

  berandaVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runBerandaVerification(berandaCertInput.value);
  });

  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleVal = chip.getAttribute('data-sample');
      berandaCertInput.value = sampleVal;
      runBerandaVerification(sampleVal);
    });
  });

  // Katalog Skema Filtering
  const catalogFilterButtons = document.querySelectorAll('.catalog-tabs .tab-btn');
  const catalogCards = document.querySelectorAll('#full-catalog-grid .cert-catalog-card');

  catalogFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catalogFilterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterVal = btn.getAttribute('data-filter');
      catalogCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Scheme Units & Training Details Modal
  document.querySelectorAll('.btn-view-scheme-units').forEach(btn => {
    btn.addEventListener('click', () => {
      const schemeId = btn.getAttribute('data-scheme-id');
      const scheme = SCHEME_DETAILS_DATA[schemeId];
      if (!scheme) return;

      const unitsList = scheme.units.map(u => `<li>${escapeHtml(u)}</li>`).join('');

      modalCertContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1.15rem;">
          <!-- Training Media Banner -->
          <div style="position:relative;">
            <img src="${scheme.image}" alt="${escapeHtml(scheme.imageAlt)}" class="training-detail-banner" width="600" height="300" loading="eager">
          </div>

          <!-- Title & Scheme Code Header -->
          <div style="background-color:var(--color-primary-subtle); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--color-primary-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <span class="font-mono text-xs font-bold" style="color:var(--color-primary);">${scheme.code}</span>
              <span class="font-mono text-xs text-muted" style="background-color:var(--bg-surface); padding:0.15rem 0.5rem; border-radius:var(--radius-xs); border:1px solid var(--border-color-subtle);">Acuan Resmi BNSP</span>
            </div>
            <h3 style="font-size:1.15rem; color:var(--text-main); font-weight:700; line-height:1.4;">${scheme.trainingTitle || scheme.title}</h3>
            <span class="text-xs text-muted font-mono" style="display:block; margin-top:0.35rem;">Standar Acuan: ${scheme.skkni}</span>
          </div>

          <!-- Training Specifications & Laboratory Breakdown -->
          <div>
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">Spesifikasi Program & Fasilitas Pelatihan:</h4>
            <div class="training-specs-grid">
              <div class="training-spec-item">
                <span class="spec-label">Komposisi Kurikulum</span>
                <span class="spec-value">${escapeHtml(scheme.theoryPractice || '30% Teori, 70% Praktik')}</span>
              </div>
              <div class="training-spec-item">
                <span class="spec-label">Perangkat & Software Lab</span>
                <span class="spec-value">${escapeHtml(scheme.tools || 'Workstation Lab Standard')}</span>
              </div>
              <div class="training-spec-item">
                <span class="spec-label">Fasilitas Tempat Uji (TUK)</span>
                <span class="spec-value">${escapeHtml(scheme.facility || 'Laboratorium TUK Terakreditasi')}</span>
              </div>
              <div class="training-spec-item">
                <span class="spec-label">Metode Evaluasi Akhir</span>
                <span class="spec-value">CBT Teori Online + Praktik Unjuk Kerja</span>
              </div>
            </div>
          </div>

          <!-- Competency Units List -->
          <div>
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">Daftar Unit Kompetensi SKKNI yang Diujikan:</h4>
            <ul style="padding-left:1.25rem; font-size:0.85rem; color:var(--text-muted); line-height:1.65;">
              ${unitsList}
            </ul>
          </div>

          <!-- Evaluation & Action Button -->
          <div style="background-color:var(--bg-surface-muted); padding:0.85rem 1rem; border-radius:var(--radius-sm); font-size:0.85rem; color:var(--text-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
            <div>
              <strong>Passing Grade Kelulusan:</strong> Nilai minimal 80 untuk dinyatakan Kompeten (K).
            </div>
            <button type="button" class="btn btn-primary btn-sm btn-modal-register-trigger" data-scheme-title="${escapeHtml(scheme.title)}" data-scheme-code="${escapeHtml(scheme.code)}">
              <span class="material-symbols-outlined btn-icon-start" aria-hidden="true">how_to_reg</span>
              Daftar Asesmen Skema Ini
            </button>
          </div>
        </div>
      `;
      document.getElementById('modal-cert-title').textContent = 'Rincian Pelatihan & Unit Kompetensi SKKNI';
      certModal.classList.add('open');
      certModal.setAttribute('aria-hidden', 'false');

      // Bind dynamic modal register button
      const modalRegBtn = modalCertContent.querySelector('.btn-modal-register-trigger');
      if (modalRegBtn) {
        modalRegBtn.addEventListener('click', () => {
          certModal.classList.remove('open');
          certModal.setAttribute('aria-hidden', 'true');
          const title = modalRegBtn.getAttribute('data-scheme-title');
          const code = modalRegBtn.getAttribute('data-scheme-code');
          regSchemeDisplay.value = `${code} - ${title}`;
          registerModal.classList.add('open');
          registerModal.setAttribute('aria-hidden', 'false');
          regModalCloseBtn.focus();
        });
      }

      modalCloseBtn.focus();
    });
  });

  // Registration for assessment
  document.querySelectorAll('.btn-register-scheme').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-scheme-title');
      const code = btn.getAttribute('data-scheme-code');
      regSchemeDisplay.value = `${code} - ${title}`;
      registerModal.classList.add('open');
      registerModal.setAttribute('aria-hidden', 'false');
      regModalCloseBtn.focus();
    });
  });

  schemeRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const tuk = document.getElementById('reg-tuk-select').value;
    const date = document.getElementById('reg-date-select').value;
    registerModal.classList.remove('open');
    registerModal.setAttribute('aria-hidden', 'true');
    showToast(`Pendaftaran asesmen berhasil! Sesi Anda di ${tuk} pada ${date} telah dicatat.`);
    switchTab('jadwal');
  });

  regModalCloseBtn.addEventListener('click', () => {
    registerModal.classList.remove('open');
    registerModal.setAttribute('aria-hidden', 'true');
  });

  // Schedule filtering
  const scheduleSearchInput = document.getElementById('schedule-search-input');
  const scheduleLocButtons = document.querySelectorAll('.schedule-loc-btn');
  const scheduleCards = document.querySelectorAll('.schedule-row-card');

  function filterSchedules() {
    const query = scheduleSearchInput ? scheduleSearchInput.value.toLowerCase() : '';
    const activeLocBtn = document.querySelector('.schedule-loc-btn.active');
    const selectedLoc = activeLocBtn ? activeLocBtn.getAttribute('data-loc') : 'all';

    scheduleCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const loc = card.getAttribute('data-loc');
      const matchesSearch = text.includes(query);
      const matchesLoc = selectedLoc === 'all' || loc === selectedLoc;
      card.style.display = (matchesSearch && matchesLoc) ? 'grid' : 'none';
    });
  }

  if (scheduleSearchInput) {
    scheduleSearchInput.addEventListener('input', filterSchedules);
  }

  scheduleLocButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scheduleLocButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterSchedules();
    });
  });

  document.querySelectorAll('.btn-join-schedule').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.schedule-row-card');
      const title = card.querySelector('.sched-title').textContent;
      regSchemeDisplay.value = title;
      registerModal.classList.add('open');
      registerModal.setAttribute('aria-hidden', 'false');
      regModalCloseBtn.focus();
    });
  });

  // Material Document Downloads Simulation
  document.querySelectorAll('.btn-download-file').forEach(btn => {
    btn.addEventListener('click', () => {
      const docName = btn.getAttribute('data-doc');
      const textSample = `=====================================================
BADAN NASIONAL SERTIFIKASI PROFESI (BNSP)
LEMBAGA SERTIFIKASI PROFESI CERTISKILL
Berkas Resmi: ${docName}
=====================================================
Asesi Terdaftar : Raden Bagus Prakoso, S.Kom
NIK            : 327320******0004
Nomor Asesi    : BNSP-ID-2026-0912
Tanggal Unduh  : ${new Date().toLocaleString('id-ID')}

PETUNJUK PENGISIAN FORMULIR:
1. Pastikan seluruh bukti kompetensi portofolio dilampirkan asli.
2. Isi evaluasi mandiri pada kolom K (Kompeten) atau BK (Belum Kompeten).
3. Berkas ini wajib dibawa saat menghadiri Tempat Uji Kompetensi (TUK).

Dokumen ini sah sebagai tanda terima persiapan asesmen kompetensi.
=====================================================`;

      const blob = new Blob([textSample], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docName.replace('.pdf', '.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Berkas ${docName} berhasil diunduh.`);
    });
  });

  // Certificate Modal Inspector
  function openCertificateModal(cert) {
    currentActiveCert = cert;
    let badgeStyle = 'background-color:var(--color-success); color:#fff;';
    if (cert.status === 'expired') badgeStyle = 'background-color:var(--color-warning); color:#fff;';

    const competenciesHtml = cert.competencies.map(item => `<li>${escapeHtml(item)}</li>`).join('');

    modalCertContent.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; background-color:var(--color-primary-subtle); padding:0.85rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--color-primary-border);">
          <div>
            <strong style="font-size:0.75rem; color:var(--text-subtle); display:block;">STATUS KOMPETENSI RESMI BNSP</strong>
            <span style="font-size:1.1rem; font-weight:800; color:var(--text-main);">${cert.statusText}</span>
          </div>
          <span style="padding:0.3rem 0.65rem; border-radius:var(--radius-xs); font-size:0.8rem; font-weight:700; ${badgeStyle}">
            ${cert.id}
          </span>
        </div>

        <table class="modal-cert-meta-table">
          <tbody>
            <tr>
              <th scope="row">Nomor Registrasi BNSP</th>
              <td class="font-mono">${escapeHtml(cert.bnspRegNumber)}</td>
            </tr>
            <tr>
              <th scope="row">Nama Pemegang</th>
              <td>${escapeHtml(cert.recipientName)}</td>
            </tr>
            <tr>
              <th scope="row">Nomor NIK Kependudukan</th>
              <td class="font-mono">${escapeHtml(cert.recipientId)}</td>
            </tr>
            <tr>
              <th scope="row">Judul Kualifikasi Skema</th>
              <td>${escapeHtml(cert.programTitle)}</td>
            </tr>
            <tr>
              <th scope="row">Acuan Standar SKKNI</th>
              <td>${escapeHtml(cert.skkniStandard)}</td>
            </tr>
            <tr>
              <th scope="row">Lembaga Penyelenggara</th>
              <td>${escapeHtml(cert.issuerName)}</td>
            </tr>
            <tr>
              <th scope="row">Tanggal Terbit</th>
              <td>${escapeHtml(cert.issuanceDate)}</td>
            </tr>
            <tr>
              <th scope="row">Masa Berlaku Dokumen</th>
              <td>${escapeHtml(cert.expiryDate)}</td>
            </tr>
            <tr>
              <th scope="row">Stempel Waktu Elektronik</th>
              <td>${escapeHtml(cert.timestampAuthority)}</td>
            </tr>
          </tbody>
        </table>

        <div>
          <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-main); margin-bottom:0.4rem;">Unit Kompetensi yang Telah Dinyatakan Kompeten:</h4>
          <ul style="padding-left:1.25rem; font-size:0.85rem; color:var(--text-muted); line-height:1.5;">
            ${competenciesHtml}
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.825rem; font-weight:700; color:var(--text-main); margin-bottom:0.35rem;">Sidik Jari Kriptografis Berkas (SHA-256):</h4>
          <div class="crypto-hash-box font-mono">${cert.sha256Hash}</div>
        </div>
      </div>
    `;

    document.getElementById('modal-cert-title').textContent = 'Detail Sertifikat Kompetensi BNSP';
    certModal.classList.add('open');
    certModal.setAttribute('aria-hidden', 'false');
    modalCloseBtn.focus();
  }

  document.querySelectorAll('.btn-open-cert-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const certId = btn.getAttribute('data-cert-id');
      const cert = CERTIFICATE_DATABASE[certId];
      if (cert) openCertificateModal(cert);
    });
  });

  document.querySelectorAll('.btn-download-cert').forEach(btn => {
    btn.addEventListener('click', () => {
      const certId = btn.getAttribute('data-cert-id');
      const cert = CERTIFICATE_DATABASE[certId] || CERTIFICATE_DATABASE['CERT-2026-8891'];
      downloadCertificateReceipt(cert);
    });
  });

  function downloadCertificateReceipt(cert) {
    const content = `=====================================================
REPUBLIK INDONESIA
BADAN NASIONAL SERTIFIKASI PROFESI (BNSP)
SERTIFIKAT KOMPETENSI ELEKTRONIK
=====================================================
Nomor Seri      : ${cert.id}
No Reg BNSP     : ${cert.bnspRegNumber}
Status Asesmen  : ${cert.statusText.toUpperCase()}

Nama Asesi      : ${cert.recipientName}
Nomor NIK       : ${cert.recipientId}
Skema Keahlian  : ${cert.programTitle}
Standar Acuan   : ${cert.skkniStandard}
Lembaga Penerbit: ${cert.issuerName}
Tanggal Sah     : ${cert.issuanceDate}
Masa Berlaku    : ${cert.expiryDate}

UNIT KOMPETENSI TERAKREDITASI:
${cert.competencies.map(c => `* ${c}`).join('\n')}

SIDIK JARI TANDA TANGAN KRIPTOGRAFI (SHA-256):
${cert.sha256Hash}

Dokumen ini memiliki kekuatan hukum yang sah sesuai
Undang-Undang No. 11/2008 jo UU No. 1/2024 tentang ITE.
Dicetak pada: ${new Date().toLocaleString('id-ID')}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sertifikat-BNSP-${cert.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Dokumen Sertifikat BNSP ${cert.id} berhasil diunduh.`);
  }

  modalCloseBtn.addEventListener('click', () => {
    certModal.classList.remove('open');
    certModal.setAttribute('aria-hidden', 'true');
  });

  modalCopyLinkBtn.addEventListener('click', () => {
    const certId = currentActiveCert ? currentActiveCert.id : 'CERT-2026-8891';
    const fakeUrl = `https://certiskill.id/verify/${certId}`;
    navigator.clipboard.writeText(fakeUrl).then(() => {
      showToast(`Tautan validasi resmi disalin: ${fakeUrl}`);
    }).catch(() => {
      showToast(`Tautan: ${fakeUrl}`);
    });
  });

  modalDownloadSimBtn.addEventListener('click', () => {
    const cert = currentActiveCert || CERTIFICATE_DATABASE['CERT-2026-8891'];
    downloadCertificateReceipt(cert);
  });

  const btnCopyPublicPortfolio = document.getElementById('btn-copy-public-portfolio');
  if (btnCopyPublicPortfolio) {
    btnCopyPublicPortfolio.addEventListener('click', () => {
      const portfolioUrl = 'https://certiskill.id/asesi/raden-bagus-prakoso';
      navigator.clipboard.writeText(portfolioUrl).then(() => {
        showToast('Tautan portofolio kredensial asesi berhasil disalin.');
      });
    });
  }

  document.querySelectorAll('.btn-resertifikasi').forEach(btn => {
    btn.addEventListener('click', () => {
      regSchemeDisplay.value = 'SKM-BNSP-DPO-08 - Petugas Perlindungan Data Pribadi (DPO)';
      registerModal.classList.add('open');
      registerModal.setAttribute('aria-hidden', 'false');
      regModalCloseBtn.focus();
    });
  });

  // Profile forms handling
  const profSubTabs = document.querySelectorAll('.prof-tab-btn');
  const profPanes = document.querySelectorAll('.profile-form-pane');

  profSubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      profSubTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetProf = tab.getAttribute('data-prof-tab');
      profPanes.forEach(pane => pane.classList.remove('active'));

      if (targetProf === 'data-diri') {
        document.getElementById('profile-personal-form').classList.add('active');
      } else if (targetProf === 'pendidikan') {
        document.getElementById('profile-edu-form').classList.add('active');
      } else if (targetProf === 'keamanan') {
        document.getElementById('profile-security-form').classList.add('active');
      }
    });
  });

  const profilePersonalForm = document.getElementById('profile-personal-form');
  profilePersonalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = document.getElementById('prof-nama').value.trim();
    if (newName) {
      document.getElementById('display-profile-name').textContent = newName;
      document.querySelector('.user-pill-name').textContent = newName.split(',')[0];
      showToast('Perubahan data diri berhasil disimpan ke database asesi.');
    }
  });

  const profileEduForm = document.getElementById('profile-edu-form');
  profileEduForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Data riwayat pendidikan & portofolio berhasil diperbarui.');
  });

  const profileSecurityForm = document.getElementById('profile-security-form');
  profileSecurityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pNew = document.getElementById('pass-new').value;
    const pConf = document.getElementById('pass-confirm').value;

    if (pNew && pNew !== pConf) {
      showToast('Konfirmasi kata sandi baru tidak cocok. Periksa kembali.');
      return;
    }

    showToast('Pengaturan sandi & keamanan akun asesi berhasil diperbarui.');
    profileSecurityForm.reset();
  });

  document.getElementById('btn-change-photo').addEventListener('click', () => {
    showToast('Silakan pilih berkas foto formal latar belakang merah/biru (Format JPG/PNG max 2MB).');
  });

  // Keyboard accessibility: ESC key closes open modals (when exam is not actively running)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (certModal.classList.contains('open')) {
        certModal.classList.remove('open');
        certModal.setAttribute('aria-hidden', 'true');
      }
      if (registerModal.classList.contains('open')) {
        registerModal.classList.remove('open');
        registerModal.setAttribute('aria-hidden', 'true');
      }
      if (confirmFinishModal.classList.contains('open')) {
        confirmFinishModal.classList.remove('open');
        confirmFinishModal.setAttribute('aria-hidden', 'true');
      }
      if (mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Modal overlay click outside
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      certModal.classList.remove('open');
      certModal.setAttribute('aria-hidden', 'true');
    }
  });

  registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
      registerModal.classList.remove('open');
      registerModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Helper escape HTML
  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

