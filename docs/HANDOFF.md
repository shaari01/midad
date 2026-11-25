# الإرسال بين برامج علي (مِداد ← برنامج الصور المتحركة)

كل البرامج منشورة على النطاق نفسه `https://shaari01.github.io/`، فتتشارك IndexedDB.

- قاعدة البيانات: `shaari-handoff`، المخزن: `items` (بصيغة idb-keyval: `createStore('shaari-handoff','items')`).
- كل عنصر:
  ```json
  { "id": "midad-<time>", "from": "midad", "to": "animation", "created": 1764100000000,
    "kind": "svg", "name": "اسم المشروع", "svg": "<svg …>", "width": 1080, "height": 1080 }
  ```
- عند الإرسال تُبث رسالة على `BroadcastChannel('shaari-handoff')`: `{type:'new', id, from:'midad'}`.
- البرنامج المستقبِل يقرأ العناصر التي `to === 'animation'` ثم يحذفها بعد الاستيراد.
- كل عنصر في SVG له `id` باسم الطبقة، وكل الحروف مسارات (لا يحتاج خطوطًا).
