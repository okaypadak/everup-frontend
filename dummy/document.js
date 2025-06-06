export const docsData = [
  {
    id: 1,
    projectId: 'proj1',
    parentId: null,
    title: 'API Tasarım Prensipleri',
    desc: 'REST ve endpointler',
    content: `
      <h2>Giriş</h2>
      <p>
        Bu dokümanda modern web projelerinde API tasarımının en iyi uygulamaları ve temel prensipleri ele alınacaktır.
        İyi tasarlanmış bir API, sürdürülebilirlik, ölçeklenebilirlik ve geliştirici deneyimi açısından kritiktir.
      </p>
      <h3>1. Endpoint İsimlendirme</h3>
      <ul>
        <li>Tüm endpointler <b>anlamlı</b> ve <b>standart</b> olmalı (<code>/users</code>, <code>/orders</code>).</li>
        <li>Kaynaktaki isimler <b>çoğul</b> kullanılmalı (<code>/products</code>).</li>
        <li>Alt kaynaklar için iç içe path kullan (<code>/users/123/orders</code>).</li>
        <li>İşlem endpointleri mümkünse <code>GET, POST, PUT, DELETE</code> gibi HTTP metoduna bırakılmalı.</li>
      </ul>
      <h3>2. Veri Formatı</h3>
      <p>
        API'dan dönen veriler standart bir JSON yapısında olmalı. Örnek:
      </p>
      <pre>{
  "success": true,
  "data": {
    "id": 123,
    "name": "Ali"
  },
  "message": "Başarılı"
}</pre>
      <h3>3. Authentication ve Güvenlik</h3>
      <ul>
        <li>Tüm kritik endpointler JWT veya OAuth2 ile korunmalı.</li>
        <li>Kullanıcı oturumları token bazlı yönetilmeli.</li>
        <li>Rate limiting ile kötüye kullanım engellenmeli.</li>
        <li>Tüm inputlar backend'de tekrar valide edilmeli.</li>
      </ul>
      <h3>4. Versiyonlama</h3>
      <p>
        Büyük değişikliklerde eski istemcilerin bozulmaması için API versiyonlaması zorunludur.
      </p>
      <ul>
        <li>URL içinde versiyon kullanılabilir: <code>/api/v1/products</code></li>
        <li>Veya Header üzerinden versiyon gönderilebilir.</li>
      </ul>
      <h3>5. Swagger/OpenAPI Dokümantasyonu</h3>
      <p>
        Tüm endpointler, parametreleri ve response şemaları Swagger veya OpenAPI ile otomatik dokümante edilmeli.
        Böylece frontend-backend entegrasyonu kolaylaşır ve tutarlılık sağlanır.
      </p>
      <h3>6. Hata Yönetimi</h3>
      <ul>
        <li>Tüm hata cevapları tutarlı ve açıklayıcı olmalı.</li>
        <li>Örnek hata response:
          <pre>{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "E-posta geçersiz."
}</pre>
        </li>
      </ul>
      <h3>7. Ek Notlar</h3>
      <ul>
        <li>Payload'lar küçük tutulmalı, gereksiz veri gönderilmemeli.</li>
        <li>Loglama ve monitoring sistemleri entegre edilmeli.</li>
        <li>Performans için GZIP veya HTTP/2 tercih edilmeli.</li>
      </ul>
      <hr>
      <h2>Sonuç</h2>
      <p>
        İyi API tasarımı, ekiplerin hızlı ve hatasız geliştirme yapmasını sağlar.  
        Standartlara uyum, sürdürülebilirliğin ve başarıya giden yolun anahtarıdır.
      </p>
    `
  },

  { id: 2, projectId: 'proj1', parentId: null, title: 'Kullanıcı Kayıt Süreci', desc: 'Kayıt, onay akışı' },
  { id: 3, projectId: 'proj1', parentId: 1, title: 'Versiyonlama', desc: 'API v1/v2 mimarisi' },
  { id: 4, projectId: 'proj2', parentId: null, title: 'Sipariş Akışı', desc: 'E-ticaret süreçleri' },
]
