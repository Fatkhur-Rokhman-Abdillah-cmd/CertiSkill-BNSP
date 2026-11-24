import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_CERTIFICATES,
  SCHEMES_DATA,
  EXAM_QUESTIONS,
  INITIAL_SCHEDULES,
  INITIAL_PROFILE
} from './data.js';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('certiskill_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }
    localStorage.setItem('certiskill_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3500);
  };

  const [activeTab, setActiveTab] = useState('beranda');
  const [certificates, setCertificates] = useState(() => {
    const saved = localStorage.getItem('certiskill_certs');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('certiskill_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('certiskill_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  useEffect(() => {
    localStorage.setItem('certiskill_certs', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('certiskill_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('certiskill_schedules', JSON.stringify(schedules));
  }, [schedules]);

  const [certModalData, setCertModalData] = useState(null);
  const [schemeDetailData, setSchemeDetailData] = useState(null);
  const [registerModalData, setRegisterModalData] = useState(null);
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [confirmFinishModalOpen, setConfirmFinishModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('idle');
  const [verifyResult, setVerifyResult] = useState(null);

  const [catalogFilter, setCatalogFilter] = useState('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleLoc, setScheduleLoc] = useState('all');
  const [profileSubTab, setProfileSubTab] = useState('identitas');

  const [examScreen, setExamScreen] = useState('lobby');
  const [examActive, setExamActive] = useState(false);
  const [tabViolations, setTabViolations] = useState(0);
  const [violationLogs, setViolationLogs] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [doubtfulQuestions, setDoubtfulQuestions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [examScore, setExamScore] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(false);

  const lobbyVideoRef = useRef(null);
  const activeVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const earnedActiveCount = Object.values(certificates).filter(c => c.status === 'valid').length;

  const handleTabSwitch = (tabId) => {
    if (examActive && tabId !== 'ujian') {
      const ok = window.confirm('PERHATIAN: Ujian online berproktor sedang berlangsung! Berpindah halaman akan dihitung sebagai pelanggaran tab (Toleransi maks 3 kali). Tetap ingin pindah?');
      if (!ok) return;
      handleViolation('Pindah ke tab navigasi: ' + tabId);
    }
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requestWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        webcamStreamRef.current = stream;
        if (lobbyVideoRef.current) {
          lobbyVideoRef.current.srcObject = stream;
        }
        setWebcamActive(true);
        setWebcamError(false);
        showToast('Kamera pengawas berhasil diaktifkan.');
      }
    } catch (err) {
      console.warn('Webcam error:', err);
      setWebcamActive(false);
      setWebcamError(true);
      showToast('Mode pengawasan sensor virtual AI aktif.');
    }
  };

  const startExam = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen bypassed:', e);
    }

    setExamScreen('active');
    setExamActive(true);
    setTabViolations(0);
    setViolationLogs([]);
    setUserAnswers({});
    setDoubtfulQuestions({});
    setCurrentQIndex(0);
    setTimeRemaining(15 * 60);
    setIsDisqualified(false);
    setExamScore(null);

    setTimeout(() => {
      if (activeVideoRef.current && webcamStreamRef.current) {
        activeVideoRef.current.srcObject = webcamStreamRef.current;
      }
    }, 100);
  };

  useEffect(() => {
    if (examActive && examScreen === 'active') {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            finishExam(false, 'Waktu ujian telah habis.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [examActive, examScreen]);

  const handleViolation = (reason) => {
    if (!examActive) return;

    setTabViolations(prev => {
      const nextStrikes = prev + 1;
      const log = {
        strike: nextStrikes,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        reason: reason || 'Berpindah tab atau membuka aplikasi lain di luar jendela ujian'
      };
      setViolationLogs(prevLogs => [...prevLogs, log]);

      if (nextStrikes > 3) {
        disqualifyExam(nextStrikes, [...violationLogs, log]);
      } else {
        setViolationModalOpen(true);
      }
      return nextStrikes;
    });
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && examActive) {
        handleViolation('Pindah tab browser (Status: Jendela disembunyikan / tidak aktif)');
      }
    };
    const onBlur = () => {
      if (examActive && !violationModalOpen && !confirmFinishModalOpen) {
        handleViolation('Kehilangan fokus jendela (Asesi membuka aplikasi lain atau Alt+Tab)');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [examActive, violationModalOpen, confirmFinishModalOpen]);

  const disqualifyExam = (strikes, logs) => {
    setExamActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setViolationModalOpen(false);
    setConfirmFinishModalOpen(false);
    setIsDisqualified(true);
    setExamScore({
      score: 0,
      passed: false,
      correctCount: 0,
      totalCount: EXAM_QUESTIONS.length
    });
    setExamScreen('result');
    showToast('Ujian dibatalkan. Anda terdiskualifikasi dengan nilai 0.');
  };

  const finishExam = (normal = true, reason = '') => {
    setExamActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setConfirmFinishModalOpen(false);

    let correct = 0;
    EXAM_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctKey) correct++;
    });

    const score = Math.round((correct / EXAM_QUESTIONS.length) * 100);
    const passed = score >= 80;

    setExamScore({
      score,
      passed,
      correctCount: correct,
      totalCount: EXAM_QUESTIONS.length
    });
    setIsDisqualified(false);
    setExamScreen('result');

    if (passed) {
      const newCertId = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCert = {
        id: newCertId,
        bnspRegNumber: `MET.000.00${Math.floor(6000 + Math.random() * 999)} 2026`,
        status: 'valid',
        statusText: 'Kompeten (Aktif)',
        recipientName: profile.nama,
        recipientId: `NIK-${profile.nik.substring(0, 6)}******${profile.nik.substring(profile.nik.length - 4)}`,
        programTitle: 'Auditor Forensik Digital & Tanggap Insiden Siber',
        schemeCode: 'SKM-BNSP-CSO-26',
        skkniStandard: 'SKKNI Nomor 145 Tahun 2021',
        issuerName: 'Lembaga Sertifikasi Profesi Teknologi Digital Nasional',
        issuerAccreditation: 'Badan Nasional Sertifikasi Profesi (BNSP)',
        issuanceDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        expiryDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        timestampAuthority: 'Otoritas Stempel Waktu Resmi Indonesia (TSA-ID-01)',
        sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        competencies: SCHEMES_DATA['CSO-26'].units
      };

      setCertificates(prev => ({
        [newCertId]: newCert,
        ...prev
      }));

      showToast(`Selamat! Anda Lolos dengan nilai ${score}. Sertifikat baru diterbitkan.`);
    } else {
      showToast(`Ujian selesai. Nilai Anda: ${score} (Belum Lolos Passing Grade 80).`);
    }
  };

  const downloadCertificate = (cert) => {
    const textContent = `=====================================================
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

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sertifikat-BNSP-${cert.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Dokumen Sertifikat BNSP ${cert.id} berhasil diunduh.`);
  };

  const downloadDocForm = (filename) => {
    const textSample = `=====================================================
BADAN NASIONAL SERTIFIKASI PROFESI (BNSP)
LEMBAGA SERTIFIKASI PROFESI CERTISKILL
Berkas Resmi: ${filename}
=====================================================
Asesi Terdaftar : ${profile.nama}
NIK            : ${profile.nik}
Nomor Asesi    : ${profile.noReg}
Tanggal Unduh  : ${new Date().toLocaleString('id-ID')}

PETUNJUK PENGISIAN FORMULIR:
1. Pastikan seluruh bukti kompetensi portofolio dilampirkan asli.
2. Isi evaluasi mandiri pada kolom K (Kompeten) atau BK (Belum Kompeten).
3. Berkas ini wajib dibawa saat menghadiri Tempat Uji Kompetensi (TUK).
=====================================================`;

    const blob = new Blob([textSample], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Dokumen ${filename} berhasil diunduh.`);
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    const clean = verifyInput.trim().toUpperCase();
    if (!clean) {
      showToast('Mohon masukkan nomor seri sertifikat terlebih dahulu.');
      return;
    }
    setVerifyStatus('loading');
    setTimeout(() => {
      const rec = certificates[clean];
      if (rec) {
        setVerifyResult(rec);
        setVerifyStatus('result');
      } else {
        setVerifyResult(null);
        setVerifyStatus('not_found');
      }
    }, 400);
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const tuk = form.elements['reg-tuk-select'].value;
    const date = form.elements['reg-date-select'].value;
    const scheme = registerModalData?.title || 'Skema Pilihan';

    const newSchedule = {
      id: `SCHED-${Date.now()}`,
      day: date.split(' ')[0] || '15',
      month: date.split(' ')[1] || 'MEI 2026',
      time: '08.30 WIB',
      schemeId: registerModalData?.code || 'REG-USER',
      title: `${scheme} (${registerModalData?.code || 'BNSP-ID'})`,
      description: `Pendaftaran terkonfirmasi untuk asesi ${profile.nama}. Sesi evaluasi portfolio dan asesmen komprehensif.`,
      tuk: tuk,
      locType: 'jakarta',
      locText: 'Terkonfirmasi Asesi',
      quota: 'Sesi Terjadwal Anda',
      isFull: false,
      isRegisteredByUser: true
    };

    setSchedules(prev => [newSchedule, ...prev]);
    setRegisterModalData(null);
    showToast(`Pendaftaran asesmen berhasil! Sesi Anda di ${tuk} pada ${date} telah dicatat.`);
    handleTabSwitch('jadwal');
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const catalogList = [
    {
      id: 'CSO-26',
      category: 'cyber',
      categoryLabel: 'Keamanan Siber',
      code: 'SKM-BNSP-CSO-26',
      title: 'Auditor Forensik Digital & Tanggap Insiden Siber',
      image: 'assets/images/cyber-security-lab.jpg',
      imageAlt: 'Pelatihan uji forensik digital dan analisis tanggap insiden di laboratorium keamanan siber TUK',
      desc: 'Menguji kompetensi penanganan insiden kebocoran data, pemulihan barang bukti elektronik, analisis log serangan, dan pembuatan berita acara forensik hukum.',
      skkni: 'SKKNI No. 145/2021',
      unitsCount: '8 Unit Kompetensi',
      level: 'KKNI Level 6'
    },
    {
      id: 'MLE-04',
      category: 'ai',
      categoryLabel: 'Kecerdasan Buatan',
      code: 'SKM-BNSP-MLE-04',
      title: 'Perekayasa Model Pembelajaran Mesin (ML Engineer)',
      image: 'assets/images/ai-ml-workshop.jpg',
      imageAlt: 'Lokakarya pelatihan perekayasa model pembelajaran mesin dan rekayasa fitur data AI',
      desc: 'Asesmen kemampuan merancang pipeline rekayasa fitur data, melatih model klasifikasi/regresi, penyetelan hyperparameter, dan deployment model pada produksi skala besar.',
      skkni: 'SKKNI No. 299/2020',
      unitsCount: '7 Unit Kompetensi',
      level: 'KKNI Level 6'
    },
    {
      id: 'SWA-01',
      category: 'software',
      categoryLabel: 'Rekayasa Lunak',
      code: 'SKM-BNSP-SWA-01',
      title: 'Arsitek Solusi Perangkat Lunak Skala Besar',
      image: 'assets/images/software-architecture.jpg',
      imageAlt: 'Pelatihan arsitektur rekayasa perangkat lunak skala enterprise dan integrasi microservices',
      desc: 'Evaluasi kualifikasi perencanaan struktur arsitektur microservices terdistribusi, strategi redundansi sistem toleran kegagalan, dan ketahanan throughput tinggi.',
      skkni: 'SKKNI No. 044/2020',
      unitsCount: '10 Unit Kompetensi',
      level: 'KKNI Level 7'
    },
    {
      id: 'DPO-08',
      category: 'data',
      categoryLabel: 'Tata Kelola Data',
      code: 'SKM-BNSP-DPO-08',
      title: 'Petugas Perlindungan Data Pribadi (DPO)',
      image: 'assets/images/data-protection.jpg',
      imageAlt: 'Pelatihan kepatuhan regulasi perlindungan data pribadi UU PDP dan audit pemrosesan data',
      desc: 'Validasi kompetensi kepatuhan terhadap amanat UU Perlindungan Data Pribadi (UU No. 27/2022), penyusunan dokumen DPIA, dan audit hak akses pemilik data.',
      skkni: 'SKKNI No. 103/2023',
      unitsCount: '6 Unit Kompetensi',
      level: 'KKNI Level 6'
    },
    {
      id: 'DEV-02',
      category: 'software',
      categoryLabel: 'Rekayasa Lunak',
      code: 'SKM-BNSP-DEV-02',
      title: 'Pengembang Aplikasi Web Tingkat Lanjut (Lead Fullstack)',
      image: 'assets/images/web-dev-training.jpg',
      imageAlt: 'Pelatihan pengembang aplikasi web tingkat lanjut arsitektur frontend backend dan CI CD',
      desc: 'Uji kemampuan penulisan kode terstruktur, implementasi API aman (OAuth 2.0 / JWT), integrasi pipeline CI/CD, dan otomatisasi pengujian beban perangkat lunak.',
      skkni: 'SKKNI No. 044/2020',
      unitsCount: '9 Unit Kompetensi',
      level: 'KKNI Level 5'
    },
    {
      id: 'NET-07',
      category: 'cyber',
      categoryLabel: 'Keamanan Siber',
      code: 'SKM-BNSP-NET-07',
      title: 'Administrator Pertahanan Jaringan Komputer',
      image: 'assets/images/network-security.jpg',
      imageAlt: 'Pelatihan pertahanan jaringan komputer konfigurasi firewall dan pencegahan intrusi IDS IPS',
      desc: 'Asesmen konfigurasi Firewall Layer 7, sistem pencegahan intrusi (IPS/IDS), segmentasi jaringan Zero Trust, dan manajemen sertifikat enkripsi VPN korporasi.',
      skkni: 'SKKNI No. 321/2016',
      unitsCount: '7 Unit Kompetensi',
      level: 'KKNI Level 5'
    }
  ];

  const filteredCatalog = catalogList.filter(item => {
    if (catalogFilter === 'all') return true;
    return item.category === catalogFilter;
  });

  const filteredSchedules = schedules.filter(item => {
    const matchesLoc = scheduleLoc === 'all' || item.locType === scheduleLoc;
    const q = scheduleSearch.toLowerCase();
    const matchesQuery = item.title.toLowerCase().includes(q) ||
      item.tuk.toLowerCase().includes(q) ||
      item.locText.toLowerCase().includes(q);
    return matchesLoc && matchesQuery;
  });

  return (
    <>
      <a href="#main-app" className="skip-link">Lewati ke konten aplikasi</a>

      <aside className="institutional-bar" aria-label="Informasi Afiliasi Resmi">
        <div className="container institutional-inner">
          <div className="inst-left">
            <span className="material-symbols-outlined inst-icon" aria-hidden="true">verified</span>
            <span>Lembaga Sertifikasi Profesi (LSP) Terlisensi Badan Nasional Sertifikasi Profesi (BNSP)</span>
          </div>
          <div className="inst-right font-mono">
            <span>Lisensi No: KEP.0418/BNSP/III/2024</span>
          </div>
        </div>
      </aside>

      <header className="site-header" id="site-header">
        <div className="header-container">
          <a
            href="#tab-beranda"
            className="brand-logo"
            onClick={(e) => { e.preventDefault(); handleTabSwitch('beranda'); }}
            aria-label="CertiSkill BNSP Beranda"
          >
            <div className="brand-badge-icon" aria-hidden="true">
              <span className="brand-logo-monogram">CS</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">Certi<span className="brand-accent">Skill</span></span>
              <span className="brand-sub">PORTAL UJI KOMPETENSI BNSP</span>
            </div>
          </a>

          <nav className="main-tab-nav" aria-label="Navigasi Utama Aplikasi">
            <ul className="nav-tab-list" role="tablist">
              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="nav-btn-beranda"
                  className={`nav-tab-btn nav-pill-btn ${activeTab === 'beranda' ? 'active' : ''}`}
                  aria-selected={activeTab === 'beranda'}
                  onClick={() => handleTabSwitch('beranda')}
                >
                  <div className="user-avatar-initial nav-avatar-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">home</span>
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">Beranda</span>
                    <span className="user-pill-role font-mono">Portal BNSP</span>
                  </div>
                </button>
              </li>

              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="nav-btn-katalog"
                  className={`nav-tab-btn nav-pill-btn ${activeTab === 'katalog' ? 'active' : ''}`}
                  aria-selected={activeTab === 'katalog'}
                  onClick={() => handleTabSwitch('katalog')}
                >
                  <div className="user-avatar-initial nav-avatar-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">Katalog</span>
                    <span className="user-pill-role font-mono">Skema SKKNI</span>
                  </div>
                </button>
              </li>

              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="nav-btn-jadwal"
                  className={`nav-tab-btn nav-pill-btn ${activeTab === 'jadwal' ? 'active' : ''}`}
                  aria-selected={activeTab === 'jadwal'}
                  onClick={() => handleTabSwitch('jadwal')}
                >
                  <div className="user-avatar-initial nav-avatar-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">Jadwal & Materi</span>
                    <span className="user-pill-role font-mono">TUK Resmi</span>
                  </div>
                </button>
              </li>

              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="nav-btn-ujian"
                  className={`nav-tab-btn nav-pill-btn ${activeTab === 'ujian' ? 'active' : ''}`}
                  aria-selected={activeTab === 'ujian'}
                  onClick={() => handleTabSwitch('ujian')}
                >
                  <div className="user-avatar-initial nav-avatar-icon nav-icon-warning" aria-hidden="true">
                    <span className="material-symbols-outlined text-warning">quiz</span>
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">Ujian Online</span>
                    <span className="user-pill-role font-mono text-warning">CBT Proktor</span>
                  </div>
                </button>
              </li>

              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="nav-btn-sertifikasi"
                  className={`nav-tab-btn nav-pill-btn ${activeTab === 'sertifikasi' ? 'active' : ''}`}
                  aria-selected={activeTab === 'sertifikasi'}
                  onClick={() => handleTabSwitch('sertifikasi')}
                >
                  <div className="user-avatar-initial nav-avatar-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">military_tech</span>
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">Sertifikasi</span>
                    <span className="user-pill-role font-mono">
                      <span>{earnedActiveCount}</span> Sertifikat
                    </span>
                  </div>
                </button>
              </li>

              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="nav-btn-profil"
                  className={`nav-tab-btn nav-pill-btn ${activeTab === 'profil' ? 'active' : ''}`}
                  aria-selected={activeTab === 'profil'}
                  onClick={() => handleTabSwitch('profil')}
                >
                  <div className="user-avatar-initial nav-avatar-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">manage_accounts</span>
                  </div>
                  <div className="user-pill-info">
                    <span className="user-pill-name">Profile</span>
                    <span className="user-pill-role font-mono">Pengaturan</span>
                  </div>
                </button>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              id="theme-toggle"
              className="btn-icon theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div
              className="user-pill-btn"
              id="header-user-btn"
              role="button"
              tabIndex="0"
              onClick={() => handleTabSwitch('profil')}
              aria-label={`Buka profil asesi: ${profile.nama}`}
            >
              <div className="user-avatar-initial" aria-hidden="true">RB</div>
              <div className="user-pill-info">
                <span className="user-pill-name">{profile.nama.split(',')[0]}</span>
                <span className="user-pill-role font-mono">Asesi Terverifikasi</span>
              </div>
            </div>

            <button
              type="button"
              id="mobile-menu-btn"
              className="mobile-menu-btn btn-icon"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Buka menu navigasi mobile"
            >
              <span className="material-symbols-outlined" aria-hidden="true">menu</span>
            </button>
          </div>
        </div>

        <div id="mobile-nav-drawer" className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
          <div className="mobile-user-card">
            <div className="user-avatar-initial lg">RB</div>
            <div>
              <strong className="mobile-user-name">{profile.nama}</strong>
              <span className="mobile-user-id font-mono">ID Asesi: {profile.noReg}</span>
            </div>
          </div>

          <ul className="mobile-nav-list" role="tablist">
            <li>
              <button
                type="button"
                className={`mobile-nav-btn ${activeTab === 'beranda' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('beranda')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">home</span>
                Beranda Portal
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-btn ${activeTab === 'katalog' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('katalog')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
                Katalog Skema Sertifikasi
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-btn ${activeTab === 'jadwal' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('jadwal')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                Jadwal Asesmen & Materi
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-btn ${activeTab === 'ujian' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('ujian')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
                Ruang Ujian Online (CBT Proktor)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-btn ${activeTab === 'sertifikasi' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('sertifikasi')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">military_tech</span>
                Sertifikat Saya ({earnedActiveCount})
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-btn ${activeTab === 'profil' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('profil')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">manage_accounts</span>
                Pengaturan Profil Asesi
              </button>
            </li>
          </ul>
        </div>
      </header>

      <main id="main-app" className="site-main">

        {/* TAB 1: BERANDA */}
        {activeTab === 'beranda' && (
          <section id="view-beranda" className="tab-pane active" role="tabpanel">
            <div className="hero-banner">
              <div className="container hero-inner">
                <div className="hero-content">
                  <div className="hero-badge-tag">
                    <span className="material-symbols-outlined icon-shield" aria-hidden="true">shield</span>
                    <span>Lisensi Resmi BNSP RI / SKKNI Terakreditasi</span>
                  </div>

                  <h1 className="hero-title">
                    Selamat Datang di Portal Asesmen CertiSkill
                  </h1>

                  <p className="hero-subtitle">
                    Portal sertifikasi profesi digital nasional berbasis Standar Kompetensi Kerja Nasional Indonesia
                    (SKKNI). Uji kompetensi resmi dengan pengawasan CBT berproktor langsung dan legalitas berlogo Garuda.
                  </p>

                  <div className="hero-cta-group">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={() => handleTabSwitch('ujian')}
                    >
                      <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">videocam</span>
                      Masuk Simulasi Ujian CBT
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg"
                      onClick={() => handleTabSwitch('katalog')}
                    >
                      <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">explore</span>
                      Jelajahi Skema SKKNI
                    </button>
                  </div>

                  <div className="hero-stats-panel">
                    <div className="stat-mini-card">
                      <div className="stat-icon-wrap bg-blue">
                        <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
                      </div>
                      <div>
                        <span className="stat-val font-mono">{earnedActiveCount}</span>
                        <span className="stat-lbl">Sertifikat BNSP Aktif</span>
                      </div>
                    </div>

                    <div className="stat-mini-card">
                      <div className="stat-icon-wrap bg-emerald">
                        <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
                      </div>
                      <div>
                        <span className="stat-val font-mono">{schedules.length}</span>
                        <span className="stat-lbl">Asesmen Terjadwal</span>
                      </div>
                    </div>

                    <div className="stat-mini-card">
                      <div className="stat-icon-wrap bg-indigo">
                        <span className="material-symbols-outlined" aria-hidden="true">videocam</span>
                      </div>
                      <div>
                        <span className="stat-val font-mono">CBT</span>
                        <span className="stat-lbl">Ujian Online Berproktor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container section-spacer">
              <div className="two-col-dashboard-grid">
                
                <div className="card panel-card">
                  <div className="card-header">
                    <div className="card-header-left">
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">event_note</span>
                      <h2 className="card-heading">Jadwal Uji Kompetensi Terdekat Anda</h2>
                    </div>
                    <span className="status-badge badge-warning">Tahap Pra-Asesmen</span>
                  </div>

                  <div className="assessment-reminder-box">
                    <div className="reminder-top">
                      <h3 className="reminder-scheme-title">Arsitek Solusi Perangkat Lunak Skala Besar</h3>
                      <span className="font-mono text-muted text-xs">Skema: SWE-ARCH-01 (SKKNI Level 7)</span>
                    </div>

                    <div className="reminder-meta-list">
                      <div className="reminder-meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                        <div>
                          <strong>28 Maret 2026</strong>
                          <span>Pukul 08.30 - 15.00 WIB</span>
                        </div>
                      </div>
                      <div className="reminder-meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">location_city</span>
                        <div>
                          <strong>TUK Mandiri Kampus Cyber Jakarta</strong>
                          <span>Laboratorium Uji 3, Lantai 2</span>
                        </div>
                      </div>
                      <div className="reminder-meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">badge</span>
                        <div>
                          <strong>Asesor Penguji Ditugaskan</strong>
                          <span>Ir. Hendra Gunawan, M.T. (No Reg: MET.000.002811)</span>
                        </div>
                      </div>
                    </div>

                    <div className="reminder-footer">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleTabSwitch('ujian')}
                      >
                        <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">computer</span>
                        Simulasi Ujian Teori CBT
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleTabSwitch('jadwal')}
                      >
                        <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                        Unduh Berkas APL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card panel-card">
                  <div className="card-header">
                    <div className="card-header-left">
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">qr_code_scanner</span>
                      <h2 className="card-heading">Pengecekan Keaslian Sertifikat BNSP</h2>
                    </div>
                    <span className="status-badge badge-success">Online 24/7</span>
                  </div>

                  <p className="text-sm text-muted mb-3">
                    Verifikasi sertifikat kompetensi berlogo Garuda BNSP menggunakan nomor registrasi resmi atau hash tanda tangan kriptografi.
                  </p>

                  <form className="verify-form" onSubmit={handleVerify} noValidate>
                    <div className="input-with-action">
                      <span className="material-symbols-outlined input-leading-icon" aria-hidden="true">badge</span>
                      <input
                        type="text"
                        className="form-input font-mono"
                        placeholder="Contoh: CERT-2026-8891"
                        value={verifyInput}
                        onChange={(e) => setVerifyInput(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary verify-submit-btn">
                        <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">search</span>
                        Periksa
                      </button>
                    </div>

                    <div className="quick-samples">
                      <span className="quick-samples-label">Coba sampel dokumen:</span>
                      <div className="sample-chips">
                        <button
                          type="button"
                          className="sample-chip"
                          onClick={() => { setVerifyInput('CERT-2026-8891'); }}
                        >
                          CERT-2026-8891 (Siber)
                        </button>
                        <button
                          type="button"
                          className="sample-chip"
                          onClick={() => { setVerifyInput('CERT-2025-5519'); }}
                        >
                          CERT-2025-5519 (AI)
                        </button>
                        <button
                          type="button"
                          className="sample-chip"
                          onClick={() => { setVerifyInput('CERT-2024-4402'); }}
                        >
                          CERT-2024-4402 (Kedaluwarsa)
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="verify-result-panel" aria-live="polite">
                    {verifyStatus === 'idle' && (
                      <div className="state-container state-initial">
                        <span className="material-symbols-outlined state-icon" aria-hidden="true">fingerprint</span>
                        <p className="state-message">Masukkan nomor registrasi sertifikat BNSP Anda di atas untuk memeriksa status pengesahan.</p>
                      </div>
                    )}

                    {verifyStatus === 'loading' && (
                      <div className="state-container state-initial" style={{ backgroundColor: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)' }}>
                        <div className="spinner" aria-hidden="true"></div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-primary-dark)' }}>Menghubungi Basis Data Otoritas BNSP...</strong>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memvalidasi tanda tangan digital dan nomor registrasi: {verifyInput}</span>
                        </div>
                      </div>
                    )}

                    {verifyStatus === 'result' && verifyResult && (
                      <div className="state-container state-success" role="region" aria-label="Hasil Verifikasi Sertifikat">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span className="status-badge" style={{ backgroundColor: verifyResult.status === 'valid' ? 'var(--color-success)' : 'var(--color-warning)', color: '#fff' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }} aria-hidden="true">verified</span>
                            {verifyResult.statusText}
                          </span>
                          <span className="font-mono text-xs text-subtle">Reg: {verifyResult.bnspRegNumber}</span>
                        </div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', display: 'block' }}>{verifyResult.recipientName}</strong>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{verifyResult.programTitle}</p>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                          <div>Lembaga: {verifyResult.issuerName}</div>
                          <div>Berlaku Hingga: <strong>{verifyResult.expiryDate}</strong></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => setCertModalData(verifyResult)}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">visibility</span>
                            Rincian SKKNI
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => downloadCertificate(verifyResult)}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                            Unduh Bukti Sah
                          </button>
                        </div>
                      </div>
                    )}

                    {verifyStatus === 'not_found' && (
                      <div className="state-container state-error" role="alert">
                        <span className="material-symbols-outlined state-icon text-danger" aria-hidden="true">error</span>
                        <div>
                          <strong style={{ color: 'var(--color-danger)' }}>Nomor Registrasi Tidak Terdaftar</strong>
                          <p className="state-message">Sertifikat dengan nomor {verifyInput} tidak ditemukan dalam arsip resmi BNSP.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="container section-spacer">
              <div className="section-header text-center">
                <div className="section-tag">
                  <span className="material-symbols-outlined tag-icon" aria-hidden="true">flowchart</span>
                  SOP Sertifikasi BNSP
                </div>
                <h2 className="section-heading">Tahapan Mengikuti Uji Sertifikasi Kompetensi</h2>
                <p className="section-subheading">
                  Proses terstandar nasional dari pendaftaran skema hingga pengesahan dan penerbitan sertifikat digital berlogo Garuda.
                </p>
              </div>

              <div className="flow-steps-grid five-cols">
                <div className="flow-step-card">
                  <div className="step-badge font-mono">LANGKAH 1</div>
                  <div className="step-icon-wrap">
                    <span className="material-symbols-outlined" aria-hidden="true">app_registration</span>
                  </div>
                  <h3 className="step-title">Pilih Skema & APL-01</h3>
                  <p className="step-desc">
                    Pilih kualifikasi di katalog skema. Asesi melengkapi data pemohon sertifikasi dan mengunggah portofolio bukti kerja.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="step-badge font-mono">LANGKAH 2</div>
                  <div className="step-icon-wrap">
                    <span className="material-symbols-outlined" aria-hidden="true">checklist</span>
                  </div>
                  <h3 className="step-title">Asesmen Mandiri APL-02</h3>
                  <p className="step-desc">
                    Asesi meninjau setiap unit kompetensi SKKNI dan menyatakan kesiapan bukti (Bukti Kompetensi / BK) secara objektif.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="step-badge font-mono">LANGKAH 3</div>
                  <div className="step-icon-wrap">
                    <span className="material-symbols-outlined" aria-hidden="true">videocam</span>
                  </div>
                  <h3 className="step-title">Uji Teori CBT Online</h3>
                  <p className="step-desc">
                    Ujian berbasis komputer dengan pengawasan kamera langsung dan sistem deteksi perpindahan tab anti kecurangan.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="step-badge font-mono">LANGKAH 4</div>
                  <div className="step-icon-wrap">
                    <span className="material-symbols-outlined" aria-hidden="true">fact_check</span>
                  </div>
                  <h3 className="step-title">Praktik TUK & Pleno</h3>
                  <p className="step-desc">
                    Asesor merekomendasikan status Kompeten (K). Komite Teknis LSP menggelar rapat pleno penetapan hasil sertifikasi.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="step-badge font-mono">LANGKAH 5</div>
                  <div className="step-icon-wrap">
                    <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                  </div>
                  <h3 className="step-title">Terbit Sertifikat Garuda</h3>
                  <p className="step-desc">
                    Sertifikat kompetensi resmi terbit dengan nomor registrasi BNSP nasional dan stempel tanda tangan elektronik bersertifikasi.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: CBT EXAM ONLINE */}
        {activeTab === 'ujian' && (
          <section id="view-ujian" className="tab-pane active" role="tabpanel">
            <div className="container section-spacer">
              
              {examScreen === 'lobby' && (
                <div id="exam-lobby-screen" className="exam-card-lobby">
                  <div className="lobby-header-banner">
                    <div className="lobby-tag font-mono">
                      <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                      LINGKUNGAN ASESMEN RESMI DILINDUNGI
                    </div>
                    <h1 className="lobby-title">Ruang Asesmen Teori Online Berproktor (CBT)</h1>
                    <p className="lobby-subtitle">
                      Sistem Ujian Kompetensi Teori Terstandarisasi BNSP. Dilengkapi protokol integritas pengawasan kamera
                      AI, pembatasan perpindahan tab browser, dan sistem diskualifikasi otomatis.
                    </p>
                  </div>

                  <div className="lobby-grid">
                    <div className="lobby-col-rules">
                      <h2 className="lobby-col-heading">
                        <span className="material-symbols-outlined text-warning" aria-hidden="true">warning</span>
                        Tata Tertib Integritas & Keamanan Ketat:
                      </h2>

                      <div className="proctor-rules-list">
                        <div className="proctor-rule-item danger-rule">
                          <div className="rule-badge-num">1</div>
                          <div>
                            <strong>Batas Maksimal 3x Pindah Tab (Toleransi Nol Tolerir)</strong>
                            <p>
                              Setiap perpindahan jendela tab, aplikasi eksternal, atau Alt+Tab tercatat real-time. Jika
                              melanggar <strong>lebih dari 3 kali</strong>, sistem otomatis <strong>MENDISKUALIFIKASI UJIAN DENGAN
                              NILAI 0</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="proctor-rule-item">
                          <div className="rule-badge-num">2</div>
                          <div>
                            <strong>Wajib Izin Kamera / Sensor Pengawas Aktif</strong>
                            <p>
                              Kamera web wajib aktif merekam wajah selama sesi asesmen berlangsung. Wajah asesi harus
                              berada di tengah bingkai layar pandang proktor.
                            </p>
                          </div>
                        </div>

                        <div className="proctor-rule-item">
                          <div className="rule-badge-num">3</div>
                          <div>
                            <strong>Ambang Batas Kelulusan: Passing Grade 80 Poin</strong>
                            <p>
                              Asesi dinyatakan <strong>Lolos / Kompeten (K)</strong> apabila memperoleh nilai minimal <strong>80 poin</strong> (minimal 4 dari 5 butir soal benar). Nilai kurang dari 80 dinyatakan <strong>Gagal / Belum Kompeten (BK)</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="proctor-rule-item">
                          <div className="rule-badge-num">4</div>
                          <div>
                            <strong>Wajib Mode Layar Penuh (Fullscreen Required)</strong>
                            <p>
                              Saat tombol 'Mulai Ujian Sekarang' ditekan, browser akan beralih ke mode layar penuh. Keluar
                              dari fullscreen dihitung sebagai pelanggaran fokus jendela.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lobby-col-readiness">
                      <h2 className="lobby-col-heading">
                        <span className="material-symbols-outlined text-primary" aria-hidden="true">videocam</span>
                        Verifikasi Perangkat Pengawasan:
                      </h2>

                      <div className="webcam-preview-box">
                        <video
                          ref={lobbyVideoRef}
                          id="lobby-video-preview"
                          autoPlay
                          playsInline
                          muted
                          style={{ display: webcamActive ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                        ></video>
                        {!webcamActive && (
                          <div id="lobby-cam-placeholder" className="cam-placeholder">
                            <span className="material-symbols-outlined" aria-hidden="true">videocam_off</span>
                            <p>Kamera belum terhubung. Klik tombol di bawah untuk menguji koneksi webcam Anda.</p>
                          </div>
                        )}
                      </div>

                      <div className="cam-status-row">
                        <span className="cam-label">Status Sensor Proctor:</span>
                        <span className={`status-badge ${webcamActive ? 'badge-success' : webcamError ? 'badge-warning' : 'badge-danger'}`}>
                          {webcamActive ? 'Kamera Aktif & Terhubung' : webcamError ? 'Sensor Virtual AI Aktif' : 'Belum Aktif'}
                        </span>
                      </div>

                      <div className="exam-info-card">
                        <div className="exam-info-row">
                          <span>Skema Ujian:</span>
                          <strong>Auditor Forensik Digital (SKM-BNSP-CSO-26)</strong>
                        </div>
                        <div className="exam-info-row">
                          <span>Jumlah Soal:</span>
                          <strong>5 Butir Soal SKKNI Terstandarisasi</strong>
                        </div>
                        <div className="exam-info-row">
                          <span>Passing Grade:</span>
                          <strong className="text-primary font-bold">Minimal 80 Poin (Lolos Kompeten)</strong>
                        </div>
                        <div className="exam-info-row">
                          <span>Durasi Pengerjaan:</span>
                          <strong>15 Menit</strong>
                        </div>
                        <div className="exam-info-row">
                          <span>Toleransi Pindah Tab:</span>
                          <strong className="text-danger">Maksimal 3 Kali Saja</strong>
                        </div>
                      </div>

                      <div className="lobby-actions-col">
                        {!webcamActive && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%' }}
                            onClick={requestWebcam}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">videocam</span>
                            Uji Coba Webcam Pengawas
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary btn-lg"
                          style={{ width: '100%' }}
                          onClick={startExam}
                        >
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">play_circle</span>
                          Mulai Ujian Sekarang (Masuk Fullscreen)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {examScreen === 'active' && (
                <div id="exam-active-screen" className="exam-active-container">
                  <div className="exam-top-bar">
                    <div className="exam-top-left">
                      <div className="exam-title-group">
                        <span className="exam-badge-scheme font-mono">SKM-BNSP-CSO-26</span>
                        <h2 className="exam-live-title">Uji Teori Auditor Forensik Digital BNSP</h2>
                      </div>
                    </div>

                    <div className="exam-top-center">
                      <div className={`timer-countdown-box ${timeRemaining < 120 ? 'urgent' : ''}`} aria-label="Sisa Waktu Ujian">
                        <span className="material-symbols-outlined" aria-hidden="true">timer</span>
                        <span className="timer-text font-mono">{formatTimer(timeRemaining)}</span>
                      </div>
                    </div>

                    <div className="exam-top-right">
                      <div className="violation-indicator-box" aria-label="Status Pelanggaran Tab">
                        <div className="violation-header-row">
                          <span className="material-symbols-outlined text-warning" aria-hidden="true">tab</span>
                          <span className="violation-lbl">Peringatan Tab:</span>
                          <span className="violation-val font-mono text-danger font-bold">
                            {tabViolations} / 3 Kali
                          </span>
                        </div>
                        <div className="violation-dots-row">
                          {[1, 2, 3, 4].map(num => (
                            <div
                              key={num}
                              className={`strike-dot ${num <= tabViolations ? 'active-strike' : ''}`}
                              title={`Pelanggaran ${num}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="exam-pip-cam-wrap" title="Pengawasan Kamera Langsung">
                        <video ref={activeVideoRef} autoPlay playsInline muted></video>
                        <span className="pip-live-badge font-mono">LIVE PROCTOR</span>
                      </div>

                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => {
                          if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen().catch(() => {});
                          } else {
                            document.exitFullscreen().catch(() => {});
                          }
                        }}
                        title="Beralih Layar Penuh"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">fullscreen</span>
                      </button>
                    </div>
                  </div>

                  <div className="exam-body-grid">
                    <div className="question-content-panel">
                      <div className="question-meta-bar">
                        <span className="q-number-pill font-mono">
                          Soal Nomor <span>{currentQIndex + 1}</span> dari {EXAM_QUESTIONS.length}
                        </span>
                        <span className="q-unit-ref font-mono">
                          {EXAM_QUESTIONS[currentQIndex]?.unit}
                        </span>
                        <button
                          type="button"
                          className={`btn-flag-doubt ${doubtfulQuestions[EXAM_QUESTIONS[currentQIndex]?.id] ? 'active' : ''}`}
                          onClick={() => {
                            const qId = EXAM_QUESTIONS[currentQIndex].id;
                            setDoubtfulQuestions(prev => ({
                              ...prev,
                              [qId]: !prev[qId]
                            }));
                          }}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">flag</span>
                          <span>{doubtfulQuestions[EXAM_QUESTIONS[currentQIndex]?.id] ? 'Ragu-ragu (Aktif)' : 'Tandai Ragu-ragu'}</span>
                        </button>
                      </div>

                      <div className="question-prompt-box">
                        <p className="q-prompt-text">
                          {EXAM_QUESTIONS[currentQIndex]?.prompt}
                        </p>
                      </div>

                      <div className="options-list-wrap" role="radiogroup" aria-label="Pilihan Jawaban">
                        {EXAM_QUESTIONS[currentQIndex]?.options.map(opt => {
                          const isSelected = userAnswers[EXAM_QUESTIONS[currentQIndex]?.id] === opt.key;
                          return (
                            <div
                              key={opt.key}
                              className={`option-item-card ${isSelected ? 'selected' : ''}`}
                              role="radio"
                              aria-checked={isSelected}
                              tabIndex="0"
                              onClick={() => {
                                setUserAnswers(prev => ({
                                  ...prev,
                                  [EXAM_QUESTIONS[currentQIndex]?.id]: opt.key
                                }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                  e.preventDefault();
                                  setUserAnswers(prev => ({
                                    ...prev,
                                    [EXAM_QUESTIONS[currentQIndex]?.id]: opt.key
                                  }));
                                }
                              }}
                            >
                              <div className="option-radio-key">{opt.key}</div>
                              <div className="option-text-label">{opt.text}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="question-nav-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={currentQIndex === 0}
                          onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        >
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">arrow_back</span>
                          Soal Sebelumnya
                        </button>

                        <div className="center-flag-hint">
                          <span className="text-xs text-muted">Ambang batas Passing Grade kelulusan: <strong>80 Poin</strong></span>
                        </div>

                        {currentQIndex === EXAM_QUESTIONS.length - 1 ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setConfirmFinishModalOpen(true)}
                          >
                            Tinjau & Selesai
                            <span className="material-symbols-outlined btn-icon-end" aria-hidden="true">task_alt</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setCurrentQIndex(prev => Math.min(EXAM_QUESTIONS.length - 1, prev + 1))}
                          >
                            Soal Berikutnya
                            <span className="material-symbols-outlined btn-icon-end" aria-hidden="true">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <aside className="exam-sidebar-panel" aria-label="Palet Navigasi Soal">
                      <div className="palette-header">
                        <h3 className="palette-title">Daftar Nomor Soal</h3>
                        <span className="palette-subtitle">Klik nomor untuk melompat langsung</span>
                      </div>

                      <div className="palette-grid">
                        {EXAM_QUESTIONS.map((q, idx) => {
                          const isCurrent = idx === currentQIndex;
                          const isAnswered = userAnswers[q.id] !== undefined;
                          const isDoubtful = doubtfulQuestions[q.id] === true;

                          let cls = 'palette-q-btn';
                          if (isCurrent) cls += ' current';
                          if (isDoubtful) cls += ' doubtful';
                          else if (isAnswered) cls += ' answered';

                          return (
                            <button
                              key={q.id}
                              type="button"
                              className={cls}
                              onClick={() => setCurrentQIndex(idx)}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <div className="palette-legend">
                        <div className="legend-item">
                          <span className="legend-dot answered"></span>
                          <span>Sudah Dijawab ({Object.keys(userAnswers).length})</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot doubtful"></span>
                          <span>Ragu-ragu ({Object.values(doubtfulQuestions).filter(Boolean).length})</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot unanswered"></span>
                          <span>Belum Dijawab ({EXAM_QUESTIONS.length - Object.keys(userAnswers).length})</span>
                        </div>
                      </div>

                      <div className="exam-finish-box">
                        <button
                          type="button"
                          className="btn btn-danger btn-finish-exam"
                          onClick={() => setConfirmFinishModalOpen(true)}
                        >
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">done_all</span>
                          Kumpulkan Ujian Sekarang
                        </button>
                      </div>
                    </aside>
                  </div>
                </div>
              )}

              {examScreen === 'result' && (
                <div id="exam-result-screen" className="exam-result-container">
                  <div className="exam-result-card-wrap">
                    {isDisqualified ? (
                      <div className="result-card-disqualified" role="alert">
                        <div className="disqualify-badge-icon" aria-hidden="true">
                          <span className="material-symbols-outlined">block</span>
                        </div>

                        <h2 className="disqualify-heading">UJIAN DIHENTIKAN: DISKUALIFIKASI RESMI</h2>
                        <p className="disqualify-reason">
                          Sistem mencatat Anda telah berpindah tab atau meninggalkan jendela ujian sebanyak <strong>{tabViolations} kali</strong> (melebihi batas toleransi maksimal 3 kali). Sesuai dengan Peraturan Tata Tertib Uji Kompetensi Berproktor BNSP, Anda dinyatakan <strong>GUGUR DENGAN NILAI 0</strong>.
                        </p>

                        <div className="disqualify-score-badge">0 / 100</div>
                        <span className="status-badge badge-danger">Status Kelulusan: GUGUR / DISKUALIFIKASI</span>

                        <div className="violation-audit-log-box">
                          <h3 className="audit-log-title">
                            <span className="material-symbols-outlined text-danger" aria-hidden="true">receipt_long</span>
                            Berita Acara Pencatatan Pelanggaran Otomatis:
                          </h3>
                          <ul className="audit-log-list">
                            {violationLogs.map((log, i) => (
                              <li key={i}>
                                <span>Pelanggaran Ke-{log.strike}: <em>{log.reason}</em></span>
                                <strong>Pukul {log.timestamp} WIB</strong>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="result-actions-row">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                              setExamScreen('lobby');
                            }}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">replay</span>
                            Uji Coba Ulang Simulasi
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleTabSwitch('beranda')}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">dashboard</span>
                            Kembali ke Beranda Portal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="result-card-normal">
                        <div
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                          className={`status-badge ${examScore?.passed ? 'badge-success' : 'badge-danger'}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {examScore?.passed ? 'verified' : 'cancel'}
                          </span>
                          <span>Hasil Asesmen: {examScore?.passed ? 'LOLOS (KOMPETEN / K)' : 'GAGAL (BELUM KOMPETEN / BK)'}</span>
                        </div>

                        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                          {examScore?.passed ? 'Selamat! Anda Dinyatakan Lolos & Kompeten' : 'Mohon Maaf, Anda Belum Lolos Ujian'}
                        </h2>
                        <p className="text-muted text-sm" style={{ maxWidth: 540, margin: '0 auto 1.5rem auto' }}>
                          {examScore?.passed
                            ? 'Nilai akhir Anda berhasil mencapai ambang batas kelulusan minimal 80 poin. Berkas direkomendasikan terbit Sertifikat Kompetensi BNSP.'
                            : 'Nilai akhir Anda belum mencapai ambang batas kelulusan minimal 80 poin (Passing Grade: 80). Diperlukan minimal 4 butir soal benar untuk dinyatakan Lolos.'}
                        </p>

                        <div style={{
                          backgroundColor: examScore?.passed ? 'var(--color-primary-subtle)' : 'var(--color-danger-bg)',
                          border: `2px solid ${examScore?.passed ? 'var(--color-primary-border)' : 'var(--color-danger-border)'}`,
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-block',
                          minWidth: 240,
                          marginBottom: '1.5rem'
                        }}>
                          <span className="font-bold text-xs text-subtle" style={{ display: 'block' }}>NILAI AKHIR ASESMEN:</span>
                          <div className="normal-score-badge" style={{ color: examScore?.passed ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                            {examScore?.score} / 100
                          </div>
                          <span className="text-xs font-mono font-bold" style={{ color: examScore?.passed ? 'var(--color-primary-dark)' : 'var(--color-danger)', display: 'block', marginTop: '0.25rem' }}>
                            Benar {examScore?.correctCount} dari {examScore?.totalCount} Butir Soal (Passing Grade: 80)
                          </span>
                          <span className="text-xs font-bold" style={{ color: examScore?.passed ? 'var(--color-success)' : 'var(--color-danger)', display: 'block', marginTop: '0.25rem' }}>
                            Status: {examScore?.passed ? 'MEMENUHI SYARAT KELULUSAN' : 'TIDAK MEMENUHI SYARAT KELULUSAN'}
                          </span>
                        </div>

                        <div style={{
                          backgroundColor: 'var(--bg-surface-muted)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color-subtle)',
                          maxWidth: 520,
                          margin: '0 auto 1.5rem auto',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          lineHeight: 1.6
                        }}>
                          <div>Asesi : <strong>{profile.nama}</strong></div>
                          <div>Skema : <strong>Auditor Forensik Digital (SKM-BNSP-CSO-26)</strong></div>
                          <div>Passing Grade : <strong>Minimal 80 Poin</strong></div>
                          <div>Status Pelanggaran Tab: <strong className="text-success">{tabViolations} Kali (Memenuhi Protokol Integritas)</strong></div>
                          <div>Rekomendasi Asesor: <strong style={{ color: examScore?.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {examScore?.passed ? 'DIREKOMENDASIKAN TERBIT SERTIFIKAT BNSP' : 'DIREKOMENDASIKAN MENGIKUTI REMEDIAL UJIAN TEORI'}
                          </strong></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                          {examScore?.passed ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => handleTabSwitch('sertifikasi')}
                            >
                              <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">military_tech</span>
                              Buka Tab Sertifikasi Saya
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setExamScreen('lobby')}
                              >
                                <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">replay</span>
                                Uji Coba Remedial Ulang
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => handleTabSwitch('jadwal')}
                              >
                                <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">menu_book</span>
                                Pelajari Materi & Kisi-Kisi SKKNI
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </section>
        )}

        {/* TAB 3: KATALOG SKEMA BNSP */}
        {activeTab === 'katalog' && (
          <section id="view-katalog" className="tab-pane active" role="tabpanel">
            <div className="container section-spacer">
              <div className="section-header">
                <div className="section-tag">
                  <span className="material-symbols-outlined tag-icon" aria-hidden="true">library_books</span>
                  Standar Kompetensi Kerja Nasional Indonesia (SKKNI)
                </div>
                <h1 className="section-heading">Katalog Skema Uji Sertifikasi BNSP</h1>
                <p className="section-subheading">
                  Daftar skema sertifikasi okupasi dan klaster berlisensi BNSP. Setiap skema dirancang sesuai kebutuhan industri teknologi dan diakui secara nasional serta regional ASEAN.
                </p>

                <div className="catalog-tabs" role="tablist" aria-label="Filter Kategori Skema BNSP">
                  {[
                    { key: 'all', label: 'Semua Kategori' },
                    { key: 'cyber', label: 'Keamanan Siber' },
                    { key: 'ai', label: 'Kecerdasan Buatan' },
                    { key: 'software', label: 'Rekayasa Perangkat Lunak' },
                    { key: 'data', label: 'Tata Kelola Data' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      className={`tab-btn ${catalogFilter === tab.key ? 'active' : ''}`}
                      aria-selected={catalogFilter === tab.key}
                      onClick={() => setCatalogFilter(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalog-grid" id="full-catalog-grid">
                {filteredCatalog.map(item => (
                  <article key={item.id} className="cert-catalog-card" data-category={item.category}>
                    <div className="card-top">
                      <span className="cert-badge-category">{item.categoryLabel}</span>
                      <span className="code-pill font-mono">{item.code}</span>
                    </div>
                    <div className="cert-card-media">
                      <img src={item.image} alt={item.imageAlt} width="600" height="338" loading="lazy" />
                    </div>
                    <h2 className="card-title">{item.title}</h2>
                    <p className="card-description">{item.desc}</p>
                    <div className="card-skkni-info">
                      <span className="skkni-badge font-mono">{item.skkni}</span>
                      <span className="units-badge">{item.unitsCount}</span>
                      <span className="level-badge font-mono">{item.level}</span>
                    </div>
                    <div className="card-footer">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setSchemeDetailData(SCHEMES_DATA[item.id])}
                      >
                        <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">list_alt</span>
                        Daftar Unit & Pelatihan
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setRegisterModalData({ title: item.title, code: item.code })}
                      >
                        <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">how_to_reg</span>
                        Daftar Asesmen
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: JADWAL & MATERI */}
        {activeTab === 'jadwal' && (
          <section id="view-jadwal" className="tab-pane active" role="tabpanel">
            <div className="container section-spacer">
              
              <div className="section-header">
                <div className="section-tag">
                  <span className="material-symbols-outlined tag-icon" aria-hidden="true">event</span>
                  Tempat Uji Kompetensi (TUK) Resmi
                </div>
                <h1 className="section-heading">Jadwal Uji Kompetensi & Unduhan Materi BNSP</h1>
                <p className="section-subheading">
                  Pilih jadwal uji terdekat di Tempat Uji Kompetensi (TUK) terverifikasi. Pastikan Anda telah mengunduh dan mempelajari berkas APL-01 dan APL-02 sebelum hari asesmen.
                </p>
              </div>

              <div className="materials-box mb-4">
                <div className="materials-header">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">folder_zip</span>
                  <div>
                    <h2 className="materials-title">Dokumen Resmi Pra-Asesmen & Formulir Wajib</h2>
                    <p className="text-sm text-muted">Unduh dan siapkan berkas kelengkapan bukti portofolio sebelum menghadiri asesmen di TUK.</p>
                  </div>
                </div>

                <div className="download-grid">
                  <div className="download-card">
                    <div className="dl-icon-col">
                      <span className="material-symbols-outlined" aria-hidden="true">description</span>
                    </div>
                    <div className="dl-info-col">
                      <strong className="dl-title">Formulir APL-01 (Permohonan Sertifikasi)</strong>
                      <span className="dl-meta font-mono">Format: PDF / Formulir Isian Resmi BNSP</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadDocForm('APL-01-Permohonan-Sertifikasi-BNSP.pdf')}
                    >
                      <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                      Unduh
                    </button>
                  </div>

                  <div className="download-card">
                    <div className="dl-icon-col">
                      <span className="material-symbols-outlined" aria-hidden="true">fact_check</span>
                    </div>
                    <div className="dl-info-col">
                      <strong className="dl-title">Formulir APL-02 (Asesmen Mandiri Asesi)</strong>
                      <span className="dl-meta font-mono">Format: PDF / Daftar Cek Unit Kompetensi</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadDocForm('APL-02-Asesmen-Mandiri-Kuk.pdf')}
                    >
                      <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                      Unduh
                    </button>
                  </div>

                  <div className="download-card">
                    <div className="dl-icon-col">
                      <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
                    </div>
                    <div className="dl-info-col">
                      <strong className="dl-title">Buku Pedoman Tata Tertib Peserta di TUK</strong>
                      <span className="dl-meta font-mono">Format: PDF / Standar Operasional Prosedur</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadDocForm('Pedoman-Asesi-TUK-BNSP.pdf')}
                    >
                      <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                      Unduh
                    </button>
                  </div>
                </div>
              </div>

              <div className="tuk-facility-banner">
                <div className="tuk-facility-grid">
                  <div className="tuk-media-wrap">
                    <img
                      src="assets/images/tuk-training-hall.jpg"
                      alt="Ruang laboratorium komputer Tempat Uji Kompetensi TUK resmi berstandar BNSP"
                      width="600"
                      height="375"
                      loading="lazy"
                    />
                    <span className="tuk-media-badge font-mono">
                      <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                      TUK Terakreditasi BNSP
                    </span>
                  </div>
                  <div className="tuk-facility-content">
                    <div className="section-tag mb-2">
                      <span className="material-symbols-outlined tag-icon" aria-hidden="true">domain</span>
                      Infrastruktur Uji Praktik Standar Industri
                    </div>
                    <h2 className="tuk-facility-title">Sarana & Prasarana Pelatihan Uji Kompetensi Laboratorium</h2>
                    <p className="tuk-facility-desc">
                      Setiap Tempat Uji Kompetensi (TUK) mandiri maupun sewaktu difasilitasi perangkat kerja berstandar SKKNI. Peserta didukung workstation Core i7/32GB RAM, jaringan berkeamanan terisolasi, serta server simulasi untuk uji unjuk kerja langsung.
                    </p>
                    <div className="facility-perks-list">
                      <div className="perk-item">
                        <span className="material-symbols-outlined" aria-hidden="true">router</span>
                        <span>Perangkat Jaringan & Firewall Fisik Enterprise Berlisensi</span>
                      </div>
                      <div className="perk-item">
                        <span className="material-symbols-outlined" aria-hidden="true">speed</span>
                        <span>Koneksi Fiber Optik Dedicated 1 Gbps Redundant Rendah Latensi</span>
                      </div>
                      <div className="perk-item">
                        <span className="material-symbols-outlined" aria-hidden="true">videocam</span>
                        <span>Kamera Pengawasan 360 Derajat & Asesor Bersertifikat BNSP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="schedule-filter-bar">
                <div className="schedule-search-wrap">
                  <span className="material-symbols-outlined search-icon" aria-hidden="true">search</span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Cari skema, kota, atau nama TUK..."
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                  />
                </div>
                <div className="schedule-location-chips" role="group" aria-label="Filter Lokasi TUK">
                  {[
                    { key: 'all', label: 'Semua Lokasi' },
                    { key: 'jakarta', label: 'DKI Jakarta' },
                    { key: 'bandung', label: 'Bandung' },
                    { key: 'surabaya', label: 'Surabaya' },
                    { key: 'daring', label: 'Asesmen Jarak Jauh' }
                  ].map(loc => (
                    <button
                      key={loc.key}
                      type="button"
                      className={`schedule-loc-btn ${scheduleLoc === loc.key ? 'active' : ''}`}
                      onClick={() => setScheduleLoc(loc.key)}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="schedule-cards-list" id="schedule-container">
                {filteredSchedules.map(sched => (
                  <article key={sched.id} className="schedule-row-card" data-loc={sched.locType}>
                    <div className="schedule-date-col">
                      <span className="sched-day">{sched.day}</span>
                      <span className="sched-month">{sched.month}</span>
                      <span className="sched-time font-mono">{sched.time}</span>
                    </div>
                    <div className="schedule-info-col">
                      <div className="sched-meta-tags">
                        <span className="sched-loc-tag font-mono">{sched.locText}</span>
                        <span className={`quota-tag font-mono ${sched.isFull ? 'quota-full' : ''}`}>
                          {sched.quota}
                        </span>
                        {sched.isRegisteredByUser && (
                          <span className="status-badge badge-success font-mono" style={{ fontSize: '0.7rem' }}>
                            Terdaftar Sesi Anda
                          </span>
                        )}
                      </div>
                      <h3 className="sched-title">{sched.title}</h3>
                      <p className="sched-desc">{sched.description}</p>
                      <div className="sched-tuk-name">
                        <span className="material-symbols-outlined" aria-hidden="true">apartment</span>
                        <span>{sched.tuk}</span>
                      </div>
                    </div>
                    <div className="schedule-action-col">
                      {sched.isFull ? (
                        <button type="button" className="btn btn-outline btn-sm" disabled>
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">block</span>
                          Penuh
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm btn-join-schedule"
                          onClick={() => setRegisterModalData({ title: sched.title, code: sched.schemeId })}
                        >
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">how_to_reg</span>
                          Ikuti Sesi Ini
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* TAB 5: SERTIFIKASI */}
        {activeTab === 'sertifikasi' && (
          <section id="view-sertifikasi" className="tab-pane active" role="tabpanel">
            <div className="container section-spacer">

              <div className="section-header">
                <div className="section-tag">
                  <span className="material-symbols-outlined tag-icon" aria-hidden="true">military_tech</span>
                  Dokumen Kredensial Resmi Asesi
                </div>
                <h1 className="section-heading">Koleksi Sertifikat Kompetensi BNSP Anda</h1>
                <p className="section-subheading">
                  Daftar sertifikat kompetensi kerja yang telah dinyatakan Kompeten (K) oleh Dewan Pleno LSP dan disahkan oleh Badan Nasional Sertifikasi Profesi.
                </p>
              </div>

              <div className="asesi-id-card mb-4">
                <div className="asesi-id-left">
                  <div className="user-avatar-initial xl">RB</div>
                  <div className="asesi-id-data">
                    <h2 className="asesi-name">{profile.nama}</h2>
                    <div className="asesi-tags-row">
                      <span className="font-mono text-sm">NIK: {profile.nik.substring(0, 6)}******{profile.nik.substring(profile.nik.length - 4)}</span>
                      <span className="font-mono text-sm">No Reg Asesi: {profile.noReg}</span>
                      <span className="status-badge badge-success">Asesi Aktif Terdaftar</span>
                    </div>
                  </div>
                </div>
                <div className="asesi-id-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(`https://certiskill.id/asesi/${profile.noReg}`);
                      showToast('Tautan portofolio publik asesi berhasil disalin ke clipboard.');
                    }}
                  >
                    <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">share</span>
                    Salin Portofolio Publik
                  </button>
                </div>
              </div>

              <div className="my-certs-grid">
                {Object.values(certificates).map(cert => {
                  const isValid = cert.status === 'valid';
                  return (
                    <article key={cert.id} className="cert-item-card">
                      <div className="cert-card-strip">
                        <div className="strip-left">
                          <span className="material-symbols-outlined strip-icon" aria-hidden="true">verified_user</span>
                          <span className="strip-text font-mono">BADAN NASIONAL SERTIFIKASI PROFESI</span>
                        </div>
                        <div className="strip-right font-mono">
                          <span>REG: {cert.bnspRegNumber}</span>
                        </div>
                      </div>

                      <div className="cert-card-inner">
                        <div className="cert-status-row">
                          <span className={`status-badge ${isValid ? 'badge-success' : 'badge-danger'}`}>
                            <span className="material-symbols-outlined" aria-hidden="true">
                              {isValid ? 'check_circle' : 'history'}
                            </span>
                            {cert.statusText}
                          </span>
                          <span className="font-mono text-xs text-muted">ID: {cert.id}</span>
                        </div>

                        <h2 className="cert-item-title">{cert.programTitle}</h2>
                        <span className="cert-item-scheme font-mono">{cert.schemeCode}</span>

                        <div className="cert-item-details">
                          <div className="detail-line">
                            <span className="detail-label">Lembaga LSP:</span>
                            <span className="detail-value">{cert.issuerName}</span>
                          </div>
                          <div className="detail-line">
                            <span className="detail-label">Standar Acuan:</span>
                            <span className="detail-value">{cert.skkniStandard}</span>
                          </div>
                          <div className="detail-line">
                            <span className="detail-label">Masa Berlaku:</span>
                            <span className="detail-value">
                              {cert.issuanceDate} - <strong>{cert.expiryDate}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="cert-card-btn-row">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setCertModalData(cert)}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">visibility</span>
                            Rincian Dokumen
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => downloadCertificate(cert)}
                          >
                            <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                            Unduh Bukti Sah
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

            </div>
          </section>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === 'profil' && (
          <section id="view-profil" className="tab-pane active" role="tabpanel">
            <div className="container section-spacer">
              
              <div className="section-header">
                <div className="section-tag">
                  <span className="material-symbols-outlined tag-icon" aria-hidden="true">person</span>
                  Pengaturan Data Asesi
                </div>
                <h1 className="section-heading">Profil Terverifikasi & Pengaturan Akun</h1>
                <p className="section-subheading">
                  Kelola data identitas kependudukan, riwayat pendidikan formal, portofolio bukti kerja, dan keamanan akses akun sertifikasi BNSP Anda.
                </p>
              </div>

              <div className="profile-layout-grid">
                <div className="profile-sidebar-card">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar-initial">RB</div>
                    <button
                      type="button"
                      className="avatar-edit-btn"
                      onClick={() => showToast('Silakan pilih berkas foto formal latar belakang merah/biru (Format JPG/PNG max 2MB).')}
                      title="Ubah foto identitas"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">photo_camera</span>
                    </button>
                  </div>

                  <h2 className="profile-user-fullname">{profile.nama}</h2>
                  <span className="profile-user-role font-mono">Asesi Ahli Madya</span>

                  <div className="profile-summary-badges">
                    <div className="summary-badge-item">
                      <span className="badge-num font-mono">{earnedActiveCount}</span>
                      <span className="badge-txt">Sertifikat Aktif</span>
                    </div>
                    <div className="summary-badge-item">
                      <span className="badge-num font-mono">8</span>
                      <span className="badge-txt">Unit SKKNI Diuji</span>
                    </div>
                  </div>

                  <div className="profile-meta-info-list">
                    <div className="prof-meta-line">
                      <span className="material-symbols-outlined" aria-hidden="true">badge</span>
                      <div>
                        <span className="meta-lbl">ID Asesi BNSP:</span>
                        <strong className="font-mono">{profile.noReg}</strong>
                      </div>
                    </div>
                    <div className="prof-meta-line">
                      <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                      <div>
                        <span className="meta-lbl">Email Akun:</span>
                        <span className="font-mono">{profile.email}</span>
                      </div>
                    </div>
                    <div className="prof-meta-line">
                      <span className="material-symbols-outlined" aria-hidden="true">call</span>
                      <div>
                        <span className="meta-lbl">Kontak WhatsApp:</span>
                        <span className="font-mono">{profile.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-main-card">
                  <div className="profile-tabs-nav" role="tablist">
                    {[
                      { key: 'identitas', label: 'Data Pribadi', icon: 'badge' },
                      { key: 'pendidikan', label: 'Pendidikan & Bukti APL-01', icon: 'school' },
                      { key: 'keamanan', label: 'Keamanan & Sandi', icon: 'lock' }
                    ].map(sub => (
                      <button
                        key={sub.key}
                        type="button"
                        role="tab"
                        className={`prof-tab-btn ${profileSubTab === sub.key ? 'active' : ''}`}
                        aria-selected={profileSubTab === sub.key}
                        onClick={() => setProfileSubTab(sub.key)}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">{sub.icon}</span>
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {profileSubTab === 'identitas' && (
                    <form
                      className="profile-form-pane active"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        setProfile(prev => ({
                          ...prev,
                          nama: form['prof-nama'].value.trim(),
                          nik: form['prof-nik'].value.trim(),
                          email: form['prof-email'].value.trim(),
                          phone: form['prof-phone'].value.trim(),
                          ttl: form['prof-ttl'].value.trim(),
                          gender: form['prof-gender'].value,
                          alamat: form['prof-alamat'].value.trim()
                        }));
                        showToast('Perubahan data diri berhasil disimpan ke database asesi.');
                      }}
                    >
                      <h3 className="form-section-title">Data Identitas Asesi Sesuai KTP / Paspor</h3>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="prof-nama" className="form-label">Nama Lengkap & Gelar (Sesuai Ijazah)</label>
                          <input type="text" id="prof-nama" name="prof-nama" className="form-input" defaultValue={profile.nama} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prof-nik" className="form-label">Nomor Induk Kependudukan (NIK)</label>
                          <input type="text" id="prof-nik" name="prof-nik" className="form-input font-mono" defaultValue={profile.nik} required />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="prof-email" className="form-label">Alamat Surat Elektronik (Email)</label>
                          <input type="email" id="prof-email" name="prof-email" className="form-input font-mono" defaultValue={profile.email} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prof-phone" className="form-label">Nomor Kontak WhatsApp / Telepon</label>
                          <input type="tel" id="prof-phone" name="prof-phone" className="form-input font-mono" defaultValue={profile.phone} required />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="prof-ttl" className="form-label">Tempat & Tanggal Lahir</label>
                          <input type="text" id="prof-ttl" name="prof-ttl" className="form-input" defaultValue={profile.ttl} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prof-gender" className="form-label">Jenis Kelamin</label>
                          <select id="prof-gender" name="prof-gender" className="form-input" defaultValue={profile.gender}>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="prof-alamat" className="form-label">Alamat Domisili Kependudukan</label>
                        <textarea id="prof-alamat" name="prof-alamat" className="form-input" rows="3" defaultValue={profile.alamat}></textarea>
                      </div>

                      <div className="form-action-row">
                        <button type="submit" className="btn btn-primary">
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">save</span>
                          Simpan Perubahan Identitas
                        </button>
                      </div>
                    </form>
                  )}

                  {profileSubTab === 'pendidikan' && (
                    <form
                      className="profile-form-pane active"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        setProfile(prev => ({
                          ...prev,
                          pendidikan: form['prof-pendidikan'].value,
                          kampus: form['prof-kampus'].value.trim(),
                          prodi: form['prof-prodi'].value.trim(),
                          pekerjaan: form['prof-pekerjaan'].value.trim()
                        }));
                        showToast('Data riwayat pendidikan & portofolio berhasil diperbarui.');
                      }}
                    >
                      <h3 className="form-section-title">Riwayat Pendidikan Formal & Instansi Asal</h3>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="prof-pendidikan" className="form-label">Pendidikan Terakhir</label>
                          <select id="prof-pendidikan" name="prof-pendidikan" className="form-input" defaultValue={profile.pendidikan}>
                            <option value="D3">Diploma 3 (D3)</option>
                            <option value="D4">Diploma 4 (D4)</option>
                            <option value="S1">Strata 1 (S1) / Sarjana</option>
                            <option value="S2">Strata 2 (S2) / Magister</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="prof-kampus" className="form-label">Nama Perguruan Tinggi / Sekolah</label>
                          <input type="text" id="prof-kampus" name="prof-kampus" className="form-input" defaultValue={profile.kampus} />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="prof-prodi" className="form-label">Program Studi / Jurusan</label>
                          <input type="text" id="prof-prodi" name="prof-prodi" className="form-input" defaultValue={profile.prodi} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="prof-pekerjaan" className="form-label">Instansi / Perusahaan Tempat Kerja Saat Ini</label>
                          <input type="text" id="prof-pekerjaan" name="prof-pekerjaan" className="form-input" defaultValue={profile.pekerjaan} />
                        </div>
                      </div>

                      <h3 className="form-section-title mt-4">Dokumen Bukti Portofolio (Persyaratan APL-01)</h3>

                      <div className="portfolio-docs-list">
                        <div className="port-doc-card">
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">description</span>
                          <div className="port-doc-info">
                            <strong>Ijazah-S1-Informatika-Legalisir.pdf</strong>
                            <span>Status: Terverifikasi Asesor LSP (Valid)</span>
                          </div>
                          <span className="status-badge badge-success">Terverifikasi</span>
                        </div>

                        <div className="port-doc-card">
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">description</span>
                          <div className="port-doc-info">
                            <strong>Surat-Keterangan-Pengalaman-Kerja-3Tahun.pdf</strong>
                            <span>Status: Memenuhi Syarat Portofolio Minimum</span>
                          </div>
                          <span className="status-badge badge-success">Terverifikasi</span>
                        </div>
                      </div>

                      <div className="form-action-row">
                        <button type="submit" className="btn btn-primary">
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">save</span>
                          Simpan Riwayat Pendidikan
                        </button>
                      </div>
                    </form>
                  )}

                  {profileSubTab === 'keamanan' && (
                    <form
                      className="profile-form-pane active"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const pNew = e.target['pass-new'].value;
                        const pConf = e.target['pass-confirm'].value;

                        if (pNew && pNew !== pConf) {
                          showToast('Konfirmasi kata sandi baru tidak cocok. Periksa kembali.');
                          return;
                        }

                        showToast('Pengaturan sandi & keamanan akun asesi berhasil diperbarui.');
                        e.target.reset();
                      }}
                    >
                      <h3 className="form-section-title">Pengaturan Sandi & Keamanan Masuk</h3>

                      <div className="form-group">
                        <label htmlFor="pass-current" className="form-label">Kata Sandi Saat Ini</label>
                        <input type="password" id="pass-current" name="pass-current" className="form-input font-mono" placeholder="Masukkan kata sandi lama..." />
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="pass-new" className="form-label">Kata Sandi Baru</label>
                          <input type="password" id="pass-new" name="pass-new" className="form-input font-mono" placeholder="Minimal 8 karakter..." />
                        </div>
                        <div className="form-group">
                          <label htmlFor="pass-confirm" className="form-label">Konfirmasi Kata Sandi Baru</label>
                          <input type="password" id="pass-confirm" name="pass-confirm" className="form-input font-mono" placeholder="Ulangi kata sandi baru..." />
                        </div>
                      </div>

                      <h3 className="form-section-title mt-4">Autentikasi Dua Langkah (2FA)</h3>

                      <div className="two-factor-box">
                        <div className="two-factor-info">
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">phonelink_lock</span>
                          <div>
                            <strong>Kode OTP via Aplikasi Authenticator / WhatsApp</strong>
                            <p className="text-xs text-muted">Meningkatkan keamanan akun saat asesi melakukan ujian online CBT atau unduh sertifikat.</p>
                          </div>
                        </div>
                        <label className="switch-toggle" aria-label="Toggle Autentikasi 2FA">
                          <input
                            type="checkbox"
                            checked={profile.twoFactor}
                            onChange={(e) => setProfile(prev => ({ ...prev, twoFactor: e.target.checked }))}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="form-action-row">
                        <button type="submit" className="btn btn-primary">
                          <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">security</span>
                          Perbarui Keamanan Akun
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </div>

            </div>
          </section>
        )}

      </main>

      <footer className="site-footer">
        <div className="container footer-container">
          <div className="footer-brand-col">
            <div className="brand-logo footer-logo">
              <div className="brand-badge-icon" aria-hidden="true">
                <span className="brand-logo-monogram">CS</span>
              </div>
              <div className="brand-text">
                <span className="brand-name">Certi<span className="brand-accent">Skill</span></span>
                <span className="brand-sub">PORTAL UJI KOMPETENSI RESMI</span>
              </div>
            </div>
            <p className="footer-desc">
              Portal layanan uji sertifikasi kompetensi digital terakreditasi Badan Nasional Sertifikasi Profesi (BNSP). Memastikan tenaga kerja terampil Indonesia diakui secara legal dan berdaya saing global.
            </p>
            <div className="footer-legal-badge">
              <span className="material-symbols-outlined" aria-hidden="true">gavel</span>
              <span>Terlisensi Resmi Berdasarkan Keputusan BNSP No: KEP.0418/BNSP/III/2024</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Navigasi Utama</h4>
            <ul className="footer-nav-list">
              <li><a href="#beranda" onClick={(e) => { e.preventDefault(); handleTabSwitch('beranda'); }}>Beranda Portal</a></li>
              <li><a href="#katalog" onClick={(e) => { e.preventDefault(); handleTabSwitch('katalog'); }}>Katalog Skema SKKNI</a></li>
              <li><a href="#jadwal" onClick={(e) => { e.preventDefault(); handleTabSwitch('jadwal'); }}>Jadwal Uji Kompetensi</a></li>
              <li><a href="#ujian" onClick={(e) => { e.preventDefault(); handleTabSwitch('ujian'); }}>Simulasi CBT Online</a></li>
              <li><a href="#sertifikasi" onClick={(e) => { e.preventDefault(); handleTabSwitch('sertifikasi'); }}>Cek Sertifikat Saya</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Layanan & Bantuan</h4>
            <ul className="footer-nav-list">
              <li><a href="#panduan" onClick={(e) => { e.preventDefault(); handleTabSwitch('jadwal'); }}>Panduan Pengisian APL-01</a></li>
              <li><a href="#tata-tertib" onClick={(e) => { e.preventDefault(); handleTabSwitch('ujian'); }}>Tata Tertib Ujian Proctor</a></li>
              <li><a href="#verifikasi" onClick={(e) => { e.preventDefault(); handleTabSwitch('beranda'); }}>Verifikasi Tanda Tangan Digital</a></li>
              <li><a href="#banding" onClick={(e) => { e.preventDefault(); showToast('Layanan pengajuan banding asesmen tersedia melalui sekretariat TUK.'); }}>Prosedur Banding Asesmen</a></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4 className="footer-heading">Sekretariat LSP CertiSkill</h4>
            <p className="footer-contact-item">
              <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
              Gedung Pusat Kompetensi Nasional Lt. 3, Jakarta Selatan
            </p>
            <p className="footer-contact-item">
              <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              layanan.asesi@certiskill.id
            </p>
            <p className="footer-contact-item">
              <span className="material-symbols-outlined" aria-hidden="true">call</span>
              +62 (21) 5296-4400
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p className="copyright-text">
              &copy; 2026 CertiSkill. Terlisensi Resmi Badan Nasional Sertifikasi Profesi (BNSP).
            </p>
            <div className="footer-bottom-badges">
              <span className="footer-pill font-mono">Standar ISO/IEC 17024</span>
              <span className="footer-pill font-mono">CBT AI Proctor Active</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {certModalData && (
        <div className="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="modal-cert-title">
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="modal-cert-title" className="modal-title">Dokumen Resmi Sertifikat Kompetensi BNSP</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCertModalData(null)}
                aria-label="Tutup jendela rincian sertifikat"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-primary-subtle)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-primary-border)'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>STATUS KOMPETENSI RESMI BNSP</strong>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{certModalData.statusText}</span>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: certModalData.status === 'valid' ? 'var(--color-success)' : 'var(--color-warning)',
                    color: '#fff'
                  }}>
                    {certModalData.id}
                  </span>
                </div>

                <table className="modal-cert-meta-table">
                  <tbody>
                    <tr>
                      <th scope="row">Nomor Registrasi BNSP</th>
                      <td className="font-mono">{certModalData.bnspRegNumber}</td>
                    </tr>
                    <tr>
                      <th scope="row">Nama Pemegang</th>
                      <td>{certModalData.recipientName}</td>
                    </tr>
                    <tr>
                      <th scope="row">Nomor NIK Kependudukan</th>
                      <td className="font-mono">{certModalData.recipientId}</td>
                    </tr>
                    <tr>
                      <th scope="row">Judul Kualifikasi Skema</th>
                      <td>{certModalData.programTitle}</td>
                    </tr>
                    <tr>
                      <th scope="row">Acuan Standar SKKNI</th>
                      <td>{certModalData.skkniStandard}</td>
                    </tr>
                    <tr>
                      <th scope="row">Lembaga Pelaksana (LSP)</th>
                      <td>{certModalData.issuerName}</td>
                    </tr>
                    <tr>
                      <th scope="row">Otoritas Akreditasi</th>
                      <td>{certModalData.issuerAccreditation}</td>
                    </tr>
                    <tr>
                      <th scope="row">Tanggal Diterbitkan</th>
                      <td>{certModalData.issuanceDate}</td>
                    </tr>
                    <tr>
                      <th scope="row">Masa Berlaku Kualifikasi</th>
                      <td><strong>{certModalData.expiryDate}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Daftar Unit Kompetensi Terakreditasi:
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {certModalData.competencies?.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>

                <div className="crypto-hash-box">
                  <div className="hash-header">
                    <span className="material-symbols-outlined" aria-hidden="true">enhanced_encryption</span>
                    <span>Sidik Jari Kriptografi Dokumen Elektronik (SHA-256)</span>
                  </div>
                  <div className="hash-code font-mono">{certModalData.sha256Hash}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setCertModalData(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => downloadCertificate(certModalData)}
              >
                <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">download</span>
                Unduh Lembar Bukti Sah
              </button>
            </div>
          </div>
        </div>
      )}

      {schemeDetailData && (
        <div className="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="modal-scheme-title">
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="modal-scheme-title" className="modal-title">Rincian Pelatihan & Unit Kompetensi SKKNI</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSchemeDetailData(null)}
                aria-label="Tutup jendela rincian skema"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={schemeDetailData.image}
                    alt={schemeDetailData.imageAlt}
                    className="training-detail-banner"
                    width="600"
                    height="300"
                    loading="eager"
                  />
                </div>

                <div style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-primary-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{schemeDetailData.code}</span>
                    <span className="font-mono text-xs text-muted" style={{
                      backgroundColor: 'var(--bg-surface)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-color-subtle)'
                    }}>Acuan Resmi BNSP</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.4 }}>
                    {schemeDetailData.trainingTitle || schemeDetailData.title}
                  </h3>
                  <span className="text-xs text-muted font-mono" style={{ display: 'block', marginTop: '0.35rem' }}>
                    Standar Acuan: {schemeDetailData.skkni}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Spesifikasi Program & Fasilitas Pelatihan:
                  </h4>
                  <div className="training-specs-grid">
                    <div className="training-spec-item">
                      <span className="spec-label">Komposisi Kurikulum</span>
                      <span className="spec-value">{schemeDetailData.theoryPractice || '30% Teori, 70% Praktik'}</span>
                    </div>
                    <div className="training-spec-item">
                      <span className="spec-label">Perangkat & Software Lab</span>
                      <span className="spec-value">{schemeDetailData.tools || 'Workstation Lab Standard'}</span>
                    </div>
                    <div className="training-spec-item">
                      <span className="spec-label">Fasilitas Tempat Uji (TUK)</span>
                      <span className="spec-value">{schemeDetailData.facility || 'Laboratorium TUK Terakreditasi'}</span>
                    </div>
                    <div className="training-spec-item">
                      <span className="spec-label">Metode Evaluasi Akhir</span>
                      <span className="spec-value">CBT Teori Online + Praktik Unjuk Kerja</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Daftar Unit Kompetensi SKKNI yang Diujikan:
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    {schemeDetailData.units?.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-surface-muted)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <strong>Passing Grade Kelulusan:</strong> Nilai minimal 80 untuk dinyatakan Kompeten (K).
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const cur = schemeDetailData;
                      setSchemeDetailData(null);
                      setRegisterModalData({ title: cur.title, code: cur.code });
                    }}
                  >
                    <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">how_to_reg</span>
                    Daftar Asesmen Skema Ini
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSchemeDetailData(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {registerModalData && (
        <div className="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="modal-reg-title">
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="modal-reg-title" className="modal-title">Formulir Pendaftaran Uji Asesmen</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRegisterModalData(null)}
                aria-label="Tutup jendela pendaftaran"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <form onSubmit={handleRegistrationSubmit}>
              <div className="modal-body">
                <p className="text-sm text-muted mb-3">
                  Silakan konfirmasi skema pilihan dan tentukan Tempat Uji Kompetensi (TUK) serta jadwal asesmen yang Anda inginkan.
                </p>

                <div className="form-group">
                  <label htmlFor="reg-scheme-display" className="form-label">Skema Sertifikasi Pilihan</label>
                  <input
                    type="text"
                    id="reg-scheme-display"
                    className="form-input font-bold"
                    value={`${registerModalData.code} - ${registerModalData.title}`}
                    readOnly
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="reg-tuk-select" className="form-label">Pilih Tempat Uji Kompetensi (TUK)</label>
                    <select id="reg-tuk-select" name="reg-tuk-select" className="form-input" required>
                      <option value="TUK Mandiri Kampus Cyber Jakarta">TUK Mandiri Kampus Cyber Jakarta (Jakarta Selatan)</option>
                      <option value="TUK Sewaktu Pusat Komputasi Bandung">TUK Sewaktu Pusat Komputasi Bandung (Coblong, Bandung)</option>
                      <option value="TUK Mandiri Kampus AI Surabaya">TUK Mandiri Kampus AI Surabaya (Surabaya Timur)</option>
                      <option value="TUK Virtual LSP CertiSkill (Online Proctored)">TUK Virtual LSP CertiSkill (Daring Jarak Jauh)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-date-select" className="form-label">Pilihan Jadwal Asesmen</label>
                    <select id="reg-date-select" name="reg-date-select" className="form-input" required>
                      <option value="28 Maret 2026 (08.30 WIB)">28 Maret 2026 (08.30 WIB) - Sisa Kuota 4</option>
                      <option value="04 April 2026 (09.00 WIB)">04 April 2026 (09.00 WIB) - Sisa Kuota 2</option>
                      <option value="11 April 2026 (08.30 WIB)">11 April 2026 (08.30 WIB) - Sisa Kuota 6</option>
                      <option value="18 April 2026 (13.00 WIB)">18 April 2026 (13.00 WIB) - Sesi Daring</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-notes" className="form-label">Catatan Tambahan / Portofolio Khusus (Opsional)</label>
                  <textarea
                    id="reg-notes"
                    name="reg-notes"
                    className="form-input"
                    rows="2"
                    placeholder="Tuliskan nomor registrasi sertifikat pendukung jika ada..."
                  ></textarea>
                </div>

                <div style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-primary-border)',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)'
                }}>
                  <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: '0.25rem' }}>
                    Pemberitahuan Kelengkapan:
                  </strong>
                  Setelah mendaftar, pastikan berkas <strong>APL-01</strong> dan <strong>APL-02</strong> telah diunduh dari tab Jadwal & Materi dan dibawa pada hari pelaksanaan asesmen.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setRegisterModalData(null)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">send</span>
                  Konfirmasi Pendaftaran Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {violationModalOpen && (
        <div className="modal-overlay violation-modal-overlay open" role="alertdialog" aria-modal="true">
          <div className="modal-card violation-card">
            <div className="violation-icon-large" aria-hidden="true">
              <span className="material-symbols-outlined">warning</span>
            </div>

            <h2 className="violation-title">PERINGATAN: PELANGGARAN TAB TERDETEKSI!</h2>
            
            <p className="violation-desc">
              Sistem proktor mendeteksi Anda telah beralih jendela browser, membuka tab lain, atau meninggalkan layar ujian aktif.
            </p>

            <div className="violation-strike-box">
              <span className="strike-title">STATUS PELANGGARAN ANDA SAAT INI:</span>
              <div className="strike-number-display text-danger">
                <span>{tabViolations}</span> / 3 KALI
              </div>
              <span className="strike-limit-note">
                Batas maksimal toleransi: <strong>3 Kali Pelanggaran</strong>.
              </span>
            </div>

            <div className="violation-consequence-alert">
              <span className="material-symbols-outlined" aria-hidden="true">gavel</span>
              <p>
                <strong>PERINGATAN TERAKHIR:</strong> Jika Anda melakukan pelanggaran <strong>ke-4</strong>, ujian akan langsung dihentikan otomatis dan Anda dinyatakan <strong>DISKUALIFIKASI DENGAN NILAI 0</strong>.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-danger btn-lg"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={() => {
                setViolationModalOpen(false);
                try {
                  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } catch (e) {}
              }}
            >
              Saya Mengerti & Kembali ke Layar Penuh Ujian
            </button>
          </div>
        </div>
      )}

      {confirmFinishModalOpen && (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Konfirmasi Pengumpulan Ujian</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setConfirmFinishModalOpen(false)}
                aria-label="Tutup jendela konfirmasi"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="modal-body">
              <p className="text-sm text-muted mb-3">
                Apakah Anda yakin ingin mengakhiri sesi ujian teori ini? Setelah dikumpulkan, seluruh lembar jawaban akan diproses langsung oleh sistem proktor CBT.
              </p>

              <div className="confirm-summary-stats">
                <div className="summary-stat-box">
                  <span className="stat-label">Soal Terjawab:</span>
                  <span className="stat-value text-primary font-mono font-bold">
                    {Object.keys(userAnswers).length} / {EXAM_QUESTIONS.length}
                  </span>
                </div>
                <div className="summary-stat-box">
                  <span className="stat-label">Ditandai Ragu-ragu:</span>
                  <span className="stat-value text-warning font-mono font-bold">
                    {Object.values(doubtfulQuestions).filter(Boolean).length}
                  </span>
                </div>
                <div className="summary-stat-box">
                  <span className="stat-label">Sisa Waktu:</span>
                  <span className="stat-value font-mono">
                    {formatTimer(timeRemaining)}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--color-primary-subtle)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-primary-border)',
                fontSize: '0.825rem',
                color: 'var(--text-muted)'
              }}>
                <strong>Ketentuan Passing Grade:</strong> Minimal nilai <strong>80 Poin</strong> (minimal 4 soal benar) untuk dinyatakan Lolos / Kompeten (K).
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setConfirmFinishModalOpen(false)}
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => finishExam(true)}
              >
                <span className="material-symbols-outlined btn-icon-start" aria-hidden="true">check</span>
                Ya, Kumpulkan Jawaban Saya
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="toast" className={`toast-notification ${toastVisible ? 'show' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}
