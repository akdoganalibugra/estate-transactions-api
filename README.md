# Estate Transaction Backend (Technical Case)

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
    utils/
main.ts
```

> Not: Modül isimleri / klasör yapısı proje ilerledikçe küçük değişiklikler gösterebilir.

## 3. Başlangıç Gereksinimleri

- Node.js LTS
- npm veya yarn
- MongoDB Atlas hesabı ve connection string
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
