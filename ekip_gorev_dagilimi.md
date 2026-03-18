# Roseware: Yapay Zeka Destekli All-in-One Klinik Asistan Projesi

Bu belge, mevcut (YOLO + Gemini tabanlı) radyoloji raporlama ve teşhis projesini **tam otonom bir "Doktor Masaüstü" (HBYS/PACS Entegrasyonlu)** sistemine dönüştürmek için 5 kişilik bir ekibin sorumluluklarını ve projenin teknik eksiklerini detaylandırmaktadır.

## Temel Eksikler ve Geliştirme İhtiyaçları

1. **Genişletilmiş Veri ve Model Kapsamı:** YOLO şu an diz, dirsek vb. temel sınıfları tanıyor. Ancak tam bir teşhis için *tüm vücut MR/Röntgen/BT* görüntülerini (kırıklar, tümörler, lezyonlar) ve çoklu etiketli kan tahlili anomali tespitini kapsayacak şekilde derin öğrenme modellerinin eğitilmesi/büyütülmesi şart.
2. **DICOM / PACS Entegrasyonu:** Tıbbi görüntüler şu anda standart formatlarda (`.jpg`, `.png`, `UploadFile`) alınıyor. Hastanedeki gerçek `DICOM` ağına (`Orthanc`, `dcmtk` vb.) bağlanarak verilerin doğrudan cihazlardan çekilmesi lazım.
3. **HL7 / FHIR Standartlarına Uyum:** Kan tahlilleri, eczane bilgileri ve e-Nabız entegrasyonu için küresel klinik veri değişim standardı olan HL7 ve modern versiyonu FHIR (Fast Healthcare Interoperability Resources) altyapısının backend'e (FastAPI) eklenmesi gerekiyor.
4. **Gerçek Zamanlı UI (Front-End) Revizyonu:** Ön yüz (React+Vite) şu an basit dosya yükleme (`react-dropzone`) seviyesindedir. Doktorun *tek ekran* (Kuyruk, 360 Hasta Profili, DICOM Görüntüleyici, AI Rapor Paneli) deneyimini sağlayan, karmaşık Dashboard UI/UX mimarisinin kurulması esastır.
5. **Güvenlik (KVKK/HIPAA):** Supabase (PostgreSQL) üzerinden `Row Level Security (RLS)` politikalarının güçlendirilmesi, JWT token'larının rotasyonu, kullanıcı (Doktor/Asistan) yetki matrisinin (Role-Based Access Control) netleştirilmesi gerekli.

---

## 5 Kişilik Ekip İçin Aşama ve Sorumluluk Dağılımı (Teknik Plan)

### 1️⃣ Yapay Zeka ve Görüntü İşleme Uzmanı (AI/Computer Vision Engineer)
**Görev:** "Gözler ve Beyin" - Mevcut YOLO altyapısını geliştirmek ve DICOM verilerini işlenebilir hale getirmek.
*   **Kullanılacak Teknolojiler:** Python, PyTorch/Ultralytics (YOLOv8/v11), ONNX (optimizasyon), `pydicom` / `dcm2niix`, OpenCV.
*   **İş Paketi:**
    *   Hastanenin DICOM PACS sunucusundan (örn. Orthanc) gelen `.dcm` dosyalarını Python ile okuyup modele besleyecek bir pipeline (`pydicom`) kurmak.
    *   Sadece kırık/çıkık değil, MR ve BT taramaları için (tumor segmentation vb.) yeni modeller eğitmek veya HuggingFace medikal modellerini (MONAI altyapısı) projeye adapte etmek.
    *   YOLO'nun tahmin sonuçlarını (bounding box'ları) orijinal görüntü üzerine çizdirip frontend'e maskelenmiş (marked) olarak dönmek.

### 2️⃣ NLP ve LLM Entegrasyon Uzmanı (Prompt & Data Engineer)
**Görev:** "Dil ve Karar Destek" - Gemini AI (Reporting) kısmını tıbbi terminolojide kusursuz ve halüsinasyonsuz hale getirmek.
*   **Kullanılacak Teknolojiler:** Python (FastAPI), LangChain / LlamaIndex, Google GenAI / OpenAI GPT-4o, Vector DB (FAISS veya Supabase pgvector - RAG için).
*   **İş Paketi:**
    *   Gemini'nin yazdığı epikriz (sonuç) raporunu `%100 güvenilir` yapmak için bir *RAG (Retrieval-Augmented Generation)* sistemi kurmak. Hastanenin eski doğrulanmış raporlarını Supabase (veya Pinecone) üzerinde vektör tabanlı saklayarak LLM'e referans vermek.
    *   ICD-10 (Uluslararası Hastalık Sınıflandırması) kodlarının rapor içinden çıkarılıp faturalandırma modülüne (JSON formatında) iletilmesini sağlamak.
    *   LLM'in verdiği ilaç tavsiyelerinin *ilaç etkileşim veri tabanları* (örn. RxNorm) ile "Çakışma var mı?" kontrolünü yapacak bir logic yazmak.

### 3️⃣ Backend Mimarı ve Veri Mühendisi (Backend & Cloud Architect)
**Görev:** "Omurga ve Haberleşme" - Sistemi hastanenin beyni haline getirmek (HL7/FHIR ve Mikroservisler).
*   **Kullanılacak Teknolojiler:** Python (FastAPI), Supabase (PostgreSQL), Docker, Celery/Redis, `hl7` / `fhir-resources` kütüphaneleri.
*   **İş Paketi:**
    *   `main.py`'ın monolitik yapısını ölçeklenebilir mikroservislere bölmek (Auth Service, AI Inference Service, PACS Service, HL7 Gateway).
    *   Hastane bilgi sisteminden (HBYS) gelen *Kan/İdrar/Alerji* vb. kayıtların FHIR (Fast Healthcare Interoperability Resources) JSON formatında alınıp veritabanına işlenmesi (`API` yazılması).
    *   Yapay zeka (YOLO/Gemini) tahminlerinin uzun sürmesi ihtimaline karşı request/response döngüsünü **Asenkron Message Queue (Celery & Redis)** kullanarak kuyruğa almak.

### 4️⃣ Gelişmiş Frontend Geliştiricisi (Lead Frontend/UI Developer)
**Görev:** "Doktor Ekranı" - Başka hiçbir sekmeye ihtiyaç bıraktırmayan *All-in-One* Dashboard.
*   **Kullanılacak Teknolojiler:** React/Vite (Mevcut), TailwindCSS, TypeScript (Kesinlikle geçilmeli), Zustand/Redux (State Management), `cornerstone.js` veya `OHIF Viewer`.
*   **İş Paketi:**
    *   Javascript'ten (`.js`) sıkı tipli **TypeScript (`.tsx`)** yapısına geçiş.
    *   Tıbbi görüntüleri (DICOM) tarayıcıda profesyonelce göstermek (Yakınlaştırma, kontrast ayarı Window/Level) için **Cornerstone.js / OHIF Viewer** açık kaynak kütüphanesini React uygulamasının orta paneline gömmek (Sıradan bir `<img>` etiketi yetmez).
    *   Sol Panel (Gerçek zamanlı websocket/Socket.io ile akan Hasta Trijaj Kuyruğu), Orta Panel (PACS ve Tahlil) ve Sağ Panel (LLM'den akan stream rapor) iletişimini sağlamak.

### 5️⃣ DevOps, QA ve Güvenlik Uzmanı (DevSecOps)
**Görev:** "Kalkan ve Makine Dairesi" - Projenin canlıya çıkabilir, test edilebilir ve güvenli (KVKK/HIPAA) olmasını sağlamak.
*   **Kullanılacak Teknolojiler:** Docker / Docker Compose, GitHub Actions (CI/CD), AWS / Google Cloud (HIPAA Compliant Services), PyTest / Cypress.
*   **İş Paketi:**
    *   Mevcut `docker-compose.yml` dosyasını geliştirerek Database (Supabase lokal), Redis, Backend ve Frontend'i tek tıkla ayağa kaldırmak.
    *   Görüntü ve raporların veritabanında (Supabase Storage) "At Rest" şifrelenmesini (Encryption) sağlamak (KVKK kuralları gereği).
    *   Tıbbi hataların sıfıra inmesi için Backend API'lerine (`PyTest`) ve Frontend Doktor akışlarına (`Cypress` veya `Playwright`) %80+ kapsama alanına sahip *Otomatik Testler* (E2E) yazmak.

---

## Özet Akış

1.  **Hasta kayıt (HBYS)** olur -> **1. Kişi (CV)** ve **3. Kişi (Backend)** hastanın verilerini (HL7/DICOM) sisteme otomatik çeker.
2.  **Yapay Zeka (YOLO)** görüntüyü işler -> **2. Kişi (NLP)** bu bulguları ve tahlilleri HL7 formatından okuyup RAG/Gemini ile harmanlar.
3.  **Doktor Ekranı (Frontend)** -> **4. Kişi (Frontend)** bu sonuçları akıcı ve interaktif bir DICOM görüntüleyici + Chat/Epikriz paneliyle doktora sunar.
4.  **Sistem Ayakta Kalır** -> **5. Kişi (DevOps)** tüm bu trafiği güvenli, şifreli ve kesintisiz (Docker/CI/CD) bir şekilde bulutta yönetir.

---

## 📅 Bu Haftanın (İlk Sprint) Net Görev Dağılımı ve Hedefleri

Hedef: Temel prototip altyapısının kurulması ve ilk uçtan uca temel iletişimin (Görüntü -> Backend -> UI) sağlanması. Lütfen herkes bu hafta **sadece bu özellikteki hedefine** odaklansın.

*   **1. Kişi (Yapay Zeka ve Görüntü İşleme Uzmanı):** DICOM Okuma Pipeline'ı
    *   **Bu Hafta Bitirilecek Görev:** `pydicom` kütüphanesi kullanılarak `.dcm` formatındaki tıbbi görüntüleri okuyan, piksel verisini çıkaran ve modelin kullanabileceği düz formata çeviren temel Python script'ini tamamlamak.

*   **2. Kişi (NLP ve LLM Entegrasyon Uzmanı):** Yapısal Çıktı ve Gemini Prompting
    *   **Bu Hafta Bitirilecek Görev:** Gemini API'sine giden prompt'u iyileştirerek, model çıktısının her zaman standartlaştırılmış bir `JSON` formatında gelmesini sağlayan backend logic'ini kurmak (halüsinasyonları engelleyecek kesin sistem yönergeleri yazmak).

*   **3. Kişi (Backend Mimarı ve Veri Mühendisi):** Asenkron Kuyruk (Celery + Redis)
    *   **Bu Hafta Bitirilecek Görev:** Ağır AI çıkarım işlemlerinin ana API'yi dondurmaması için Celery ve Redis altyapısını kurmak. Dosya yüklendiğinde işlemin arka plana atılıp frontend'e anında "İşleniyor..." dönmesini sağlayan asenkron yapıyı bitirmek.

*   **4. Kişi (Gelişmiş Frontend Geliştiricisi):** DICOM Görüntüleyici Entegrasyonu (Cornerstone.js)
    *   **Bu Hafta Bitirilecek Görev:** React projesine `Cornerstone.js` (veya denk bir kütüphane) kurmak ve ekrana statik, lokal bir `.dcm` (DICOM) dosyasını successfully basan bir "Görüntüleyici (Viewer) Komponenti" geliştirmek (zoom/pan yapılabilen haliyle).

*   **5. Kişi (DevOps, QA ve Güvenlik Uzmanı):** Tek Tıkla Lokal Kurulum (Docker Compose)
    *   **Bu Hafta Bitirilecek Görev:** Frontend (React), Backend (FastAPI), Worker (Node/Python Celery) ve Veritabanı (Redis + DB) servislerinin birbirleriyle aynı ağ içinde kesintisiz haberleştiği `docker-compose.yml` dosyasını tamamlamak (`docker-compose up` ile tüm projenin ayağa kalktığını doğrulamak).

