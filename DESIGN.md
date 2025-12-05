## 1. Problem Analizi ve Hedef

Bu tasarımın amacı, bir emlak ajansındaki satış / kiralama işlemlerinin:

- Yaşam döngüsünü (stages) izlenebilir hale getirmek,
- Toplam hizmet bedelini (service fee) ajans ve ajanlar arasında **otomatik ve hatasız** dağıtmak,
- Her bir işlem için **şeffaf bir finansal breakdown** sunmaktır.

Özellikle manuel süreçlerin (kapora, tapu, ödemeler) ve karmaşık komisyon kurallarının
zaman alıcı ve hataya açık olması problemi üzerine odaklandım.

---

## 2. Mimari Yaklaşım

### 2.1. Mimari

Uygulama, NestJS’in modüler yapısı kullanılarak iki ana domain modülüne ayrıldı:

- `TransactionsModule`
    - İşlem yaşam döngüsü (stages)
    - Komisyon hesaplama tetikleyicileri
    - Finansal breakdown’ın üretilmesi ve saklanması

- `AgentsModule`
    - Ajanların temel bilgilerinin (id, isim, soyisim) yönetimi

Ek olarak, ortak bileşenler `common/` altında toplanacaktır (DTO’lar, filtreler, pipe’lar vb.).

Bu ayrım, **transaction** domain’ini ajan yönetiminden bağımsızlaştırırken,
gelecekte daha karmaşık bir kullanıcı / auth sistemi eklenebilmesine zemin hazırlar.

### 2.2. Single-Agency Varsayımı

Bu case kapsamında, sistemin **tek bir ajans** için çalıştığını varsayıyorum.
Bu, veri modelini basitleştirip asıl odak olan:

- Transaction yaşam döngüsü
- Komisyon hesaplama kuralları

üzerine yoğunlaşmamı sağlıyor.

Gerçek hayatta çoklu ajans senaryosu için `agencyId` gibi alanlar eklenerek
multi-tenant yapıya evrilmek mümkündür.

---

## 3. Veri Modeli Tasarımı (MongoDB)

### 3.1. Transaction Dokümanı

- `_id`: ObjectId
- `stage`: enum
    - `agreement` | `earnest_money` | `title_deed` | `completed` | `canceled`
- `totalServiceFee`: number
- `currency`: string (ör. `"GBP"`)
- `listingAgentId`: ObjectId (referans veya string)
- `sellingAgentId`: ObjectId (referans veya string)
- `financialBreakdown`: embedded subdocument
    - `agencyAmount`: number
    - `agentShares`: array
        - `agentId`
        - `role`: `"listing_agent"` | `"selling_agent"`
        - `amount`: number
- `stageHistory`: array
    - `fromStage`: string
    - `toStage`: string
    - `changedAt`: Date

#### Neden embedded `financialBreakdown`?

- Her transaction, kendi finansal gerçekliğini içerir.
- “Bu işlemden kim, ne kadar kazandı?” sorusuna tek dokümanla cevap verebilmek önemli.
- Sorgulama maliyeti düşük oluyor (join / ekstra koleksiyon gerektirmiyor).

Alternatif olarak breakdown için ayrı bir koleksiyon düşünülebilirdi ancak:

- Ek collection, case kapsamında gereksiz karmaşıklık katacaktı.
- Okuma sıklığı transaction üzerinden olduğu için embedded model daha uygun.

### 3.2. Agent Dokümanı

Basit tutulmuştur:

- `_id`: ObjectId
- `firstName`: string
- `lastName`: string

Bu case için ajanın sadece kimlik ve isim bilgilerinin tutulması yeterlidir.
Kimlik doğrulama, rol yönetimi, ofis/branch bilgisi gibi detaylar scope dışında bırakılmıştır.

---
