**ภาษา:** [English](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md) | [Русский](../ru/README.md) | [Tiếng Việt](../vi-VN/README.md) | **ไทย** | [Deutsch](../de-DE/README.md) | [Українська](../uk-UA/README.md)

# NEXUS-OS

![NEXUS-OS — ระบบเพิ่มประสิทธิภาพสำหรับ AI agent harness](../../assets/hero.png)

[![Stars](https://img.shields.io/github/stars/nexus-os/nexus-os?style=flat)](https://github.com/nexus-os/nexus-os/stargazers)
[![Forks](https://img.shields.io/github/forks/nexus-os/nexus-os?style=flat)](https://github.com/nexus-os/nexus-os/network/members)
[![Contributors](https://img.shields.io/github/contributors/nexus-os/nexus-os?style=flat)](https://github.com/nexus-os/nexus-os/graphs/contributors)
[![npm nexus-os](https://img.shields.io/npm/dw/nexus-os?label=nexus-os%20weekly%20downloads&logo=npm)](https://www.npmjs.com/package/nexus-os)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

> **182K+ ดาว** | **28K+ fork** | **170+ คอนทริบิวเตอร์** | **12+ ระบบนิเวศภาษาโปรแกรม** | **ระบบปฏิบัติการเอเจนต์อัตโนมัติ**

---

<div align="center">

**ภาษา / Language / 语言 / 語言 / Dil / Язык / Ngôn ngữ**

[English](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md) | [Русский](../ru/README.md) | [Tiếng Việt](../vi-VN/README.md) | **ไทย** | [Deutsch](../de-DE/README.md) | [Українська](../uk-UA/README.md)

</div>

---

**NEXUS-OS คือระบบเพิ่มประสิทธิภาพสำหรับ AI agent harness สถาปัตยกรรมระดับองค์กรสำหรับเอเจนต์อัตโนมัติ**

NEXUS-OS ไม่ใช่แค่ชุดไฟล์คอนฟิก แต่เป็นระบบครบวงจร: skills, สัญชาตญาณ (instincts), การจัดการหน่วยความจำ (memory optimization), การเรียนรู้ต่อเนื่อง (continuous learning), การสแกนความปลอดภัย (security scanning) และการพัฒนาที่ตรวจสอบจากแหล่งข้อมูลจริง (research-first development) ทั้งหมดนี้ผ่านการใช้งานจริงในการสร้างผลิตภัณฑ์จริง

ใช้งานได้ข้าม **Claude Code**, **Codex**, **Cursor**, **OpenCode**, **Gemini**, **Zed**, **GitHub Copilot** และ AI agent harness อื่น ๆ

หน้านี้คือคู่มือเริ่มต้นใช้งานฉบับย่อภาษาไทย สำหรับเนื้อหาเต็มและล่าสุดเสมอ ให้อ้างอิงจาก [README ภาษาอังกฤษ](../../README.md) เป็นหลัก

---

## เริ่มต้นใช้งานอย่างเร็ว

### เลือกวิธีติดตั้งเพียงวิธีเดียว

สำหรับผู้ใช้ Claude Code ส่วนใหญ่ ควรเลือก **เพียงหนึ่ง** ในสองวิธีต่อไปนี้:

- **แนะนำ:** ติดตั้งผ่าน Claude Code plugin จากนั้นค่อยคัดลอกเฉพาะโฟลเดอร์ `rules/` ที่ต้องการใช้จริงด้วยมือ
- **ใช้ installer แบบ manual** หากต้องการควบคุมรายละเอียดมากขึ้น หรือต้องการเลี่ยง plugin หรือ Claude Code ของคุณไม่สามารถ resolve marketplace ที่ self-host ได้
- **อย่าติดตั้งซ้อนกันหลายวิธี** ปัญหาที่พบบ่อยที่สุดคือการรัน `/plugin install` ก่อน แล้วตามด้วย `install.sh --profile full` หรือ `npx nexus-os install --profile full`

หากคุณติดตั้งซ้อนกันไปแล้วและพบว่ามี skill/hook ซ้ำ ดู [Reset / ถอนการติดตั้ง NEXUS-OS](#reset--ถอนการติดตั้ง-nexus-os)

### ติดตั้งผ่าน Claude Code plugin

```bash
# เพิ่ม marketplace
/plugin marketplace add https://github.com/nexus-os/nexus-os

# ติดตั้ง plugin
/plugin install nexus-os@nexus-os
```

NEXUS-OS มีชื่อเรียกในระบบสาธารณะ 3 ชื่อที่ต่างกัน:

- GitHub repo: `nexus-os/nexus-os`
- Claude marketplace plugin: `nexus-os@nexus-os`
- npm package: `nexus-os`

ชื่อเหล่านี้ตั้งใจให้ต่างกัน Plugin บน Claude Code ใช้ `nexus-os@nexus-os` ส่วน npm ยังคงใช้ `nexus-os`

### คัดลอกไฟล์ rules เพิ่มเติม (ถ้าต้องการ)

Plugin ของ Claude Code จะไม่ติดตั้ง `rules/` ให้อัตโนมัติ หากคุณติดตั้งผ่าน plugin **อย่า** รัน full installer เพิ่ม ให้คัดลอกเฉพาะชุด rule ที่ต้องการแทน:

```bash
git clone https://github.com/nexus-os/nexus-os.git
cd nexus-os

mkdir -p ~/.claude/rules/nexus
cp -R rules/common ~/.claude/rules/nexus/
cp -R rules/typescript ~/.claude/rules/nexus/
```

```powershell
git clone https://github.com/nexus-os/nexus-os.git
cd nexus-os

New-Item -ItemType Directory -Force -Path "$HOME/.claude/rules/nexus" | Out-Null
Copy-Item -Recurse rules/common "$HOME/.claude/rules/nexus/"
Copy-Item -Recurse rules/typescript "$HOME/.claude/rules/nexus/"
```

ให้คัดลอกทั้งโฟลเดอร์ภาษา เช่น `rules/common` หรือ `rules/golang` แทนการคัดลอกไฟล์เดี่ยว ๆ

### ติดตั้งแบบ manual (ไม่ใช้ plugin)

ใช้วิธีนี้เฉพาะเมื่อคุณตั้งใจไม่ใช้ plugin:

```bash
npm install
./install.sh --profile full
```

```powershell
npm install
.\install.ps1 --profile full
# หรือ
npx nexus-os install --profile full
```

หากเลือกวิธี manual แล้ว ให้หยุดที่นี่ อย่ารัน `/plugin install` เพิ่ม

### แบบ low-context / ไม่มี hooks

หากต้องการเฉพาะ rules, agents, commands และ core workflow skills ให้ใช้ profile แบบมินิมัล:

```bash
./install.sh --profile minimal --target claude
```

```powershell
.\install.ps1 --profile minimal --target claude
# หรือ
npx nexus-os install --profile minimal --target claude
```

Profile นี้จงใจไม่ติดตั้ง `hooks-runtime`

---

## Reset / ถอนการติดตั้ง NEXUS-OS

หาก NEXUS-OS ติดตั้งซ้อนกัน รบกวนระบบ หรือทำงานผิดปกติ อย่ารันติดตั้งทับซ้ำเข้าไปอีก

- **วิธี plugin:** ถอน plugin ออกจาก Claude Code จากนั้นลบโฟลเดอร์ rule ที่คุณคัดลอกเองใน `~/.claude/rules/nexus/`
- **วิธี installer/CLI:** ที่ root ของ repo ตรวจดูก่อน:

```bash
node scripts/uninstall.js --dry-run
```

จากนั้นถอนไฟล์ที่ NEXUS-OS ดูแล:

```bash
node scripts/uninstall.js
```

หรือใช้ lifecycle wrapper:

```bash
node scripts/nexus.js list-installed
node scripts/nexus.js doctor
node scripts/nexus.js repair
node scripts/nexus.js uninstall --dry-run
```

NEXUS-OS จะลบเฉพาะไฟล์ที่อยู่ใน install-state ของตัวเอง ไม่แตะไฟล์อื่นนอกเหนือจากนั้น

---

## คู่มือหลัก

ที่นี่เป็นเพียงโค้ดต้นฉบับ คู่มือเหล่านี้อธิบายรายละเอียดแบบเต็ม:

| คู่มือ | สิ่งที่คุณจะได้เรียนรู้ |
|--------|-------------------------|
| **Shorthand Guide** | การติดตั้ง พื้นฐาน และปรัชญา — อ่านก่อน |
| **Longform Guide** | การประหยัด token, การคงสภาพ memory, evals, การทำงานแบบขนาน |
| **Security Guide** | ช่องโหว่ของ agent, sandboxing, sanitization, CVE, AgentShield |

| หัวข้อ | สิ่งที่คุณจะได้เรียนรู้ |
|-------|-------------------------|
| Token Optimization | การเลือกโมเดล, การลดขนาด system prompt, background processes |
| Memory Persistence | Hooks ที่บันทึก/โหลด context ข้าม session อัตโนมัติ |
| Continuous Learning | ดึง pattern จาก session เป็น skill ใหม่อัตโนมัติ |
| Verification Loops | Checkpoint vs continuous evals, ประเภท grader, ตัววัด pass@k |
| Parallelization | Git worktrees, cascade method, จังหวะการ scale instance |
| Subagent Orchestration | ปัญหา context, pattern การ retrieve แบบทำซ้ำ |

---

## เอกสารสำคัญ

- [README ภาษาอังกฤษ](../../README.md) — แหล่งข้อมูลหลักที่อัปเดตล่าสุดเสมอ
- [คู่มือติดตั้ง Hermes](../HERMES-SETUP.md)
- [Release notes v2.0.0-rc.1](../releases/2.0.0-rc.1/release-notes.md)
- [สถาปัตยกรรม cross-harness](../architecture/cross-harness.md)
- [Troubleshooting](../TROUBLESHOOTING.md)
- [Hook bug workarounds](../hook-bug-workarounds.md)
- [คู่มือการพัฒนา skill](../SKILL-DEVELOPMENT-GUIDE.md)

---

## ลองใช้งาน

```bash
# ติดตั้งผ่าน plugin ใช้ namespace เต็ม
/nexus:plan "เพิ่มระบบยืนยันตัวตนผู้ใช้"

# ติดตั้งแบบ manual ใช้ slash command แบบสั้นได้
# /plan "เพิ่มระบบยืนยันตัวตนผู้ใช้"

# ดู plugin ที่ติดตั้งอยู่
/plugin list nexus-os@nexus-os
```

คำสั่งหลักที่ใช้บ่อย:

- `/tdd` — workflow แบบ Test-Driven Development
- `/plan` — วางแผนการ implement
- `/e2e` — สร้างและรัน E2E tests
- `/code-review` — ตรวจคุณภาพโค้ด
- `/build-fix` — แก้ปัญหา build
- `/learn` — ดึง pattern จาก session
- `/skill-create` — สร้าง skill จาก git history

ปัจจุบัน NEXUS-OS มี agent หลายสิบตัว, skill มากกว่า 200 ชุด และ legacy command shim สำหรับ workflow ต่าง ๆ ดูรายการเต็มและคำแนะนำล่าสุดได้ใน [README ภาษาอังกฤษ](../../README.md)

---

## ร่วมพัฒนาโปรเจกต์

ยินดีต้อนรับการ contribute! สำหรับคู่มือฉบับเต็ม โปรดดู [CONTRIBUTING.md](../../CONTRIBUTING.md)

หมวดที่กำลังต้องการการ contribute:

- **Agents** — agent เฉพาะภาษา (Python, Go, Rust), เฉพาะ framework (Django, Rails, Laravel, Spring), DevOps (Kubernetes, Terraform), domain expert (ML, data engineering, mobile)
- **Skills** — แนวปฏิบัติเฉพาะภาษา, pattern ของ framework, กลยุทธ์การทดสอบ, คู่มือสถาปัตยกรรม
- **Hooks** — automation, linting, security checks, validation, notification
- **Commands** — slash command สำหรับ deployment, testing, code generation
- **คำแปลภาษาอื่น ๆ** — ดูโครงสร้างใน `docs/` (เช่น `docs/zh-CN`, `docs/ja-JP`, `docs/th`)

### ขั้นตอนเริ่มต้นอย่างย่อ

```bash
# 1. Fork และ clone
gh repo fork nexus-os/nexus-os --clone
cd nexus-os

# 2. สร้าง branch
git checkout -b feat/my-contribution

# 3. เพิ่มสิ่งที่ contribute (ดู CONTRIBUTING.md)

# 4. ทดสอบในเครื่อง
cp -r skills/my-skill ~/.claude/skills/

# 5. ส่ง PR
git add . && git commit -m "feat: add my-skill" && git push -u origin feat/my-contribution
```

---

## ชุมชน & สนับสนุน

- [GitHub Discussions](https://github.com/nexus-os/nexus-os/discussions) — ถาม-ตอบ, โชว์ผลงาน
- [GitHub Sponsors](https://github.com/sponsors/nexus-os-team) — สนับสนุน OSS เริ่มที่ $5/เดือน
- [NEXUS-OS Pro](https://nexus-os.dev/pricing) — private repo + GitHub App ($19/seat/เดือน)
- [NEXUS-OS Tools GitHub App](https://nexus-os.dev) — ติดตั้ง, PR audit, มี free tier

**OSS ยังคงฟรีตลอดไป** Repo นี้ใช้สัญญาอนุญาต MIT ตลอดกาล NEXUS-OS Pro คือ GitHub App ที่ host ไว้สำหรับ private repo ส่วน Sponsors และ Pro subscribers ช่วยสนับสนุนให้ maintainer คนเดียวสามารถส่งงานข้าม 7 harness ได้ทุกสัปดาห์

---

## License

[MIT](../../LICENSE)
