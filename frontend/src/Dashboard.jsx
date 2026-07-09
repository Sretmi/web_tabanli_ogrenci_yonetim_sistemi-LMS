import React, { useEffect, useState } from "react";
import { 
  getStudentCourses, 
  getCourseAssignments, 
  uploadHomework,
  getTeacherCourses,
  getCourseMaterials,
  uploadMaterial,
  createAssignment,
  getCourseSubmissions,
  giveGrade,
  createAnnouncement, 
  getAnnouncements
} from "./api";

function Dashboard({ user }) {
  // --- Genel State'ler ---
  const [dersler, setDersler] = useState([]);
  const [seciliDers, setSeciliDers] = useState(null);
  const [odevler, setOdevler] = useState([]);
  const [yuklenenDosya, setYuklenenDosya] = useState(null);
  const [duyurular, setDuyurular] = useState([]); 
// deneme
  // --- Hoca State'leri ---
  const [materyaller, setMateryaller] = useState([]);
  const [teslimler, setTeslimler] = useState([]);
  const [yeniOdev, setYeniOdev] = useState({ baslik: "", aciklama: "", tarih: "" });
  const [materyalDosya, setMateryalDosya] = useState(null);
  const [materyalBaslik, setMateryalBaslik] = useState("");
  const [duyuruBaslik, setDuyuruBaslik] = useState(""); 
  const [duyuruIcerik, setDuyuruIcerik] = useState(""); 

  // Not: Admin state'lerini sildik çünkü artık harici panel kullanıyoruz.

  if (!user || !user.RolAdi) {
    return <div className="p-5 text-center">Oturum açılıyor, lütfen bekleyin...</div>;
  }

  const isTeacher = user.RolAdi === "Hoca" || user.RolAdi === "Instructor";
  const isAdmin = user.RolAdi === "Yonetici" || user.RolAdi === "Admin";

  // --- 🔹 VERİ ÇEKME MANTIĞI ---
  useEffect(() => {
    if (!user.KullaniciID) return;

    if (isAdmin) {
      // Admin için veri çekmeye gerek yok, harici panele gidecek.
      return;
    } else if (isTeacher) {
      getTeacherCourses(user.KullaniciID).then(res => setDersler(res.data || []));
    } else {
      getStudentCourses(user.KullaniciID).then(res => setDersler(res.data || []));
      getAnnouncements(user.KullaniciID).then(res => setDuyurular(res.data || []));
    }
  }, [user, isTeacher, isAdmin]);

  // --- Seçili Ders Değişince Çalışır ---
  useEffect(() => {
    if (!seciliDers || isAdmin) return;
    const dersId = seciliDers.DersID || seciliDers.id;

    if (isTeacher) {
      getCourseMaterials(dersId).then(res => setMateryaller(res.data || []));
      getCourseSubmissions(dersId).then(res => setTeslimler(res.data || []));
    } else {
      getCourseAssignments(dersId, user.KullaniciID).then(res => setOdevler(res.data || []));
      getCourseMaterials(dersId).then(res => setMateryaller(res.data || []));
    }
  }, [seciliDers, isTeacher, isAdmin, user.KullaniciID]);

  // --- AKSİYONLAR ---
  const dosyaYukle = async (odevId) => {
    if (!yuklenenDosya) return alert("Lütfen bir dosya seçin!");
    const formData = new FormData();
    formData.append("odev_id", odevId);
    formData.append("ogrenci_id", user.KullaniciID);
    formData.append("file", yuklenenDosya);
    try {
      await uploadHomework(formData);
      alert("Ödev gönderildi!");
      setYuklenenDosya(null);
      getCourseAssignments(seciliDers.DersID, user.KullaniciID).then(res => setOdevler(res.data));
    } catch (err) { alert("Yükleme hatası!"); }
  };
    
  const materyalYukleHoca = async () => {
    if (!materyalDosya || !materyalBaslik) return alert("Başlık ve dosya seçin!");
    const fd = new FormData();
    fd.append("ders_id", seciliDers.DersID);
    fd.append("baslik", materyalBaslik);
    fd.append("file", materyalDosya);
    try {
      await uploadMaterial(fd);
      alert("Materyal yüklendi!");
      setMateryalBaslik(""); 
      setMateryalDosya(null);
      getCourseMaterials(seciliDers.DersID).then(res => setMateryaller(res.data || []));
    } catch (err) { alert("Materyal hatası!"); }
  };

  const odevEkleHoca = async () => {
    if(!yeniOdev.baslik || !yeniOdev.tarih) return alert("Başlık ve tarih zorunludur!");
    try {
      await createAssignment(seciliDers.DersID, yeniOdev.baslik, yeniOdev.aciklama, yeniOdev.tarih);
      alert("Ödev başarıyla yayınlandı!");
      setYeniOdev({ baslik: "", aciklama: "", tarih: "" });
    } catch (err) { alert("Ödev ekleme hatası!"); }
  };

  const duyuruYayinla = async () => {
    if (!duyuruBaslik || !duyuruIcerik) return alert("Duyuru başlığı ve içeriği zorunludur!");
    try {
      await createAnnouncement(seciliDers.DersID, user.KullaniciID, duyuruBaslik, duyuruIcerik);
      alert("Duyuru başarıyla yayınlandı!");
      setDuyuruBaslik("");
      setDuyuruIcerik("");
    } catch (err) {
      console.error("Duyuru hatası:", err);
      alert("Duyuru yayınlanamadı.");
    }
  };
  
  const notVerHoca = async (teslimId, puan) => {
    if(puan === "") return alert("Puan giriniz!");
    try {
      await giveGrade(teslimId, puan);
      alert("Not kaydedildi!");
      getCourseSubmissions(seciliDers.DersID).then(res => setTeslimler(res.data));
    } catch (err) { alert("Not verme hatası!"); }
  };

  // ======================
  //  🔴 1. GÖRÜNÜM: ADMIN PANELİ (Tamamen Yenilendi)
  // ======================
  if (isAdmin) {
    return (
      <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="card shadow-lg p-5 text-center border-0" style={{maxWidth: '600px', backgroundColor: '#f8f9fa'}}>
            <div className="mb-4">
                <span style={{fontSize: '5rem'}}>🛡️</span>
            </div>
            <h2 className="fw-bold text-dark mb-3">Tam Yetkili Yönetim Paneli</h2>
            <p className="text-muted mb-4 lead" style={{fontSize: '1.1rem'}}>
                Sayın <strong>{user.Ad} {user.Soyad}</strong>,<br/>
                Veritabanı üzerinde tam yetkili işlem yapmak (Ekleme, Silme, Güncelleme) için güvenli panele geçiş yapınız.
            </p>
            
            <a href="http://127.0.0.1:8000/admin" target="_blank" rel="noreferrer" className="btn btn-dark btn-lg w-100 py-3 fw-bold shadow-sm hover-effect">
                🚀 Yönetim Paneline Git
            </a>
            
            <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                    Bu panelde yapılan değişiklikler anında LMS sistemine yansır.
                </small>
            </div>
        </div>
      </div>
    );
  }

  // ======================
  //  🔵 2. GÖRÜNÜM: ANA SAYFA (Ders Listesi)
  // ======================
  if (!seciliDers) {
    return (
      <div className="container mt-4">
        {/* DUYURU PANOSU - Öğrenciler için */}
        {!isTeacher && duyurular.length > 0 && (
          <div className="col-12 mb-4">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-header bg-warning text-dark fw-bold">🔔 Duyuru Panosu</div>
              <div className="card-body" style={{maxHeight: '200px', overflowY: 'auto'}}>
                {duyurular.map((d, i) => (
                  <div key={i} className="border-bottom mb-2 pb-2">
                    <h6 className="mb-0 fw-bold text-primary">{d.Baslik} <small className="text-muted">({d.DersAdi})</small></h6>
                    <p className="small mb-1">{d.Icerik}</p>
                    <small className="text-muted" style={{fontSize: '10px'}}>{new Date(d.Tarih).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <h3 className="mb-4 fw-bold">{isTeacher ? "👨‍🏫 Verdiğim Dersler" : "🎓 Derslerim"}</h3>
        <div className="row">
          {dersler.length === 0 ? <div className="alert alert-info text-center">Henüz kayıtlı ders bulunamadı.</div> :
            dersler.map((ders, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index} onClick={() => setSeciliDers(ders)}>
                <div className="card h-100 shadow-sm border-0 bg-light" style={{ cursor: "pointer", transition: "0.3s" }}>
                  <div className="card-body" style={{ borderLeft: `8px solid ${index % 2 === 0 ? "#0d6efd" : "#6f42c1"}` }}>
                    <h5 className="fw-bold">{ders.DersKodu}</h5>
                    <p className="card-text text-uppercase">{ders.DersAdi}</p>
                    {!isTeacher && <small className="text-muted">Hoca: {ders.HocaAdi}</small>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  // ======================
  //  🟣 3. GÖRÜNÜM: HOCA DETAY
  // ======================
  if (isTeacher) {
    return (
      <div className="container mt-4">
        <button className="btn btn-outline-secondary mb-3 shadow-sm" onClick={() => setSeciliDers(null)}>← Geri Dön</button>
        <h2 className="mb-4">{seciliDers.DersAdi}</h2>
        <div className="row">
          <div className="col-lg-5">
            {/* 📣 DUYURU YAYINLAMA PANELİ */}
            <div className="card p-3 mb-4 shadow-sm border-warning">
              <h5 className="text-warning fw-bold border-bottom pb-2">📣 Ders Duyurusu Yayınla</h5>
              <input type="text" className="form-control mb-2 mt-2" placeholder="Duyuru Başlığı" value={duyuruBaslik} onChange={e => setDuyuruBaslik(e.target.value)} />
              <textarea className="form-control mb-2" placeholder="Duyuru İçeriği..." rows="3" value={duyuruIcerik} onChange={e => setDuyuruIcerik(e.target.value)} />
              <button className="btn btn-warning w-100 fw-bold" onClick={duyuruYayinla}>Duyuruyu Paylaş</button>
            </div>

            <div className="card p-3 mb-4 shadow-sm border-0">
              <h5 className="text-primary fw-bold border-bottom pb-2">📂 Materyal Yönetimi</h5>
              <input type="text" className="form-control mb-2 mt-2" placeholder="Materyal Başlığı" value={materyalBaslik} onChange={e => setMateryalBaslik(e.target.value)} />
              <input type="file" className="form-control mb-2" onChange={e => setMateryalDosya(e.target.files[0])} />
              <button className="btn btn-primary w-100" onClick={materyalYukleHoca}>Sisteme Yükle</button>
              <div className="mt-3">
                <small className="fw-bold">Yüklü Dosyalar:</small>
                <div className="list-group mt-1">
                  {materyaller.map((m, i) => <li key={i} className="list-group-item list-group-item-action py-1 small">{m.Baslik}</li>)}
                </div>
              </div>
            </div>

            <div className="card p-3 mb-4 shadow-sm border-0 bg-light">
              <h5 className="text-danger fw-bold border-bottom pb-2">📅 Yeni Ödev Ver</h5>
              <input type="text" className="form-control mb-2 mt-2" placeholder="Ödev Başlığı" value={yeniOdev.baslik} onChange={e => setYeniOdev({...yeniOdev, baslik: e.target.value})} />
              <textarea className="form-control mb-2" placeholder="Açıklama" rows="3" value={yeniOdev.aciklama} onChange={e => setYeniOdev({...yeniOdev, aciklama: e.target.value})} />
              <input type="datetime-local" className="form-control mb-2" value={yeniOdev.tarih} onChange={e => setYeniOdev({...yeniOdev, tarih: e.target.value})} />
              <button className="btn btn-danger w-100" onClick={odevEkleHoca}>Ödevi Duyur</button>
            </div>
          </div>
          
          <div className="col-lg-7">
            <div className="card p-3 shadow-sm border-0">
              <h5 className="text-success fw-bold border-bottom pb-2">📥 Gelen Ödev Teslimleri</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mt-2">
                  <thead className="table-light"><tr><th>Öğrenci</th><th>Ödev</th><th>Dosya</th><th>Puan</th><th>İşlem</th></tr></thead>
                  <tbody>
                    {teslimler.map((t, i) => (
                      <tr key={i}>
                        <td className="small">{t.Ad} {t.Soyad}</td>
                        <td className="small fw-bold">{t.Baslik}</td>
                        <td><a href={`http://127.0.0.1:8000/yuklenen_odevler/${t.DosyaYolu}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-link">İndir</a></td>
                        <td><input type="number" className="form-control form-control-sm" style={{width: '60px'}} defaultValue={t.Puan} id={`puan-${t.TeslimID}`} /></td>
                        <td><button className="btn btn-sm btn-success" onClick={() => notVerHoca(t.TeslimID, document.getElementById(`puan-${t.TeslimID}`).value)}>Kaydet</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================
  //  🟢 4. GÖRÜNÜM: ÖĞRENCİ DETAY
  // ======================
  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3 shadow-sm" onClick={() => setSeciliDers(null)}>← Ders Listesi</button>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white p-3">
          <h4 className="mb-0">{seciliDers.DersAdi} ({seciliDers.DersKodu})</h4>
        </div>
        <div className="card-body">
          
          {/* 📚 DERS MATERYALLERİ BÖLÜMÜ */}
          <h5 className="fw-bold mb-3 text-primary">📚 Ders Materyalleri</h5>
          <div className="list-group mb-4 shadow-sm">
            {materyaller.length === 0 ? (
              <div className="list-group-item list-group-item-light text-muted small">
                Bu ders için henüz bir materyal (slayt, PDF vb.) yüklenmemiş.
              </div>
            ) : (
              materyaller.map((m, i) => (
                <a 
                  key={i} 
                  href={`http://127.0.0.1:8000/ders_materyalleri/${m.DosyaYolu}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <span className="fw-medium">📄 {m.Baslik}</span>
                  <span className="badge bg-primary rounded-pill">Görüntüle / İndir</span>
                </a>
              ))
            )}
          </div>
          <hr className="my-4" />

          {/* 📝 ÖDEVLER BÖLÜMÜ */}
          <h5 className="mb-3 fw-bold">📝 Aktif Ödevleriniz</h5>
          {odevler.length === 0 ? <p className="text-muted small">Bu ders için henüz ödev atanmamış.</p> :
            odevler.map((odev) => (
              <div key={odev.OdevID} className="card mb-3 border-light shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-1">{odev.Baslik}</h6>
                      <p className="small text-secondary mb-2">{odev.Aciklama}</p>
                      <div className="text-danger small fw-bold">📅 Son Teslim: {odev.SonTeslimTarihi}</div>
                    </div>
                    {odev.Puan !== null && <div className="badge bg-success fs-6 p-2">NOT: {odev.Puan}</div>}
                  </div>
                  <div className="mt-3 pt-3 border-top">
                    {odev.DosyaYolu ? <span className="badge bg-light text-success mb-2 p-2 border border-success">✓ Ödeviniz Sisteme Kayıtlı</span> : <span className="badge bg-light text-danger mb-2 p-2 border border-danger">⚠ Henüz Teslim Edilmedi</span>}
                    <div className="input-group mt-1">
                      <input type="file" className="form-control" onChange={(e) => setYuklenenDosya(e.target.files[0])} />
                      <button className="btn btn-primary" onClick={() => dosyaYukle(odev.OdevID)}>Dosya Yükle</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default Dashboard;