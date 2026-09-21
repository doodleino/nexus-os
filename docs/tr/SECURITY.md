# Güvenlik Politikası

## Desteklenen Sürümler

| Sürüm   | Destekleniyor      |
| ------- | ------------------ |
| 1.9.x   | :white_check_mark: |
| 1.8.x   | :white_check_mark: |
| < 1.8   | :x:                |

## Güvenlik Açığı Bildirimi

NEXUS-OS'de bir güvenlik açığı keşfederseniz, lütfen sorumlu bir şekilde bildirin.

**Güvenlik açıkları için herkese açık GitHub issue açmayın.**

Bunun yerine, **<security@nexus-os.dev>** adresine aşağıdaki bilgilerle e-posta gönderin:

- Güvenlik açığının açıklaması
- Yeniden oluşturma adımları
- Etkilenen sürüm(ler)
- Potansiyel etki değerlendirmesi

Beklentileriniz:

- 48 saat içinde **onay**
- 7 gün içinde **durum güncellemesi**
- Kritik sorunlar için 30 gün içinde **düzeltme veya azaltma**

Güvenlik açığı kabul edilirse:

- Sürüm notlarında size teşekkür edeceğiz (anonim kalmayı tercih etmiyorsanız)
- Sorunu zamanında düzelteceğiz
- Açıklama zamanlamasını sizinle koordine edeceğiz

Güvenlik açığı reddedilirse, nedenini açıklayacağız ve başka bir yere bildirilmesi gerekip gerekmediği konusunda rehberlik sağlayacağız.

## Kapsam

Bu politika aşağıdakileri kapsar:

- NEXUS-OS eklentisi ve bu depodaki tüm script'ler
- Makinenizde çalışan hook script'leri
- Install/uninstall/repair yaşam döngüsü script'leri
- NEXUS-OS ile birlikte gelen MCP konfigürasyonları
- AgentShield güvenlik tarayıcısı ([github.com/nexus-os/agentshield](https://github.com/nexus-os/nexus-os))

## Güvenlik Kaynakları

- **AgentShield**: Agent konfigürasyonunuzu güvenlik açıkları için tarayın — `npx nexus-agentshield scan`
- **Güvenlik Kılavuzu**: [The Definitive Guide to Agentic Security & Isolation](./the-security-guide.md)
- **OWASP MCP Top 10**: [owasp.org/www-project-mcp-top-10](https://owasp.org/www-project-mcp-top-10/)
- **OWASP Agentic Applications Top 10**: [genai.owasp.org](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
