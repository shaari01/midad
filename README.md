# مِداد — برنامج الخط العربي والتركيبات الخطية

تطبيق ويب قابل للتثبيت (PWA) يعمل بلا إنترنت على Chrome وEdge (أندرويد وويندوز).

**الرابط:** https://shaari01.github.io/midad/

- المواصفات: `docs/SPEC.md`
- سجل التقدّم: [PROGRESS.md](PROGRESS.md)
- القرارات: [DECISIONS.md](DECISIONS.md)

## التطوير

```bash
npm install
npm run dev        # خادم تطوير
npm test           # اختبارات الوحدات
npm run build && npm run e2e   # اختبارات المتصفح (تحتاج Playwright)
```

النشر تلقائي عند كل دفع إلى `main` عبر GitHub Actions إلى فرع `gh-pages`.

## الرخص
الخطوط المضمّنة كلها برخصة SIL OFL 1.1 (انظر قائمة «عن البرنامج»). المكتبات: HarfBuzz، Paper.js، jsPDF، svg2pdf.js، idb-keyval، Lucide.
