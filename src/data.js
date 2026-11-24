export const INITIAL_CERTIFICATES = {
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
export const SCHEMES_DATA = {
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
export const EXAM_QUESTIONS = [
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



export const INITIAL_SCHEDULES = [
  {
    id: 'SCHED-01',
    day: '28',
    month: 'MAR 2026',
    time: '08.30 WIB',
    schemeId: 'SWA-01',
    title: 'Arsitek Solusi Perangkat Lunak Skala Besar (SWE-ARCH-01)',
    description: 'Sesi asesmen unjuk kerja laboratorium perancangan arsitektur microservices dan uji ketahanan sistem terdistribusi.',
    tuk: 'TUK Mandiri Kampus Cyber Jakarta',
    locType: 'jakarta',
    locText: 'Jakarta Selatan',
    quota: 'Sisa Kuota: 4 Asesi',
    isFull: false
  },
  {
    id: 'SCHED-02',
    day: '04',
    month: 'APR 2026',
    time: '09.00 WIB',
    schemeId: 'CSO-26',
    title: 'Auditor Forensik Digital & Tanggap Insiden Siber (CSO-26)',
    description: 'Ujian praktik akusisi barang bukti digital, pemulihan data storage, dan audit rantai integritas digital evidence.',
    tuk: 'TUK Sewaktu Pusat Komputasi Bandung',
    locType: 'bandung',
    locText: 'Kota Bandung',
    quota: 'Sisa Kuota: 2 Asesi',
    isFull: false
  },
  {
    id: 'SCHED-03',
    day: '11',
    month: 'APR 2026',
    time: '08.30 WIB',
    schemeId: 'MLE-04',
    title: 'Perekayasa Model Pembelajaran Mesin - ML Engineer (MLE-04)',
    description: 'Asesmen komprehensif implementasi pipeline data, pelatihan model regresi/klasifikasi, dan penjaminan kualitas inferensi.',
    tuk: 'TUK Mandiri Kampus AI Surabaya',
    locType: 'surabaya',
    locText: 'Surabaya Timur',
    quota: 'Sisa Kuota: 6 Asesi',
    isFull: false
  },
  {
    id: 'SCHED-04',
    day: '18',
    month: 'APR 2026',
    time: '13.00 WIB',
    schemeId: 'DPO-08',
    title: 'Petugas Perlindungan Data Pribadi - DPO (DPO-08)',
    description: 'Evaluasi jarak jauh terpadu via telekonferensi dan audit berkas dokumen perlindungan data pribadi UU PDP.',
    tuk: 'TUK Virtual LSP CertiSkill',
    locType: 'daring',
    locText: 'Asesmen Daring (Online)',
    quota: 'Kuota Penuh',
    isFull: true
  }
];

export const INITIAL_PROFILE = {
  nama: 'Raden Bagus Prakoso, S.Kom',
  nik: '3273201402980004',
  noReg: 'BNSP-ID-2026-0912',
  email: 'bagus.prakoso@alumni.ac.id',
  phone: '+62 812-9844-3200',
  ttl: 'Bandung, 14 Februari 1998',
  gender: 'Laki-laki',
  alamat: 'Jl. Tubagus Ismail Raya No. 42, Coblong, Kota Bandung, Jawa Barat 40134',
  pendidikan: 'S1',
  kampus: 'Institut Teknologi Bandung (ITB)',
  prodi: 'Teknik Informatika',
  pekerjaan: 'PT Solusi Awan Nusantara',
  twoFactor: true
};
