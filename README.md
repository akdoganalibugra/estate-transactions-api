# Estate Transaction Backend

Bu proje, bir emlak ajansındaki **satış / kiralama işlemlerinin** yaşam döngüsünü ve
**komisyon dağılımını** yöneten NestJS + MongoDB Atlas tabanlı bir backend uygulamasıdır.

- İşlem aşamaları: `agreement`, `earnest_money`, `title_deed`, `completed`, `canceled` (Case dokümanındaki 4 aşamaya ek olarak, gerçek hayattaki iptal senaryolarını modellemek için `canceled` aşaması eklenmiştir.)
- Komisyon politikası:
    - %50 ajansa
    - %50 ajan(lar)a
    - Aynı kişi listing + selling ise: %50 → tek ajan
    - Farklı kişilerse: %25 + %25
- Amaç: Süreci otomatikleştirmek, izlenebilir yapmak ve finansal dağılımı şeffaf hale getirmek.

## 1. Tech Stack

- Node.js
- TypeScript
- NestJS
- MongoDB Atlas
- Mongoose
- Jest
- Swagger
- Docker

## 2. Proje Yapısı

```txt
src/
  modules/
    transactions/
      transactions.module.ts
      transactions.controller.ts
      transactions.service.ts
      dto/
      schemas/
    agents/
      agents.module.ts
      agents.controller.ts
      agents.service.ts
      dto/
      schemas/
  common/
    filters/
    pipes/
    interceptors/
    dto/
main.ts
```

> Not: Modül isimleri / klasör yapısı proje ilerledikçe küçük değişiklikler gösterebilir.

### 2.1. Mimari ve Veri Akış Diyagramları

Proje mimarisi, transaction state machine, entity ilişkileri, API endpoint'leri ve komisyon hesaplama akışlarını gösteren detaylı diyagramlar için [DESIGN.md](./DESIGN.md) dosyasının başındaki **"Proje Diyagramları"** bölümüne bakabilirsiniz.

Diyagramlar şunları içerir:

- **Proje Mimarisi**: NestJS katmanları, modüller, servisler
- **Transaction State Machine**: İşlem aşamaları ve geçişler
- **Entity Relationship Diagram**: MongoDB koleksiyonları ve ilişkileri
- **Komisyon Hesaplama Akışı**: Sequence diagram

## 3. Başlangıç Gereksinimleri

- Node.js LTS
- npm veya yarn
- MongoDB Atlas hesabı veya paylaşılan connection string
- (Opsiyonel) Docker

## 4. Ortam Değişkenleri

Bir `.env` dosyası oluşturun:

```bash
MONGODB_URI="mongodb+srv://dev-user:<db_password>@dev-projects.hd5ff8o.mongodb.net/?appName=dev-projects"
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
API_PREFIX=/api
```

> Not: Case gereği MongoDB Atlas connection string örnek olarak paylaşılmıştır.

## 5. Kurulum

```bash
npm install
# veya
yarn install
```

## 6. Uygulamayı Çalıştırma

### 6.1. Lokal Geliştirme

```bash
npm run start:dev
```

Varsayılan olarak: `http://localhost:3000`

Swagger dokümantasyonu:

- `http://localhost:3000/api-docs`

#### Swagger API Dokümantasyonu

Proje, @nestjs/swagger ile kapsamlı API dokümantasyonuna sahiptir:

- **Detaylı Alan Açıklamaları:** Her DTO alanı için Türkçe açıklamalar
- **Örnek Değerler:** Gerçekçi örnek request/response body'leri
- **Enum Dokümantasyonu:** Transaction stage'leri ve geçişleri için detaylı açıklamalar
- **Filtre Parametreleri:** Query parametreleri için açıklamalar ve örnekler
- **Pagination:** Sayfalama parametreleri ve default değerleri
- **Validation Kuralları:** Min/max değerler, zorunlu alanlar otomatik görünür

Özellikler:

- `totalServiceFee`: Komisyon dahil toplam bedel (örn: 50000)
- `currency`: Para birimi (şu an statik)
- `stage`: Transaction aşamaları (agreement → earnest_money → title_deed → completed)
- `agentId`: MongoDB ObjectId formatında ajan referansları
- `fromDate/toDate`: ISO 8601 formatında tarih filtreleri

### 6.2. Testleri Çalıştırma

```bash
npm run test
npm run test:watch
npm run test:cov
```

Testler özellikle:

- Komisyon hesaplama kuralları
- Transaction stage geçişleri
- Temel business logic

üzerine odaklanır.

## 7. Docker ile Çalıştırma (Opsiyonel)

### 7.1. Docker Compose ile (Önerilen)

```bash
# Container'ı başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f

# Container'ı durdur
docker-compose down
```

### 7.2. Manuel Docker Build

```bash
# Image build et
docker build -t estate-transactions-api:latest .

# Container çalıştır
docker run -p 3000:3000 --env-file .env estate-transactions-api:latest
```

Container başarıyla çalıştığında:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/api/health`

## 8. Deployment

Proje **Railway** platformuna deploy edilmiştir.

### 8.1. Live URLs

- **Live API URL:** `https://estate-transactions-api-production.up.railway.app`
- **Swagger Docs:** `https://estate-transactions-api-production.up.railway.app/api-docs`
- **Health Check:** `https://estate-transactions-api-production.up.railway.app/api/health`

### 8.2. Deployment Detayları

- **Platform:** Railway (https://railway.app)
- **Database:** MongoDB Atlas
- **Build:** Multi-stage Dockerfile
- **Environment:** Production
- **Auto-Deploy:** GitHub main branch push ile otomatik deploy

## 9. Önemli Endpointler (Özet)

- `GET /health` – servis ayakta mı?
- `POST /transactions` – yeni işlem oluştur
- `GET /transactions` – filtrelenebilir işlem listesi
- `GET /transactions/:id` – tek işlem detayı + finansal breakdown
- `PATCH /transactions/:id/stage` – işlem aşaması güncelle
- `PATCH /transactions/:id/fast-complete` – işlemi doğrudan tamamla (aradaki aşamaları atla)
- `PATCH /transactions/:id/cancel` – işlemi iptal et
- `POST /agents` – ajan oluştur (sade model)
- `GET /agents` – ajan listesini getir

Detaylı açıklamalar için Swagger/OpenAPI dokümantasyonuna bakabilirsiniz.
