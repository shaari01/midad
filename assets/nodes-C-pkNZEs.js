const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./fonts-8X37Iyxx.js","./fonts-FIbmflf-.js","./rolldown-runtime-WkwZ5CU-.js","./preload-helper-DclECHGd.js"])))=>i.map(i=>d[i]);
import{$ as e,B as t,C as n,D as r,F as i,G as a,J as o,K as s,O as c,Q as l,R as u,S as d,V as f,W as p,X as m,Y as ee,a as h,b as g,c as _,d as v,et as y,g as te,i as b,l as ne,m as re,n as ie,o as ae,r as oe,s as x,t as S,w as C,x as se,z as w}from"./export-CPVH51KC.js";import{t as ce}from"./preload-helper-DclECHGd.js";import{a as le,c as ue,i as de,l as fe,n as T,r as pe,u as me}from"./fonts-FIbmflf-.js";function E(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}function D(e,t){let n,r=()=>{if(n)return n;let r=indexedDB.open(e);return r.onupgradeneeded=()=>r.result.createObjectStore(t),n=E(r),n.then(e=>{e.onclose=()=>n=void 0},()=>{n=void 0}),n};return(e,n)=>r().then(r=>n(r.transaction(t,e).objectStore(t)))}var he;function O(){return he||=D(`keyval-store`,`keyval`),he}function ge(e,t=O()){return t(`readonly`,t=>E(t.get(e)))}function _e(e,t,n=O()){return n(`readwrite`,n=>(n.put(t,e),E(n.transaction)))}function ve(e,t=O()){return t(`readwrite`,t=>(t.delete(e),E(t.transaction)))}function ye(e,t){return e.openCursor().onsuccess=function(){this.result&&(t(this.result),this.result.continue())},E(e.transaction)}function be(e=O()){return e(`readonly`,e=>{if(e.getAllKeys)return E(e.getAllKeys());let t=[];return ye(e,e=>t.push(e.key)).then(()=>t)})}function xe(e=O()){return e(`readonly`,e=>{if(e.getAll)return E(e.getAll());let t=[];return ye(e,e=>t.push(e.value)).then(()=>t)})}var k=D(`midad-projects`,`projects`),Se=D(`midad-fonts`,`fonts`),Ce=D(`midad-misc`,`misc`),A={async saveProject(e){await _e(e.id,e,k)},async loadProject(e){return ge(e,k)},async deleteProject(e){await ve(e,k)},async listProjects(){return(await xe(k)).map(({id:e,name:t,updated:n,thumb:r})=>({id:e,name:t,updated:n,thumb:r})).sort((e,t)=>t.updated-e.updated)},async saveFont(e){await _e(e.id,e,Se)},async deleteFont(e){await ve(e,Se)},async listFonts(){return xe(Se)},async getMisc(e,t=null){return await ge(e,Ce)??t},async setMisc(e,t){await _e(e,t,Ce)},async miscKeys(){return be(Ce)}},we={" (أشكال)":` (shapes)`," (شكل)":` (shape)`," (مقصوص)":` (cut)`," (مُشوّه)":` (warped)`," (نسخة)":` (copy)`,"A4 طباعة":`A4 print`,"A4 للطباعة":`A4 print`,"Blend (تدرج شكلي)":`Blend`,"Contour (حدود متكررة)":`Contour`,"PDF متجهي":`Vector PDF`,"PNG شفاف":`Transparent PNG`,"SVG كامل":`Full SVG`,"SVG مبسّط (للبرامج القديمة)":`Simple SVG (older apps)`,آخر:`Final`,أدلة:`Guides`,"أدوات مساعدة":`Helpers`,أسفل:`Bottom`,"أسفل الكل":`To back`,"أشكال الحرف":`Letter forms`,"أشكال بديلة في الخط":`Font alternates`,"أضف اللون الحالي إلى لوحتي":`Add current colour to my palette`,أعلى:`Top`,"أعلى الكل":`To front`,"أعلى وأسفل":`Top & bottom`,أفقي:`Horizontal`,"أفقي 1920×1080":`Landscape 1920×1080`,"ألف خنجرية":`Dagger alif`,"أنماط جاهزة":`Presets`,أول:`Initial`,إخفاء:`Hide`,"إدراج حرف كشكل":`Insert glyph`,"إرسال لبرنامج الحركة":`Send to animation app`,"إزاحة أفقية":`Offset X`,"إزاحة رأسية":`Offset Y`,إزالة:`Remove`,"إزالة التشكيل":`Remove diacritics`,"إضافة تشكيل":`Add diacritics`,"إضافة تعبئة":`Add fill`,"إضافة حد":`Add stroke`,"إضافة حدّ":`Add stroke`,"إضافة خط من ملف (TTF / OTF)":`Add font file (TTF / OTF)`,"إضافة عقدة":`Add node`,"إضافة عقدة: المس الخط نفسه":`Add node: tap the outline`,إظهار:`Show`,"إظهار/إخفاء":`Show/hide`,إعادة:`Redo`,"إعادة الشبكة":`Reset mesh`,"إعادة تسمية":`Rename`,"إعادة ضبط":`Reset`,"إعادة ضبط حرف":`Reset letter`,"إعادة ضبط كل الحروف":`Reset all letters`,إغلاق:`Close`,إلغاء:`Cancel`,"إلغاء التطويل":`Remove kashida`,"إلى الأمام":`Forward`,"إلى الخلف":`Backward`,"إنشاء التدرج":`Create blend`,إنهاء:`Finish`,"إنهاء الرسم":`Stop drawing`,"إنهاء تحرير الحروف":`Stop editing letters`,"إنهاء تعديل العقد":`Stop editing nodes`,اتجاه:`Direction`,اتساع:`Spread`,"اتساع التدرج":`Gradient spread`,"احتفظ بالصورة الأصلية مخفية":`Keep the original image hidden`,"احتفظ بنسخة حيّة مخفية":`Keep a hidden live copy`,"اختر شكلًا لتعديل نقاطه":`Pick a shape to edit its nodes`,"اختيار الخط":`Choose font`,"اختيار صورة":`Choose image`,"اختيار صورة مرجعية":`Choose reference image`,"ارتفاع السطر":`Line height`,"ارتفاع حرف":`Letter height`,"ارسم المسار":`Draw path`,"ارسم مسارًا جديدًا":`Draw a new path`,استبعاد:`Exclude`,استيراد:`Import`,"استيراد SVG أو PNG":`Import SVG or PNG`,"اسحب لتغيير الترتيب":`Drag to reorder`,"اسم المشروع":`Project name`,"اعكس (الشكل ↔ الخلفية)":`Invert (shape ↔ background)`,"اكتب النص هنا…":`Type your text here…`,"اكتب هنا":`اكتب هنا`,الأدوات:`Tools`,الأرضية:`Background`,"الأشكال البديلة لهذا الحرف":`Alternates for this letter`,الأصلي:`Original`,الأميري:`Amiri`,الاتجاه:`Direction`,الارتفاع:`Height`,"الارتفاع فقط":`Height only`,الانتشار:`Spread`,التالي:`Next`,"التبديل إلى وضع الجوال":`Switch to phone mode`,"التبديل إلى وضع اللابتوب":`Switch to laptop mode`,التجسيم:`Extrude`,التدوير:`Rotation`,"الترتيب والعمق":`Arrange & depth`,"التطويل (الكشيدة)":`Kashida`,التعبئة:`Fill`,التقاط:`Snap`,التمويه:`Blur`,التوهج:`Glow`,"الجهة الأخرى":`Other side`,الحجم:`Size`,الحدود:`Strokes`,"الحدود (يمكن أكثر من حد)":`Strokes (several allowed)`,الحركات:`Diacritics`,الحروف:`Letters`,"الحروف الحيّة":`Live letters`,الخصائص:`Properties`,الخط:`Font`,"الخط المستقيم إلى منحنٍ":`Straight line to curve`,الخلفية:`Background`,"الداكن شكل، الفاتح خلفية":`Dark = shape, light = background`,الدقة:`Detail`,"الدوران°":`Rotation°`,الزاوية:`Angle`,الزوايا:`Corners`,السابق:`Previous`,السكين:`Knife`,السماكة:`Width`,الشفافية:`Opacity`,"الشكل قطعة واحدة":`The shape is one piece`,الطبقات:`Layers`,الظل:`Shadow`,العدد:`Count`,العرض:`Width`,"العرض فقط":`Width only`,العمق:`Depth`,العُقد:`Nodes`,"الفاتح شكل، الداكن خلفية":`Light = shape, dark = background`,"الفراغ بين الخلايا":`Cell gap`,القاهرة:`Cairo`,القوة:`Strength`,"الكتابة اليدوية":`Hand writing`,"الكتابة على المسار":`Text on path`,"الكتابة على مسار":`Text on path`,الكثافة:`Density`,"الكوفي المربع":`Square Kufic`,اللوحة:`Artboard`,اللون:`Colour`,"المحدد فقط":`Selection only`,المرسمة:`Curve pen`,"المرسمة (قلم المنحنيات)":`Curve pen (Bézier)`,المزيد:`More`,"المس الخط نفسه لإضافة عقدة":`Tap the outline to add a node`,المسافة:`Distance`,المسيري:`El Messiri`,"المغناطيس: متوقف":`Magnet: off`,"المغناطيس: يعمل":`Magnet: on`,المقاس:`Size`,المقدار:`Amount`,الملف:`File`,"الممحاة المتجهية":`Vector eraser`,"المنحنى إلى خط مستقيم":`Curve to straight line`,الموضع:`Position`,"الموضع والحجم":`Position & size`,الميل:`Skew`,"النسخة الحيّة":`Live copy`,النص:`Text`,النقش:`Pattern`,النهايات:`Caps`,النوع:`Type`,انتفاخ:`Bulge`,"انحناء القوس (من دورة كاملة)":`Arc bend (of a full turn)`,"انحناء الكشيدة":`Kashida curve`,بارز:`Embossed`,"باني الأشكال":`Shape builder`,"باني الأشكال يعمل":`Shape builder on`,بديل:`Alternate`,بكسل:`px`,"بكسل شاشة":`screen px`,بلا:`None`,"بلا تعبئة":`No fill`,تأثيرات:`Effects`,تباعد:`Spacing`,"تباعد الحروف":`Letter spacing`,"تباعد الكلمات":`Word spacing`,تبديل:`Replace`,"تبديل الخط":`Change font`,"تبديل الصورة":`Replace image`,تثبيت:`Install`,"تجاهل النقاط الصغيرة":`Ignore small specks`,"تجسيم (بروز)":`Extrude`,تجميع:`Group`,تحجيم:`Scale`,"تحجيم حرف":`Scale letter`,تحديد:`Select`,"تحرير الحروف":`Edit letters`,"تحريك اللوحة":`Pan`,"تحريك عقد":`Move nodes`,تحويل:`Convert`,"تحويل إلى أشكال":`Convert to shapes`,"تحويل إلى شكل":`Convert to shape`,"تحويل إلى شكل واحد":`Convert to one shape`,"تحويل الصورة إلى شكل":`Image to shape`,"تحويل الصورة إلى شكل (Image Trace)":`Image trace`,"تحويل الكوفي":`Convert Kufic`,تدرج:`Gradient`,"تدرج خطي":`Linear gradient`,"تدرج دائري":`Radial gradient`,تدوير:`Rotate`,"تدوير ×4":`Rotate ×4`,"تدوير حرف":`Rotate letter`,"تدوير رباعي":`Fourfold rotation`,تراجع:`Undo`,ترتيب:`Arrange`,"ترتيب التعبئة":`Fill order`,"ترتيب الحدود":`Stroke order`,"ترتيب الحروف":`Letter order`,"ترتيب الطبقات":`Layer order`,تشكيل:`Diacritics`,تصدير:`Export`,تصغير:`Zoom out`,تطبيق:`Apply`,تطويل:`Kashida`,تعبئة:`Fill`,"تعبئة إضافية":`Extra fill`,"تعديل الشكل":`Edit shape`,"تعديل العقد":`Edit nodes`,"تعديل النص":`Edit text`,"تعذّر الإرسال":`Could not send`,"تعذّر تحويل هذه الصورة":`Could not trace this image`,"تعذّر فتح الملف":`Could not open the file`,تفريغ:`Clear`,تفكيك:`Break apart`,"تفكيك إلى أجزاء":`Break into parts`,تقاطع:`Intersect`,"تقديم / تأخير":`Forward / back`,تقسيم:`Divide`,تقطيع:`Dashes`,تكبير:`Zoom in`,تكرار:`Duplicate`,"تكرار الحرف":`Duplicate letter`,"تكرار الطبقة":`Duplicate layer`,تلقائي:`Auto`,"تم التصدير":`Exported`,"تناظر أثناء الرسم":`Symmetry while drawing`,"تناظر مرآوي أثناء التعديل":`Mirror while editing`,تنسيق:`Align`,تنعيم:`Smooth`,"تنعيم المسار":`Smooth path`,"تنعيم المسار وتقليل النقاط":`Smooth & reduce nodes`,"تنعيم حركة اليد":`Hand smoothing`,توزيع:`Distribute`,"توزيع أفقي":`Distribute horizontally`,"توزيع رأسي":`Distribute vertically`,توهج:`Glow`,"جارٍ تحويل الصورة إلى شكل…":`Tracing image…`,جزء:`Part`,جمهورية:`Jomhuria`,حادة:`Corner`,"حافظ على النسبة":`Keep ratio`,"حبر أسود":`Black ink`,"حبر وورق":`Ink & paper`,حجم:`Size`,"حجم الخط":`Font size`,"حجم الشبكة":`Grid size`,"حجم الشبكة الجديدة":`New grid size`,"حجم اللوحة":`Artboard size`,"حجم الممحاة":`Eraser size`,"حجم النقش":`Pattern size`,"حد ذهبي وأسود":`Gold & black stroke`,"حدود اللوحة":`Artboard bounds`,حديث:`Modern`,"حدّ إضافي":`Extra stroke`,"حدّ الأسود (للصور بخلفية)":`Black threshold`,حذف:`Delete`,"حذف الأدلة":`Clear guides`,"حذف الحد":`Delete stroke`,"حذف الحرف":`Delete letter`,"حذف الخط":`Delete font`,"حذف الطبقات المحددة":`Delete selected layers`,"حذف العقد المحددة":`Delete selected nodes`,حرف:`Glyph`,"حروف حيّة":`Live letters`,"حسب الشفافية":`By transparency`,"حفظ ملف المشروع":`Save project file`,حيّ:`live`,حُفظ:`Saved`,خارج:`Outside`,خط:`Font`,"خط ثابت":`Mono line`,"خط مرسوم":`Drawn line`,"خط مستورد":`Imported font`,خطوط:`Stripes`,"خطوط متكررة":`Repeated lines`,خلفية:`Background`,دائرة:`Circle`,داخل:`Inside`,"درجة التنعيم":`Smoothing`,دليل:`Guide`,"دليل أفقي":`Horizontal guide`,"دليل رأسي":`Vertical guide`,دمج:`Unite`,"دمج التداخل":`Merge overlaps`,"دمج وقص (Pathfinder)":`Pathfinder`,"ذهب مذهّب":`Gilded gold`,ذهبي:`Gold`,رسم:`Paint`,"رسم الخلايا":`Paint cells`,"رسم مسار للنص":`Draw text path`,"رفع / خفض":`Raise / lower`,"رفع/خفض عن المسار":`Baseline shift`,رقعة:`Ruqaa`,"ريم كوفي":`Reem Kufi`,زاوية:`Angle`,"زاوية التدرج":`Gradient angle`,"زاوية حادة":`Corner`,"زاوية رأس القلم":`Nib angle`,زخرفي:`Swash`,"سحب مائل":`Rise`,سكين:`Knife`,سماكة:`Width`,"سماكة الخط":`Line width`,"سماكة الخط المفتوح":`Open line width`,شبكة:`Grid`,شرطات:`Dashes`,شفافة:`Transparent`,شفافية:`Opacity`,"شفافية العنصر":`Object opacity`,شكل:`Shape`,"شكل متجهي":`Vector shape`,"شكل مدموج":`Merged shape`,"شكل مرسوم":`Drawn shape`,صورة:`Image`,"صورة داخل الحرف":`Image inside letters`,"صورة مرجعية":`Reference image`,"صورة مرجعية (لا تُصدَّر)":`Reference image (not exported)`,"ضع النص على الشكل":`Put text on the shape`,"طبقة نص جديدة":`New text layer`,"طريقة الفصل":`Separation`,ظل:`Shadow`,"عارف رقعة":`Aref Ruqaa`,عالية:`High`,عثماني:`Ottoman`,"عدد الأعمدة":`Columns`,"عدد الخطوات":`Steps`,"عدد الصفوف":`Rows`,"عرض القلم":`Pen width`,"عقدة حادة":`Corner node`,"عقدة منحنية":`Smooth node`,"عقدة منحنية ناعمة":`Smooth node`,عكس:`Invert`,"عكس الاتجاه":`Reverse direction`,"عكس التدرج":`Reverse gradient`,"عمليات العقد":`Node operations`,عمودي:`Vertical`,"عمودي 1080×1350":`Portrait 1080×1350`,"عن البرنامج":`About`,"عن كلمة":`About Kalima`,"عودة للنسخة الحيّة":`Back to live copy`,"غلاف حر (شبكة)":`Free mesh`,"غلاف دائري":`Circle envelope`,"غلاف قوسي":`Arc envelope`,"غلاف مربع":`Square envelope`,"غلاف وتشويه":`Envelope & warp`,"فتح ملف مشروع":`Open project file`,"فراغ الخلايا":`Cell gap`,"فصل النقاط":`Detach dots`,"فصل النقاط عن الحرف":`Detach dots from letter`,"فصل عن المسار":`Detach from path`,"فك التجميع":`Ungroup`,"فك القفل":`Unlock`,"فكّ العقدة إلى عقدتين":`Break node in two`,"فكّ الكلمة":`Explode word`,قالب:`Template`,قص:`Minus front`,قفل:`Lock`,قلب:`Flip`,"قلب أفقي":`Flip horizontal`,"قلب رأسي":`Flip vertical`,"قلم قصب":`Reed pen`,"قلم مستدير":`Round pen`,قوس:`Arc`,"قوس للأسفل":`Arc down`,"قوس للأعلى":`Arc up`,"كبير 4000":`Large 4000`,كتابة:`Text`,"كتابة آلية":`Auto write`,"كتابة يدوية":`Hand writing`,كشيدة:`Kashida`,"كل الأدوات":`All tools`,"كل اللوحة":`Whole artboard`,كلمة:`Word`,"كوفي مربع":`Square Kufic`,"لا توجد أشكال هنا.":`No glyphs here.`,"لا توجد طبقات بعد.":`No layers yet.`,"لا مشاريع محفوظة بعد.":`No saved projects yet.`,"لا يوجد عنصر محدد":`Nothing selected`,لوحتي:`My palette`,لون:`Colour`,"لون الحد":`Stroke colour`,"ليونة منطقة المدّ":`Stretch softness`,مائل:`Diagonal`,متصل:`Solid`,متقطع:`Dashed`,متوسطة:`Medium`,مجموعة:`Group`,محاذاة:`Align`,"محاذاة إلى اللوحة":`Align to artboard`,مخصص:`Custom`,مداد:`Madd (stretch)`,مدّ:`Stretch`,"مدّ الشكل":`Stretch shape`,مرآة:`Mirror`,"مرآة رباعية":`Fourfold mirror`,"مرآة يمين/يسار":`Left/right mirror`,"مربع 1080":`Square 1080`,مساطر:`Rulers`,مسح:`Erase`,مشاريعي:`My projects`,"مشروع جديد":`New project`,"مقابض التطويل":`Kashida handles`,"مقاس الخلية":`Cell size`,"مكتبة الألوان":`Colour library`,"ملاءمة الشاشة":`Fit to screen`,ممحاة:`Eraser`,منتصف:`Centre`,منحنية:`Smooth`,"منخفضة (أسرع)":`Low (faster)`,منفرد:`Isolated`,موجة:`Wave`,موضع:`Position`,"موضع النص على المسار":`Text position on path`,"نجوم ثمانية":`Eight-point stars`,نسخ:`Copy`,نسخة:`Copy`,نص:`Text`,"نص جديد":`New text`,"نص حيّ":`Live text`,"نعومة الحواف":`Edge smoothness`,نقاط:`Dots`,نقش:`Pattern`,"نقش منقّط":`Dotted pattern`,نقل:`Move`,"نمط جاهز":`Preset`,"نوع التعبئة":`Fill type`,وسط:`Middle`,"وسط أفقي":`Centre horizontally`,"وسط رأسي":`Centre vertically`,"وضع الحذف":`Delete mode`,"وضع الدمج":`Merge mode`,يسار:`Left`,يمين:`Right`,"يمين ويسار":`Left & right`,الرئيسية:`Home`,تعديل:`Edit`,مظهر:`Appearance`,أدوات:`Tools`,"إعدادات الصفحة":`Page`,الإعدادات:`Settings`,جديد:`New`,فتح:`Open`,حفظ:`Save`,"حفظ باسم":`Save as`,"استيراد من الجهاز":`Import from device`,"استيراد من برامجي":`Import from my apps`,"تصدير إلى الجهاز":`Export to device`,"إرسال إلى برامجي":`Send to my apps`,"إنهاء البرنامج":`Exit`,اللغة:`Language`,المظهر:`Theme`,فاتح:`Light`,داكن:`Dark`,"حسب الجهاز":`System`,"حجم الأيقونات":`Icon size`,"إظهار المسميات تحت الأيقونات":`Show labels under icons`,"اختصارات لوحة المفاتيح":`Keyboard shortcuts`,قص:`Cut`,لصق:`Paste`,"تحديد الكل":`Select all`,"حجم مساحة العمل":`Artboard size`,"إدراج صورة":`Insert image`,"حروف الخط كأشكال":`Glyphs as shapes`,"خط النص":`Font`,"تحويل إلى شكل (نص أو صورة)":`Convert to shape`,"الألوان والتعبئة":`Colours & fill`,المؤثرات:`Effects`,"تحديد المساحات (باني الأشكال)":`Shape builder`,"شبكة المنظور":`Perspective grid`,"خلفية اللوحة":`Artboard background`,صغيرة:`Small`,كبيرة:`Large`,عربي:`Arabic`,إنجليزي:`English`,"تكبير وتصغير":`Zoom`,"نسخة من":`Copy of`,"تقديم للأمام":`Bring to front`,"إرجاع للخلف":`Send to back`,"تعديل العقد…":`Edit nodes…`,المنزل:`Home`},Te=`ar`;function Ee(e){Te=e===`en`?`en`:`ar`,document.documentElement.lang=Te,document.documentElement.dir=Te===`en`?`ltr`:`rtl`}function j(e){return Te!==`en`||typeof e!=`string`?e:we[e]??we[e.trim()]??e}var De=`
<svg
  class="lucide lucide-align-center-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M2 12h20" />
  <path d="M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
  <path d="M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" />
  <path d="M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1" />
  <path d="M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1" />
</svg>
`,Oe=`
<svg
  class="lucide lucide-align-center-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 2v20" />
  <path d="M8 10H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h4" />
  <path d="M16 10h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4" />
  <path d="M8 20H7a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h1" />
  <path d="M16 14h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
</svg>
`,ke=`
<svg
  class="lucide lucide-align-end-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="6" height="16" x="4" y="2" rx="2" />
  <rect width="6" height="9" x="14" y="9" rx="2" />
  <path d="M22 22H2" />
</svg>
`,Ae=`
<svg
  class="lucide lucide-align-end-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="16" height="6" x="2" y="4" rx="2" />
  <rect width="9" height="6" x="9" y="14" rx="2" />
  <path d="M22 22V2" />
</svg>
`,je=`
<svg
  class="lucide lucide-align-horizontal-distribute-center"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="6" height="14" x="4" y="5" rx="2" />
  <rect width="6" height="10" x="14" y="7" rx="2" />
  <path d="M17 22v-5" />
  <path d="M17 7V2" />
  <path d="M7 22v-3" />
  <path d="M7 5V2" />
</svg>
`,Me=`
<svg
  class="lucide lucide-align-horizontal-justify-center"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M12 2v20" />
</svg>
`,Ne=`
<svg
  class="lucide lucide-align-horizontal-justify-end"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="12" y="7" rx="2" />
  <path d="M22 2v20" />
</svg>
`,Pe=`
<svg
  class="lucide lucide-align-horizontal-justify-start"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="6" height="14" x="6" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M2 2v20" />
</svg>
`,Fe=`
<svg
  class="lucide lucide-align-start-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="6" height="16" x="4" y="6" rx="2" />
  <rect width="6" height="9" x="14" y="6" rx="2" />
  <path d="M22 2H2" />
</svg>
`,Ie=`
<svg
  class="lucide lucide-align-start-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="9" height="6" x="6" y="14" rx="2" />
  <rect width="16" height="6" x="6" y="4" rx="2" />
  <path d="M2 2v20" />
</svg>
`,Le=`
<svg
  class="lucide lucide-align-vertical-distribute-center"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M22 17h-3" />
  <path d="M22 7h-5" />
  <path d="M5 17H2" />
  <path d="M7 7H2" />
  <rect x="5" y="14" width="14" height="6" rx="2" />
  <rect x="7" y="4" width="10" height="6" rx="2" />
</svg>
`,Re=`
<svg
  class="lucide lucide-align-vertical-justify-center"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 12h20" />
</svg>
`,ze=`
<svg
  class="lucide lucide-align-vertical-justify-end"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="14" height="6" x="5" y="12" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 22h20" />
</svg>
`,Be=`
<svg
  class="lucide lucide-align-vertical-justify-start"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="6" rx="2" />
  <path d="M2 2h20" />
</svg>
`,Ve=`
<svg
  class="lucide lucide-arrow-down"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 5v14" />
  <path d="m19 12-7 7-7-7" />
</svg>
`,He=`
<svg
  class="lucide lucide-arrow-up"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m5 12 7-7 7 7" />
  <path d="M12 19V5" />
</svg>
`,Ue=`
<svg
  class="lucide lucide-blend"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="15" cy="9" r="7" />
  <circle cx="9" cy="15" r="7" />
</svg>
`,We=`
<svg
  class="lucide lucide-box"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
  <path d="m3.3 7 8.7 5 8.7-5" />
  <path d="M12 22V12" />
</svg>
`,Ge=`
<svg
  class="lucide lucide-bring-to-front"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="8" y="8" width="8" height="8" rx="2" />
  <path d="M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2" />
  <path d="M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2" />
</svg>
`,Ke=`
<svg
  class="lucide lucide-brush"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m11 10 3 3" />
  <path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z" />
  <path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031" />
</svg>
`,qe=`
<svg
  class="lucide lucide-carets-to-axis-dashed-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
  <path d="M4 12H2" />
  <path d="M7.298 20.288A1 1 0 0 0 8 22h8a1 1 0 0 0 .703-1.712l-3.991-3.99a1 1 0 0 0-1.424-.001z" />
  <path d="M7.298 3.712A1 1 0 0 1 8 2h8a1 1 0 0 1 .703 1.712l-3.991 3.99a1 1 0 0 1-1.424.001z" />
</svg>
`,Je=`
<svg
  class="lucide lucide-carets-to-axis-dashed-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 14v2" />
  <path d="M12 20v2" />
  <path d="M12 2v2" />
  <path d="M12 8v2" />
  <path d="M20.288 16.703A1 1 0 0 0 22 16V8a1 1 0 0 0-1.712-.703l-3.99 3.991a1 1 0 0 0-.001 1.424z" />
  <path d="M3.712 16.703A1 1 0 0 1 2 16V8a1 1 0 0 1 1.712-.703l3.99 3.991a1 1 0 0 1 .001 1.424z" />
</svg>
`,Ye=`
<svg
  class="lucide lucide-case-sensitive"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
  <path d="M22 9v7" />
  <path d="M3.304 13h6.392" />
  <circle cx="18.5" cy="12.5" r="3.5" />
</svg>
`,Xe=`
<svg
  class="lucide lucide-chart-spline"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M3 3v16a2 2 0 0 0 2 2h16" />
  <path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" />
</svg>
`,Ze=`
<svg
  class="lucide lucide-check"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M20 6 9 17l-5-5" />
</svg>
`,Qe=`
<svg
  class="lucide lucide-chevron-left"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m15 18-6-6 6-6" />
</svg>
`,$e=`
<svg
  class="lucide lucide-chevron-right"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m9 18 6-6-6-6" />
</svg>
`,et=`
<svg
  class="lucide lucide-circle-minus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <path d="M8 12h8" />
</svg>
`,tt=`
<svg
  class="lucide lucide-circle-plus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <path d="M8 12h8" />
  <path d="M12 8v8" />
</svg>
`,nt=`
<svg
  class="lucide lucide-circle-question-mark"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <path d="M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5" />
  <path d="M12 17h.01" />
</svg>
`,rt=`
<svg
  class="lucide lucide-circle"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
</svg>
`,it=`
<svg
  class="lucide lucide-clipboard-paste"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M11 14h10" />
  <path d="M16 4h2a2 2 0 0 1 2 2v1.344" />
  <path d="m17 18 4-4-4-4" />
  <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113" />
  <rect x="8" y="2" width="8" height="4" rx="1" />
</svg>
`,at=`
<svg
  class="lucide lucide-clipboard"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
</svg>
`,ot=`
<svg
  class="lucide lucide-combine"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1" />
  <path d="M19 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1" />
  <path d="m7 15 3 3" />
  <path d="m7 21 3-3H5a2 2 0 0 1-2-2v-2" />
  <rect x="14" y="14" width="7" height="7" rx="1" />
  <rect x="3" y="3" width="7" height="7" rx="1" />
</svg>
`,st=`
<svg
  class="lucide lucide-copy-plus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <line x1="15" x2="15" y1="12" y2="18" />
  <line x1="12" x2="18" y1="15" y2="15" />
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>
`,ct=`
<svg
  class="lucide lucide-copy"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>
`,lt=`
<svg
  class="lucide lucide-download"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 15V3" />
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
</svg>
`,ut=`
<svg
  class="lucide lucide-dot"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="1" />
</svg>
`,dt=`
<svg
  class="lucide lucide-ellipsis"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="1" />
  <circle cx="19" cy="12" r="1" />
  <circle cx="5" cy="12" r="1" />
</svg>
`,ft=`
<svg
  class="lucide lucide-ellipsis-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="1" />
  <circle cx="12" cy="5" r="1" />
  <circle cx="12" cy="19" r="1" />
</svg>
`,pt=`
<svg
  class="lucide lucide-eraser"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
</svg>
`,mt=`
<svg
  class="lucide lucide-eye-off"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
  <path d="m2 2 20 20" />
</svg>
`,ht=`
<svg
  class="lucide lucide-eye"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
  <circle cx="12" cy="12" r="3" />
</svg>
`,gt=`
<svg
  class="lucide lucide-file-input"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  <path d="M2 15h10" />
  <path d="m9 18 3-3-3-3" />
</svg>
`,_t=`
<svg
  class="lucide lucide-file-output"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  <path d="m5 11-3 3" />
  <path d="m5 17-3-3h10" />
</svg>
`,vt=`
<svg
  class="lucide lucide-file-plus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  <path d="M9 15h6" />
  <path d="M12 18v-6" />
</svg>
`,yt=`
<svg
  class="lucide lucide-file"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
</svg>
`,bt=`
<svg
  class="lucide lucide-focus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="3" />
  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
</svg>
`,xt=`
<svg
  class="lucide lucide-folder-open"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
</svg>
`,St=`
<svg
  class="lucide lucide-grid-2x2"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 3v18" />
  <path d="M3 12h18" />
  <rect x="3" y="3" width="18" height="18" rx="2" />
</svg>
`,Ct=`
<svg
  class="lucide lucide-grid-3x3"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M3 9h18" />
  <path d="M3 15h18" />
  <path d="M9 3v18" />
  <path d="M15 3v18" />
</svg>
`,wt=`
<svg
  class="lucide lucide-grip-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="9" cy="12" r="1" />
  <circle cx="9" cy="5" r="1" />
  <circle cx="9" cy="19" r="1" />
  <circle cx="15" cy="12" r="1" />
  <circle cx="15" cy="5" r="1" />
  <circle cx="15" cy="19" r="1" />
</svg>
`,Tt=`
<svg
  class="lucide lucide-group"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M3 7V5c0-1.1.9-2 2-2h2" />
  <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
  <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
  <rect width="7" height="5" x="7" y="7" rx="1" />
  <rect width="7" height="5" x="10" y="12" rx="1" />
</svg>
`,Et=`
<svg
  class="lucide lucide-hand"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
  <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
  <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
</svg>
`,Dt=`
<svg
  class="lucide lucide-house"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
  <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
</svg>
`,Ot=`
<svg
  class="lucide lucide-image-up"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" />
  <path d="m14 19.5 3-3 3 3" />
  <path d="M17 22v-5.5" />
  <circle cx="9" cy="9" r="2" />
</svg>
`,kt=`
<svg
  class="lucide lucide-image"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
  <circle cx="9" cy="9" r="2" />
  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
</svg>
`,At=`
<svg
  class="lucide lucide-info"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <path d="M12 16v-4" />
  <path d="M12 8h.01" />
</svg>
`,jt=`
<svg
  class="lucide lucide-keyboard"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 8h.01" />
  <path d="M12 12h.01" />
  <path d="M14 8h.01" />
  <path d="M16 12h.01" />
  <path d="M18 8h.01" />
  <path d="M6 8h.01" />
  <path d="M7 16h10" />
  <path d="M8 12h.01" />
  <rect width="20" height="16" x="2" y="4" rx="2" />
</svg>
`,Mt=`
<svg
  class="lucide lucide-languages"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m5 8 6 6" />
  <path d="m4 14 6-6 2-3" />
  <path d="M2 5h12" />
  <path d="M7 2h1" />
  <path d="m22 22-5-10-5 10" />
  <path d="M14 18h6" />
</svg>
`,Nt=`
<svg
  class="lucide lucide-laptop"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" />
  <path d="M20.054 15.987H3.946" />
</svg>
`,Pt=`
<svg
  class="lucide lucide-layers"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
  <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
  <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
</svg>
`,Ft=`
<svg
  class="lucide lucide-layout-grid"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="7" height="7" x="3" y="3" rx="1" />
  <rect width="7" height="7" x="14" y="3" rx="1" />
  <rect width="7" height="7" x="14" y="14" rx="1" />
  <rect width="7" height="7" x="3" y="14" rx="1" />
</svg>
`,It=`
<svg
  class="lucide lucide-library-big"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="8" height="18" x="3" y="3" rx="1" />
  <path d="M7 3v18" />
  <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
</svg>
`,Lt=`
<svg
  class="lucide lucide-line-squiggle"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2" />
</svg>
`,Rt=`
<svg
  class="lucide lucide-lock"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>
`,zt=`
<svg
  class="lucide lucide-lock-open"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
</svg>
`,Bt=`
<svg
  class="lucide lucide-log-out"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m16 17 5-5-5-5" />
  <path d="M21 12H9" />
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
</svg>
`,Vt=`
<svg
  class="lucide lucide-magnet"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m12 15 4 4" />
  <path d="M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z" />
  <path d="m5 8 4 4" />
</svg>
`,Ht=`
<svg
  class="lucide lucide-maximize"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
</svg>
`,Ut=`
<svg
  class="lucide lucide-menu"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 5h16" />
  <path d="M4 12h16" />
  <path d="M4 19h16" />
</svg>
`,Wt=`
<svg
  class="lucide lucide-merge"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m8 6 4-4 4 4" />
  <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22" />
  <path d="m20 22-5-5" />
</svg>
`,Gt=`
<svg
  class="lucide lucide-minus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M5 12h14" />
</svg>
`,Kt=`
<svg
  class="lucide lucide-monitor-down"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 13V7" />
  <path d="m15 10-3 3-3-3" />
  <rect width="20" height="14" x="2" y="3" rx="2" />
  <path d="M12 17v4" />
  <path d="M8 21h8" />
</svg>
`,qt=`
<svg
  class="lucide lucide-moon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
</svg>
`,Jt=`
<svg
  class="lucide lucide-mouse-pointer-2"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
</svg>
`,Yt=`
<svg
  class="lucide lucide-mouse-pointer-click"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 4.1 12 6" />
  <path d="m5.1 8-2.9-.8" />
  <path d="m6 12-1.9 2" />
  <path d="M7.2 2.2 8 5.1" />
  <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
</svg>
`,Xt=`
<svg
  class="lucide lucide-move-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m18 8 4 4-4 4" />
  <path d="M2 12h20" />
  <path d="m6 8-4 4 4 4" />
</svg>
`,Zt=`
<svg
  class="lucide lucide-move-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 2v20" />
  <path d="m8 18 4 4 4-4" />
  <path d="m8 6 4-4 4 4" />
</svg>
`,Qt=`
<svg
  class="lucide lucide-paint-bucket"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M11 7 6 2" />
  <path d="M18.992 12H2.041" />
  <path d="M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595" />
  <path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33" />
</svg>
`,$t=`
<svg
  class="lucide lucide-paintbrush"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m14.622 17.897-10.68-2.913" />
  <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
  <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
</svg>
`,en=`
<svg
  class="lucide lucide-palette"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
</svg>
`,tn=`
<svg
  class="lucide lucide-pen-line"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M13 21h8" />
  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
</svg>
`,nn=`
<svg
  class="lucide lucide-pen-tool"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m18 13-.654-4.736a4 4 0 00-2.756-3.266l-9.163-2.9a2 2 0 00-2.017.493l-.82.819a2 2 0 00-.492 2.017l2.9 9.163a4 4 0 003.266 2.756L13 18" />
  <path d="M18.648 12.352a1.205 1.205 0 011.704 0l1.296 1.296a1.205 1.205 0 010 1.704l-6.296 6.296a1.205 1.205 0 01-1.704 0l-1.296-1.296a1.205 1.205 0 010-1.704z" />
  <path d="m3 3 6.586 6.586" />
  <circle cx="11" cy="11" r="2" />
</svg>
`,rn=`
<svg
  class="lucide lucide-pencil-line"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M13 21h8" />
  <path d="m15 5 4 4" />
  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
</svg>
`,an=`
<svg
  class="lucide lucide-pencil"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  <path d="m15 5 4 4" />
</svg>
`,on=`
<svg
  class="lucide lucide-plus"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>
`,sn=`
<svg
  class="lucide lucide-redo-2"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
</svg>
`,cn=`
<svg
  class="lucide lucide-repeat"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m17 2 4 4-4 4" />
  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
  <path d="m7 22-4-4 4-4" />
  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
</svg>
`,ln=`
<svg
  class="lucide lucide-replace"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 4a1 1 0 0 1 1-1" />
  <path d="M15 10a1 1 0 0 1-1-1" />
  <path d="M21 4a1 1 0 0 0-1-1" />
  <path d="M21 9a1 1 0 0 1-1 1" />
  <path d="m3 7 3 3 3-3" />
  <path d="M6 10V5a2 2 0 0 1 2-2h2" />
  <rect x="3" y="14" width="7" height="7" rx="1" />
</svg>
`,un=`
<svg
  class="lucide lucide-rotate-ccw-clock"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
  <path d="M3 3v5h5" />
  <path d="M12 7v5l4 2" />
</svg>
`,dn=`
<svg
  class="lucide lucide-rotate-cw"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
</svg>
`,fn=`
<svg
  class="lucide lucide-route"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M9 5h8.5a1 1 0 010 7h-11a1 1 0 000 7H15" />
  <circle cx="18" cy="19" r="3" />
  <circle cx="6" cy="5" r="3" />
</svg>
`,pn=`
<svg
  class="lucide lucide-ruler"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
  <path d="m14.5 12.5 2-2" />
  <path d="m11.5 9.5 2-2" />
  <path d="m8.5 6.5 2-2" />
  <path d="m17.5 15.5 2-2" />
</svg>
`,mn=`
<svg
  class="lucide lucide-save-all"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 2v3a1 1 0 0 0 1 1h5" />
  <path d="M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6" />
  <path d="M18 22H4a2 2 0 0 1-2-2V6" />
  <path d="M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z" />
</svg>
`,hn=`
<svg
  class="lucide lucide-save"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
  <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
  <path d="M7 3v4a1 1 0 0 0 1 1h7" />
</svg>
`,gn=`
<svg
  class="lucide lucide-scaling"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M14 15H9v-5" />
  <path d="M16 3h5v5" />
  <path d="M21 3 9 15" />
</svg>
`,_n=`
<svg
  class="lucide lucide-scan-line"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  <path d="M7 12h10" />
</svg>
`,vn=`
<svg
  class="lucide lucide-scissors"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="6" cy="6" r="3" />
  <path d="M8.12 8.12 12 12" />
  <path d="M20 4 8.12 15.88" />
  <circle cx="6" cy="18" r="3" />
  <path d="M14.8 14.8 20 20" />
</svg>
`,yn=`
<svg
  class="lucide lucide-search"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m21 21-4.34-4.34" />
  <circle cx="11" cy="11" r="8" />
</svg>
`,bn=`
<svg
  class="lucide lucide-send-to-back"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="14" y="14" width="8" height="8" rx="2" />
  <rect x="2" y="2" width="8" height="8" rx="2" />
  <path d="M7 14v1a2 2 0 0 0 2 2h1" />
  <path d="M14 7h1a2 2 0 0 1 2 2v1" />
</svg>
`,xn=`
<svg
  class="lucide lucide-send"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
  <path d="m21.854 2.147-10.94 10.939" />
</svg>
`,Sn=`
<svg
  class="lucide lucide-separator-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 3v18" />
  <path d="m16 16 4-4-4-4" />
  <path d="m8 8-4 4 4 4" />
</svg>
`,Cn=`
<svg
  class="lucide lucide-settings-2"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 17H5" />
  <path d="M19 7h-9" />
  <circle cx="17" cy="17" r="3" />
  <circle cx="7" cy="7" r="3" />
</svg>
`,wn=`
<svg
  class="lucide lucide-settings"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
  <circle cx="12" cy="12" r="3" />
</svg>
`,Tn=`
<svg
  class="lucide lucide-shapes"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
  <rect x="3" y="14" width="7" height="7" rx="1" />
  <circle cx="17.5" cy="17.5" r="3.5" />
</svg>
`,En=`
<svg
  class="lucide lucide-share-2"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="18" cy="5" r="3" />
  <circle cx="6" cy="12" r="3" />
  <circle cx="18" cy="19" r="3" />
  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
</svg>
`,Dn=`
<svg
  class="lucide lucide-slash"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M22 2 2 22" />
</svg>
`,On=`
<svg
  class="lucide lucide-slice"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M11 16.586V19a1 1 0 0 1-1 1H2L18.37 3.63a1 1 0 1 1 3 3l-9.663 9.663a1 1 0 0 1-1.414 0L8 14" />
</svg>
`,kn=`
<svg
  class="lucide lucide-sliders-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 5H3" />
  <path d="M12 19H3" />
  <path d="M14 3v4" />
  <path d="M16 17v4" />
  <path d="M21 12h-9" />
  <path d="M21 19h-5" />
  <path d="M21 5h-7" />
  <path d="M8 10v4" />
  <path d="M8 12H3" />
</svg>
`,An=`
<svg
  class="lucide lucide-smartphone"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
  <path d="M12 18h.01" />
</svg>
`,jn=`
<svg
  class="lucide lucide-sparkles"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
  <path d="M20 2v4" />
  <path d="M22 4h-4" />
  <circle cx="4" cy="20" r="2" />
</svg>
`,M=`
<svg
  class="lucide lucide-spline"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="19" cy="5" r="2" />
  <circle cx="5" cy="19" r="2" />
  <path d="M5 17A12 12 0 0 1 17 5" />
</svg>
`,Mn=`
<svg
  class="lucide lucide-square-axis-dashed-vertical"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 14v2" />
  <path d="M12 20v2" />
  <path d="M12 2v2" />
  <path d="M12 8v2" />
  <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
  <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
</svg>
`,Nn=`
<svg
  class="lucide lucide-square-dashed"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M5 3a2 2 0 0 0-2 2" />
  <path d="M19 3a2 2 0 0 1 2 2" />
  <path d="M21 19a2 2 0 0 1-2 2" />
  <path d="M5 21a2 2 0 0 1-2-2" />
  <path d="M9 3h1" />
  <path d="M9 21h1" />
  <path d="M14 3h1" />
  <path d="M14 21h1" />
  <path d="M3 9v1" />
  <path d="M21 9v1" />
  <path d="M3 14v1" />
  <path d="M21 14v1" />
</svg>
`,Pn=`
<svg
  class="lucide lucide-square-dot"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <circle cx="12" cy="12" r="1" />
</svg>
`,Fn=`
<svg
  class="lucide lucide-square"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="18" height="18" x="3" y="3" rx="2" />
</svg>
`,In=`
<svg
  class="lucide lucide-squares-exclude"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0" />
  <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2" />
</svg>
`,Ln=`
<svg
  class="lucide lucide-squares-intersect"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 22a2 2 0 0 1-2-2" />
  <path d="M14 2a2 2 0 0 1 2 2" />
  <path d="M16 22h-2" />
  <path d="M2 10V8" />
  <path d="M2 4a2 2 0 0 1 2-2" />
  <path d="M20 8a2 2 0 0 1 2 2" />
  <path d="M22 14v2" />
  <path d="M22 20a2 2 0 0 1-2 2" />
  <path d="M4 16a2 2 0 0 1-2-2" />
  <path d="M8 10a2 2 0 0 1 2-2h5a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2H9a1 1 0 0 1-1-1z" />
  <path d="M8 2h2" />
</svg>
`,Rn=`
<svg
  class="lucide lucide-squares-unite"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a1 1 0 0 0-1-1z" />
</svg>
`,zn=`
<svg
  class="lucide lucide-squares-subtract"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 22a2 2 0 0 1-2-2" />
  <path d="M16 22h-2" />
  <path d="M16 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-5a2 2 0 0 1 2-2h5a1 1 0 0 0 1-1z" />
  <path d="M20 8a2 2 0 0 1 2 2" />
  <path d="M22 14v2" />
  <path d="M22 20a2 2 0 0 1-2 2" />
</svg>
`,Bn=`
<svg
  class="lucide lucide-sticker"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
  <path d="M15 3v5a1 1 0 0 0 1 1h5" />
  <path d="M8 13h.01" />
  <path d="M16 13h.01" />
  <path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1" />
</svg>
`,Vn=`
<svg
  class="lucide lucide-sun-moon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 2v2" />
  <path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715" />
  <path d="M16 12a4 4 0 0 0-4-4" />
  <path d="m19 5-1.256 1.256" />
  <path d="M20 12h2" />
</svg>
`,Hn=`
<svg
  class="lucide lucide-sun"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" />
  <path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" />
  <path d="m19.07 4.93-1.41 1.41" />
</svg>
`,Un=`
<svg
  class="lucide lucide-superscript"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m4 19 8-8" />
  <path d="m12 19-8-8" />
  <path d="M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06" />
</svg>
`,Wn=`
<svg
  class="lucide lucide-text-align-center"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 5H3" />
  <path d="M17 12H7" />
  <path d="M19 19H5" />
</svg>
`,Gn=`
<svg
  class="lucide lucide-text-align-end"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 5H3" />
  <path d="M21 12H9" />
  <path d="M21 19H7" />
</svg>
`,Kn=`
<svg
  class="lucide lucide-text-align-start"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 5H3" />
  <path d="M15 12H3" />
  <path d="M17 19H3" />
</svg>
`,qn=`
<svg
  class="lucide lucide-text-cursor-input"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6" />
  <path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" />
  <path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" />
  <path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1" />
  <path d="M9 6v12" />
</svg>
`,Jn=`
<svg
  class="lucide lucide-text-initial"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M15 5h6" />
  <path d="M15 12h6" />
  <path d="M3 19h18" />
  <path d="m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12" />
  <path d="M3.92 10h6.16" />
</svg>
`,Yn=`
<svg
  class="lucide lucide-trash"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 11v6" />
  <path d="M14 11v6" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  <path d="M3 6h18" />
  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
</svg>
`,Xn=`
<svg
  class="lucide lucide-triangle"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
</svg>
`,Zn=`
<svg
  class="lucide lucide-type-outline"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z" />
</svg>
`,Qn=`
<svg
  class="lucide lucide-type"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 4v16" />
  <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
  <path d="M9 20h6" />
</svg>
`,$n=`
<svg
  class="lucide lucide-undo-2"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
</svg>
`,er=`
<svg
  class="lucide lucide-ungroup"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="11" y="14" width="10" height="7" rx="2" />
  <rect x="3" y="3" width="10" height="7" rx="2" />
</svg>
`,tr={select:Jt,text:Qn,pan:Et,undo:$n,redo:sn,menu:Ut,layers:Pt,props:kn,export:lt,import:`
<svg
  class="lucide lucide-upload"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 3v12" />
  <path d="m17 8-5-5-5 5" />
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
</svg>
`,save:hn,open:xt,new:vt,trash:Yn,copy:ct,eye:ht,eyeOff:mt,lock:Rt,unlock:zt,grip:wt,outline:Tn,nodes:M,unite:Rn,subtract:zn,intersect:Ln,exclude:In,divide:St,builder:`
<svg
  class="lucide lucide-wand-sparkles"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
  <path d="m14 7 3 3" />
  <path d="M5 6v4" />
  <path d="M19 14v4" />
  <path d="M10 2v2" />
  <path d="M7 8H3" />
  <path d="M21 16h-4" />
  <path d="M11 3H9" />
</svg>
`,blend:Ue,pen:nn,brush:Ke,eraser:pt,kufi:Ct,phone:An,laptop:Nt,zoomIn:`
<svg
  class="lucide lucide-zoom-in"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="11" x2="11" y1="8" y2="14" />
  <line x1="8" x2="14" y1="11" y2="11" />
</svg>
`,zoomOut:`
<svg
  class="lucide lucide-zoom-out"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="8" x2="14" y1="11" y2="11" />
</svg>
`,fit:Ht,flipH:qe,flipV:Je,rotate:dn,front:Ge,back:bn,up:He,down:Ve,ruler:pn,magnet:Vt,image:kt,palette:en,sparkles:jn,kashida:Xt,explode:er,send:xn,close:`
<svg
  class="lucide lucide-x"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg>
`,check:Ze,plus:on,minus:Gt,more:dt,knife:On,simplify:M,envelope:rt,warp:`
<svg
  class="lucide lucide-waves-horizontal"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M2 12q2.5 2 5 0t5 0 5 0 5 0" />
  <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0" />
  <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0" />
</svg>
`,settings:wn,info:At,grid:St,restore:un,font:Ye,alignR:Ne,alignCH:Me,alignL:Pe,alignT:Be,alignCV:Re,alignB:ze,distH:je,distV:Le,txtRight:Gn,txtCenter:Wn,txtLeft:Kn,group:Tt,ungroup:er,mirror:Mn,guide:Sn,share:En,install:Kt,help:nt,stretchH:Xt,stretchV:Zt,alt:ln,mark:ut,squareDot:Pn,rotate4:cn,square:Fn,fill:Qt,smooth:M,corner:Xn,addNode:tt,delNode:et,home:Dt,library:It,pencil:an,sheet:yt,more:ft,lens:yn,alStartV:Ie,alEndV:Ae,alCenterV:Oe,alStartH:Fe,alEndH:ke,alCenterH:De,sticker:Bn,wrench:`
<svg
  class="lucide lucide-wrench"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
</svg>
`,penLine:tn,pencilLine:rn,paintbrush:$t,scissors:vn,settings2:Cn,clipboard:at,paste:it,copyPlus:st,scan:_n,imageUp:Ot,route:fn,textCursor:qn,languages:Mt,sunMoon:Vn,sun:Hn,moon:qt,logOut:Bt,saveAll:mn,fileInput:gt,fileOutput:_t,combine:ot,unlink:`
<svg
  class="lucide lucide-unlink"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
  <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
  <line x1="8" x2="8" y1="2" y2="5" />
  <line x1="2" x2="5" y1="8" y2="8" />
  <line x1="16" x2="16" y1="19" y2="22" />
  <line x1="19" x2="22" y1="16" y2="16" />
</svg>
`,merge:Wt,slash:Dn,lineSquiggle:Lt,penTool:nn,superscript:Un,letterText:Jn,box:We,keyboard:jt,arcUp:M,arcDown:Xe,right:$e,left:Qe,scaling:gn,cut:vn,pointer:Yt,layoutGrid:Ft,squareDashed:Nn,eraser2:pt,typeOutline:Zn,waypoints:`
<svg
  class="lucide lucide-waypoints"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m10.586 5.414-5.172 5.172" />
  <path d="m18.586 13.414-5.172 5.172" />
  <path d="M6 12h12" />
  <circle cx="12" cy="20" r="2" />
  <circle cx="12" cy="4" r="2" />
  <circle cx="20" cy="12" r="2" />
  <circle cx="4" cy="12" r="2" />
</svg>
`,focus:bt},nr=rt;function N(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t||{}))n!=null&&n!==!1&&(e===`class`?r.className=n:e===`style`&&typeof n==`object`?Object.assign(r.style,n):e.startsWith(`on`)&&typeof n==`function`?r.addEventListener(e.slice(2).toLowerCase(),n):e===`html`?r.innerHTML=n:e===`value`?r.value=n:(e===`title`||e===`aria-label`||e===`placeholder`)&&typeof n==`string`?r.setAttribute(e,j(n)):e in r&&typeof n!=`string`?r[e]=n:r.setAttribute(e,n===!0?``:n));for(let e of n.flat(1/0))e!=null&&e!==!1&&r.append(e instanceof Node?e:document.createTextNode(j(String(e))));return r}function P(e,t=26){let n=tr[e]||nr,r=document.createElement(`span`);return r.className=`ic`,r.innerHTML=n.replace(/width="24"/,`width="${t}"`).replace(/height="24"/,`height="${t}"`).replace(/stroke-width="2"/,`stroke-width="1.8"`),r}function F(e,t,n,r={}){let i=N(`button`,{class:`btn ${r.class||``}`,type:`button`,title:r.title||t,"aria-label":r.title||t,onClick:n,"data-tool":r.tool,disabled:r.disabled},e?P(e,r.size):null,t&&!r.iconOnly?N(`span`,{class:`lbl`},t):null);return r.active&&i.classList.add(`active`),i}var rr;function I(e,t=`info`,n=2600){let r=document.getElementById(`toast`);r||(r=N(`div`,{id:`toast`,role:`status`}),document.body.append(r)),r.textContent=j(e),r.className=`show ${t}`,clearTimeout(rr),rr=setTimeout(()=>{r.className=``},n)}function L(e,t,{wide:n=!1,onClose:r}={}){R();let i=()=>{R(),r?.()},a=N(`div`,{class:`sheet-backdrop`,id:`sheet`,onClick:e=>{e.target.id===`sheet`&&i()}},N(`div`,{class:`sheet ${n?`wide`:``}`,role:`dialog`,"aria-label":e},N(`div`,{class:`sheet-head`},N(`h2`,{},e),F(`close`,`إغلاق`,i,{iconOnly:!0,class:`ghost`})),N(`div`,{class:`sheet-body`},t)));return document.body.append(a),a}function R(){document.getElementById(`sheet`)?.remove()}function z(e,t,n){return N(`label`,{class:`field`},N(`span`,{class:`flabel`},e),t,n||null)}function B(e,t,{min:n=0,max:r=100,step:i=1,unit:a=``,onInput:o,onChange:s}){let c=N(`input`,{type:`number`,value:V(t),min:n,max:r,step:i,class:`num`,inputmode:`decimal`}),l=N(`input`,{type:`range`,value:t,min:n,max:r,step:i}),u=(e,t)=>{e=Number(e),Number.isNaN(e)||(o?.(e),t&&s?.(e))};return l.addEventListener(`input`,()=>{c.value=V(l.value),u(l.value,!1)}),l.addEventListener(`change`,()=>u(l.value,!0)),c.addEventListener(`change`,()=>{l.value=c.value,u(c.value,!0)}),N(`div`,{class:`field slider`},N(`span`,{class:`flabel`},e,a?N(`small`,{},` (${a})`):null),N(`div`,{class:`srow`},ir(l,c,u,-1),ar(l,c,u),ir(l,c,u,1),c))}function ir(e,t,n,r){let i=N(`button`,{type:`button`,class:`sstep`,"aria-label":r>0?`زيادة`:`إنقاص`,title:r>0?`زيادة`:`إنقاص`},r>0?`+`:`−`);return i.addEventListener(`click`,()=>{let i=Number(e.min),a=Number(e.max),o=Number(e.step)||1,s=Math.min(a,Math.max(i,Math.round((Number(e.value)+r*o)/o)*o));e.value=s,t.value=V(s),n(s,!0)}),i}function ar(e,t,n){let r=N(`div`,{class:`rangewrap`},e),i=null;return r.addEventListener(`pointerdown`,t=>{t.pointerType!==`mouse`&&(i={x:t.clientX,y:t.clientY,v:Number(e.value),on:!1,id:t.pointerId})}),r.addEventListener(`pointermove`,a=>{if(!i||a.pointerId!==i.id)return;let o=a.clientX-i.x,s=a.clientY-i.y;if(!i.on){if(Math.abs(s)>10&&Math.abs(s)>Math.abs(o)){i=null;return}if(Math.abs(o)<10||Math.abs(o)<Math.abs(s)*1.5)return;i.on=!0,i.x=a.clientX,r.classList.add(`dragging`);try{r.setPointerCapture(a.pointerId)}catch{}}let c=Number(e.min),l=Number(e.max),u=Number(e.step)||1,d=e.getBoundingClientRect().width||200,f=getComputedStyle(e).direction===`rtl`,p=i.v+(f?-1:1)*(a.clientX-i.x)/d*(l-c);p=Math.min(l,Math.max(c,Math.round(p/u)*u)),String(p)!==e.value&&(e.value=p,t.value=V(p),n(p,!1))}),r.addEventListener(`pointerup`,()=>{i?.on&&(r.classList.remove(`dragging`),n(e.value,!0)),i=null}),r.addEventListener(`pointercancel`,()=>{i?.on&&n(e.value,!0),r.classList.remove(`dragging`),i=null}),r}var V=e=>Math.round(Number(e)*100)/100;function H(e,t,{onInput:n}={}){let r=N(`input`,{type:`color`,value:or(e),class:`color`});return r.addEventListener(`input`,()=>n?.(r.value)),r.addEventListener(`change`,()=>t(r.value)),r}function or(e){return e?/^#[0-9a-f]{6}$/i.test(e)?e:/^#[0-9a-f]{3}$/i.test(e)?`#`+e.slice(1).split(``).map(e=>e+e).join(``):`#000000`:`#000000`}function U(e,t,n){let r=N(`select`,{onChange:()=>n(r.value)},e.map(([e,n])=>N(`option`,{value:e,selected:e===t},n)));return r}function W(e,{multiple:t=!1}={}){return new Promise(n=>{let r=N(`input`,{type:`file`,accept:e,multiple:t,style:{display:`none`}});r.addEventListener(`change`,()=>{n([...r.files]),r.remove()}),document.body.append(r),r.click()})}var sr=24;function G(e,t,n,r=`h`){return`<circle class="hit" data-handle="${e}" cx="${t}" cy="${n}" r="${sr}"/><circle class="${r}" cx="${t}" cy="${n}" r="11" pointer-events="none"/>`}function cr(e,t,{handles:n=!0,rotate:r=!0}={}){if(!t)return``;let[i,a]=e.toScreen(t.x,t.y),[o,s]=e.toScreen(t.x+t.w,t.y+t.h),c=(i+o)/2,l=(a+s)/2,u=`<rect class="selbox" x="${i}" y="${a}" width="${Math.max(1,o-i)}" height="${Math.max(1,s-a)}"/>`;if(!n)return u;r&&(u+=`<line class="selline" x1="${c}" y1="${a}" x2="${c}" y2="${a-40}"/>`+G(`rot`,c,a-40,`h rot`));let d={nw:[i,a],ne:[o,a],sw:[i,s],se:[o,s],n:[c,a],s:[c,s],w:[i,l],e:[o,l]};for(let[e,[t,n]]of Object.entries(d))u+=G(e,t,n,e.length===1?`h side`:`h`);return u}function lr(e,t){let n=e.host.getBoundingClientRect();return(t||[]).map(t=>{if(t.axis===`x`){let[r]=e.toScreen(t.pos,0);return`<line class="snapline" x1="${r}" y1="0" x2="${r}" y2="${n.height}"/>`}let[,r]=e.toScreen(0,t.pos);return`<line class="snapline" x1="0" y1="${r}" x2="${n.width}" y2="${r}"/>`}).join(``)}function ur(t,n,r,i,a={}){let o={x:n.x,y:n.y},c=i.map(e=>e.m.slice()),l=r.x+r.w/2,u=r.y+r.h/2,d={nw:[r.x+r.w,r.y+r.h],ne:[r.x,r.y+r.h],sw:[r.x+r.w,r.y],se:[r.x,r.y],n:[l,r.y+r.h],s:[l,r.y],w:[r.x+r.w,u],e:[r.x,u]};return{kind:t,apply(n,{keepRatio:f=!0,snap:p=null}={}){let h;if(t===`move`){let t=n.x-o.x,i=n.y-o.y,a=[];if(p){let e=p({x:r.x+t,y:r.y+i,w:r.w,h:r.h});t+=e.dx,i+=e.dy,a=e.lines}h=e(t,i),this.lines=a}else if(t===`rot`){let e=(Math.atan2(n.y-u,n.x-l)-Math.atan2(o.y-u,o.x-l))*180/Math.PI,t=n.shift?15:0;if(t)e=Math.round(e/t)*t;else{let t=Math.round(e/45)*45;Math.abs(t-e)<3&&(e=t)}this.angle=e,h=ee(e,l,u)}else{let[e,r]=d[t],i=(e,t)=>Math.abs(t)<1e-6?1:e/t,s=i(n.x-e,o.x-e),c=i(n.y-r,o.y-r);if((t===`n`||t===`s`)&&(s=f&&a.ratioOnSides?c:1),(t===`e`||t===`w`)&&(c=f&&a.ratioOnSides?s:1),t.length===2&&f!==n.shift){let e=Math.abs(s)>Math.abs(c)?s:c;s=Math.sign(s||1)*Math.abs(e),c=Math.sign(c||1)*Math.abs(e)}Math.abs(s)<.01&&(s=.01*Math.sign(s||1)),Math.abs(c)<.01&&(c=.01*Math.sign(c||1)),h=m(s,c,e,r)}return i.forEach((e,t)=>{e.m=s(h,c[t])}),h}}}var dr={id:`select`,down(e,t){let{app:n}=t;this.s0=[e.sx,e.sy];let r=e.target.closest?.(`[data-handle]`),i=t.selectionBounds();if(r&&i&&n.selection.length){let t=n.selected.filter(e=>!e.locked);this.op=ur(r.getAttribute(`data-handle`),e,i,t),this.moved=!1;return}let a=t.hitObject(e.e,e.x,e.y);if(a){e.shift||e.ctrl?n.select(n.selection.includes(a.id)?n.selection.filter(e=>e!==a.id):[...n.selection,a.id]):n.selection.includes(a.id)||n.select(a.id);let r=n.selected.filter(e=>!e.locked),i=t.selectionBounds();this.op=i?ur(`move`,e,i,r):null,this.moved=!1}else e.pointerType===`mouse`?this.marquee={x0:e.x,y0:e.y,x1:e.x,y1:e.y,add:e.shift}:this.panning={sx:e.sx,sy:e.sy,tx:t.tx,ty:t.ty,moved:!1}},move(e,t){if(this.op){if(!this.moved&&Math.hypot(e.sx-this.s0[0],e.sy-this.s0[1])<4)return;this.moved=!0,this.op.apply(e,{keepRatio:t.app.settings.keepRatio,snap:this.op.kind===`move`?e=>t.snapBox(e):null}),t.app.render()}else if(this.marquee)this.marquee.x1=e.x,this.marquee.y1=e.y,t.drawOverlay();else if(this.panning){let n=this.panning;Math.hypot(e.sx-n.sx,e.sy-n.sy)>6&&(n.moved=!0),t.tx=n.tx+e.sx-n.sx,t.ty=n.ty+e.sy-n.sy,t.draw()}},up(e,t){let{app:n}=t;if(this.op){let e=this.op.kind;this.op=null,this.moved&&n.commit(e===`move`?`نقل`:e===`rot`?`تدوير`:`تحجيم`),n.render({panels:!0})}else if(this.marquee){let e=this.marquee;this.marquee=null;let r=Math.min(e.x0,e.x1),i=Math.max(e.x0,e.x1),a=Math.min(e.y0,e.y1),o=Math.max(e.y0,e.y1);if(i-r<2/t.z&&o-a<2/t.z){e.add||n.select([]);return}let s=n.doc.objects.filter(e=>{if(e.visible===!1||e.locked)return!1;let t=C(e);return t.x>=r&&t.y>=a&&t.x+t.w<=i&&t.y+t.h<=o}).map(e=>e.id);n.select(s,{add:e.add})}else if(this.panning){let e=this.panning.moved;this.panning=null,e||n.select([])}},cancel(e){this.op&&(this.op=null,e.app.revert()),this.marquee=null,this.panning=null},dbl(e,t){let n=t.hitObject(e.e,e.x,e.y);n&&(t.app.select(n.id),n.type===`text`?t.app.emit(`editText`):n.type===`letters`?t.app.setTool(`letters`):n.type===`path`?t.app.setTool(`nodes`):n.type===`kufi`&&t.app.setTool(`kufi`))},overlay(e){let t=``,n=e.app;if(n.selection.length){let r=e.selectionBounds(),i=n.selected.every(e=>e.locked);if(t+=cr(e,r,{handles:!i}),n.selection.length>1)for(let r of n.selected)t+=cr(e,C(r),{handles:!1})}if(this.op?.lines&&(t+=lr(e,this.op.lines)),this.op?.kind===`rot`&&this.op.angle!=null){let n=e.selectionBounds(),[r,i]=e.toScreen(n.x+n.w/2,n.y+n.h/2);t+=`<text class="badge" x="${r}" y="${i}">${Math.round(this.op.angle)}°</text>`}if(this.marquee){let n=this.marquee,[r,i]=e.toScreen(Math.min(n.x0,n.x1),Math.min(n.y0,n.y1)),[a,o]=e.toScreen(Math.max(n.x0,n.x1),Math.max(n.y0,n.y1));t+=`<rect class="marquee" x="${r}" y="${i}" width="${a-r}" height="${o-i}"/>`}return t}},fr={id:`pan`};function K(t,n){let r=g(t)?.width??0;n();let i=(g(t)?.width??0)-r;if(!i||t.onPath)return;let a=t.align===`left`?0:t.align===`center`?.5:1;t.m=s(t.m,e(-i*a,0))}var pr={id:`text`,down(t,n){let{app:r}=n,i=n.hitObject(t.e,t.x,t.y);if(i&&i.type===`text`){r.select(i.id),r.setTool(`select`),r.emit(`editText`);return}let a=r.lastTextProps||{},o=l({fontId:a.fontId||`amiri`,size:a.size||Math.round(r.doc.width/7),style:a.style?JSON.parse(JSON.stringify(a.style)):void 0});o.style||delete o.style;let s=l();o.style=o.style||s.style,o.text=`اكتب هنا`,r.add(o);let c=g(o),u=c?.width||o.size*3,d=c?.height||o.size*1.5;o.m=e(Math.min(r.doc.width-u,Math.max(0,t.x-u)),Math.max(0,t.y-d/2)),r.commit(`نص جديد`),r.setTool(`select`),r.emit(`editText`,{selectAll:!0})}},mr={id:`kashida`,target(e){let t=e.one;return t&&t.type===`text`?t:null},overlay(e){let t=this.target(e.app);if(!t)return``;let n=g(t);if(!n)return``;let r=``;for(let i of n.gaps){let[n,a]=u(t.m,i.x,i.y),[o,s]=e.toScreen(n,a);r+=G(`k${i.gap}`,o,s,i.amount>.5?`h kas on`:`h kas`)}return r},down(e,t){let{app:n}=t,r=this.target(n),i=e.target.closest?.(`[data-handle]`);if(r&&i){let t=+i.getAttribute(`data-handle`).slice(1),n=a(r.m);this.drag={o:r,gap:t,m0:r.m.slice(),kas0:{...r.kashida||{}},startLocal:u(n,e.x,e.y)[0],amount0:r.kashida?.[t]||0};return}let o=t.hitObject(e.e,e.x,e.y);o&&o.type===`text`?(n.select(o.id),n.setTool(`kashida`)):r||I(`اختر نصًّا أولًا، ثم اسحب المقابض الصغيرة بين الحروف المتصلة`)},move(e,t){let n=this.drag;if(!n)return;let r=u(a(n.m0),e.x,e.y)[0],i=Math.max(0,n.amount0-(r-n.startLocal)/n.o.size),o=n.o;o.m=n.m0.slice(),o.kashida={...n.kas0},K(o,()=>{o.kashida={...n.kas0,[n.gap]:Math.round(i*1e3)/1e3}}),t.app.render()},up(e,t){this.drag&&(this.drag.o.kashida[this.drag.gap]===0&&delete this.drag.o.kashida[this.drag.gap],this.drag=null,t.app.commit(`تطويل`),t.app.render({panels:!0}))},cancel(e){this.drag&&(this.drag=null,e.app.revert())}};function hr(e,t,n=64){try{let i=r(e,t,{size:n}),a=c(e,i),o=n*.25;return`<svg viewBox="${-o} ${-o} ${i.width+o*2} ${i.height+o*2}" preserveAspectRatio="xMidYMid meet"><path d="${a}" fill="currentColor"/></svg>`}catch{return``}}async function gr(e,t,n){let r=(t?.text||t?.sourceText||`بسم الله`).split(`
`)[0].slice(0,24)||`خط`,i=N(`div`,{class:`fontlist`});L(`اختيار الخط`,N(`div`,{},N(`p`,{class:`hint`},`المس الخط لتطبيقه. الخطوط مضمّنة في البرنامج ولا تُثبَّت على جهازك.`),i,N(`div`,{class:`brow`},F(`plus`,`إضافة خط من ملف (TTF / OTF)`,()=>_r(e,()=>a()),{class:`primary`})),N(`p`,{class:`hint`},`مثلًا: خط «ليلى ثلث» من fontlibrary.org أو أي خط تملك رخصته.`)),{wide:!0});async function a(){i.innerHTML=``;for(let o of le()){let s=N(`button`,{type:`button`,class:`fontcard ${t?.fontId===o.id?`on`:``}`},N(`div`,{class:`fprev`},N(`span`,{class:`spin`})),N(`div`,{class:`fmeta`},N(`strong`,{},o.name),N(`small`,{},o.style||`خط مستورد`)));s.addEventListener(`click`,async()=>{await T(o.id),n?n(o.id):t&&(t.type===`text`?K(t,()=>{t.fontId=o.id}):t.fontId=o.id,e.lastTextProps={...e.lastTextProps||{},fontId:o.id},e.emit(`fontChanged`,t),e.commit(`تبديل الخط`),e.render({panels:!0})),R()}),o.user&&s.append(N(`span`,{class:`fdel`,role:`button`,title:`حذف الخط`,onClick:async e=>{e.stopPropagation(),await A.deleteFont(o.id),me(o.id),a()}},`×`)),i.append(s),T(o.id).then(e=>{s.querySelector(`.fprev`).innerHTML=hr(e,r)}).catch(()=>{s.querySelector(`.fprev`).textContent=`تعذّر تحميل الخط`})}}a()}async function _r(e,t){let n=await W(`.ttf,.otf,font/ttf,font/otf`,{multiple:!0});for(let e of n)try{let t=await e.arrayBuffer(),n=ue(t)||e.name.replace(/\.[^.]+$/,``),r={id:y(`uf`),name:n,style:`خط مستورد`,data:t,file:e.name};fe(r),(await T(r.id)).hasGlyph(1576)||I(`تنبيه: الخط «${n}» لا يحتوي حروفًا عربية`,`warn`),await A.saveFont(r),I(`أُضيف الخط «${n}»`)}catch(t){console.error(t),me(e.name),I(`تعذّر قراءة الملف ${e.name}`,`error`)}t?.()}var q=(e,t)=>`${(e.projectName||`midad`).replace(/[\\/:*?"<>|]+/g,`_`)}.${t}`;function vr(e){L(`مشروع جديد`,N(`div`,{class:`mgrid`},[[1080,1080,`مربع (منشور)`],[1080,1350,`عمودي`],[1920,1080,`أفقي`],[2480,3508,`A4 طباعة`],[4e3,4e3,`شعار كبير`]].map(([t,n,r])=>F(null,`${r} ${t}×${n}`,async()=>{await e.saveNow(),await e.newProject(t,n),R(),I(`مشروع جديد`)}))))}async function yr(e){await e.saveNow();let t=await A.listProjects(),n=N(`div`,{class:`projects`},t.map(t=>N(`div`,{class:`pcard ${t.id===e.projectId?`on`:``}`},N(`button`,{type:`button`,class:`pthumb`,onClick:async()=>{let n=await A.loadProject(t.id);await e.openProject(n),R()}},t.thumb?N(`img`,{src:t.thumb,alt:``}):N(`span`,{},`كلمة`)),N(`div`,{class:`pmeta`},N(`strong`,{},t.name),N(`small`,{},new Date(t.updated).toLocaleString(`ar`))),N(`div`,{class:`brow`},F(`copy`,`نسخة`,async()=>{let n=await A.loadProject(t.id);n.id=y(`prj`),n.name+=` (نسخة)`,n.updated=Date.now(),await A.saveProject(n),yr(e)},{iconOnly:!0,class:`ghost small`}),t.id===e.projectId?null:F(`trash`,`حذف`,async()=>{br(n,`حذف «${t.name}»؟`)&&(await A.deleteProject(t.id),yr(e))},{iconOnly:!0,class:`ghost small danger`})))));L(`مشاريعي`,t.length?n:N(`p`,{class:`hint`},`لا مشاريع محفوظة بعد.`),{wide:!0})}var J=new WeakMap;function br(e,t){return J.get(e)===t?(J.delete(e),!0):(J.set(e,t),I(`${t} — اضغط مرة أخرى للتأكيد`,`warn`),setTimeout(()=>J.delete(e),3e3),!1)}async function xr(e){let t=new Set;JSON.stringify(e.doc,(e,n)=>(e===`fontId`&&t.add(n),n));let n=[];for(let e of le())e.user&&t.has(e.id)&&n.push({id:e.id,name:e.name,data:Cr(e.data)});let r=b(e.doc,{name:e.projectName,fonts:n});S(new Blob([r],{type:`application/json`}),q(e,`midad`)),I(`حُفظ ملف المشروع`)}async function Sr(e){let[t]=await W(`.midad,.json,application/json`);if(t)try{let n=oe(await t.text()),{registerUserFont:r}=await ce(async()=>{let{registerUserFont:e}=await import(`./fonts-8X37Iyxx.js`);return{registerUserFont:e}},__vite__mapDeps([0,1,2,3]),import.meta.url);for(let e of n.fonts||[]){let t={id:e.id,name:e.name,style:`خط مستورد`,data:wr(e.data)};r(t),await A.saveFont(t)}await e.saveNow(),await e.openProject({id:y(`prj`),name:n.name||t.name.replace(/\.[^.]+$/,``),doc:n.doc}),R(),I(`فُتح المشروع`)}catch(e){I(e.message||`تعذّر فتح الملف`,`error`)}}var Cr=e=>{let t=new Uint8Array(e),n=``;for(let e=0;e<t.length;e+=32768)n+=String.fromCharCode(...t.subarray(e,e+32768));return btoa(n)},wr=e=>{let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e);return n.buffer};async function Tr(t,n){n||=await W(`.svg,image/svg+xml,image/png,image/jpeg,image/webp`,{multiple:!0});for(let r of n)try{if(/svg/.test(r.type)||/\.svg$/i.test(r.name))Er(t,await r.text(),r.name);else{let n=await oi(r),i=await $(n),a=Math.min(1,t.doc.width*.8/i.width,t.doc.height*.8/i.height),o=p(n,i.width,i.height,{name:r.name});o.m=s(e((t.doc.width-i.width*a)/2,(t.doc.height-i.height*a)/2),m(a,a)),t.add(o)}}catch(e){console.error(e),I(`تعذّر استيراد ${r.name}`,`error`)}t.commit(`استيراد`),R()}function Er(t,n,r=`SVG`){let i=v.project.importSVG(n,{insert:!1,expandShapes:!0}),a=[],c=e=>{if(e.className===`Path`||e.className===`CompoundPath`){let t=re(e);if(!t)return;let n=f(e.fillColor?e.fillColor.toCSS(!0):`none`);e.fillColor||(n.fills=[]),e.strokeColor&&e.strokeWidth&&(n.strokes=[{color:e.strokeColor.toCSS(!0),width:e.strokeWidth,align:`center`,cap:`round`,join:`round`}]),a.push(o(t,{name:e.name||r,style:n}))}else e.children&&e.children.forEach(c)};if(i.applyMatrix=!0,i.reduce?.(),c(i),!a.length){I(`لم أجد أشكالًا في الملف`,`warn`);return}let l=i.bounds,u=Math.min(1,t.doc.width*.8/l.width,t.doc.height*.8/l.height),d=s(e((t.doc.width-l.width*u)/2,(t.doc.height-l.height*u)/2),s(m(u,u),e(-l.x,-l.y)));for(let e of a)e.m=d.slice(),t.add(e,{select:!1});t.select(a.map(e=>e.id))}function Dr(e){let t={what:e.selection.length?`selection`:`all`,crop:`artboard`,size:4e3,bg:!0},n=()=>t.what===`selection`?e.selected:e.doc.objects,r=N(`input`,{type:`number`,value:t.size,min:64,max:16e3,step:100,class:`num`});r.addEventListener(`change`,()=>{t.size=+r.value});let i=async r=>{try{await te(e.doc.objects);let i=n();if(!i.length)return I(`لا يوجد ما يُصدَّر`,`warn`);let a={objects:i,crop:t.crop,background:t.bg};r===`svg`&&S(new Blob([x(e.doc,a)],{type:`image/svg+xml`}),q(e,`svg`)),r===`svg-simple`&&S(new Blob([_(e.doc,a)],{type:`image/svg+xml`}),q(e,`svg`)),r===`png`&&(I(`جارٍ إنشاء الصورة…`),S(await ae(x(e.doc,{...a,background:t.bg}),t.size),q(e,`png`))),r===`pdf`&&(I(`جارٍ إنشاء PDF…`),S(await h(x(e.doc,a)),q(e,`pdf`))),I(`تم التصدير`)}catch(e){console.error(e),I(`تعذّر التصدير: `+(e.message||e),`error`)}},a=ie(e.doc,n(),`artboard`);L(`تصدير`,N(`div`,{},N(`div`,{class:`brow`},z(`ماذا`,U([[`all`,`كل اللوحة`],[`selection`,`المحدد فقط`]],t.what,e=>{t.what=e})),z(`الحدود`,U([[`artboard`,`حدود اللوحة`],[`content`,`على قدّ التصميم`]],t.crop,e=>{t.crop=e}))),N(`label`,{class:`check`},N(`input`,{type:`checkbox`,checked:t.bg,onChange:e=>{t.bg=e.target.checked}}),`تضمين لون الخلفية (إن وُجد)`),N(`div`,{class:`mgrid`},F(`export`,`SVG كامل`,()=>i(`svg`)),F(`export`,`SVG مبسّط (للبرامج القديمة)`,()=>i(`svg-simple`)),F(`image`,`PNG شفاف`,()=>i(`png`)),F(`export`,`PDF متجهي`,()=>i(`pdf`))),z(`عرض PNG الأطول (بكسل)`,r),N(`p`,{class:`hint`},`اللوحة ${a.w}×${a.h}. «SVG مبسّط» يحوّل كل عنصر إلى مسار واحد بلون واحد ليُفتح في Illustrator القديم وCorelDRAW بلا مشاكل. PDF لا يدعم الظل والتوهج.`)),{wide:!1})}function Or(){L(`عن كلمة`,N(`div`,{class:`about`},N(`p`,{},`كلمة: برنامج شخصي للخط العربي والتركيبات الخطية. يعمل بلا إنترنت بعد أول تحميل.`),N(`h4`,{},`الخطوط المضمّنة (كلها برخصة SIL OFL 1.1)`),N(`ul`,{},le().filter(e=>!e.user).map(e=>N(`li`,{},`${e.name} (${e.style}) — ${e.license}`))),N(`p`,{class:`hint`},`المكتبات: HarfBuzz (تشكيل النص)، Paper.js (العمليات المتجهية)، jsPDF وsvg2pdf (PDF)، Lucide (الأيقونات).`)))}var Y={styles:[],stickers:[],images:[],loaded:!1};async function kr(){Y.styles=await A.getMisc(`lib-styles`,[]),Y.stickers=await A.getMisc(`lib-stickers`,[]),Y.images=await A.getMisc(`lib-images`,[]),Y.loaded=!0}var X=e=>A.setMisc(`lib-`+e,Y[e]);async function Ar(e,t){let n=Y.styles.length+1;Y.styles.push({id:y(`st`),name:`نمطي ${n}`,style:w(t)}),await X(`styles`),I(`حُفظ النمط في «مكتبتي»`),e.render({panels:!0})}async function jr(e,t){Y.styles=Y.styles.filter(e=>e.id!==t),await X(`styles`),e.render({panels:!0})}var Mr=e=>`data:image/svg+xml;charset=utf-8,`+encodeURIComponent(e);function Nr(e){return e.id=y(e.type?.[0]||`o`),(e.children||[]).forEach(Nr),e}async function Pr(e){let t=e.selected;if(!t.length)return I(`حدّد شكلًا أو كلمة أولًا`);let n=x(e.doc,{objects:t,crop:`content`,background:!1});Y.stickers.unshift({id:y(`sk`),name:t[0].name||`ملصق`,objs:t.map(w),thumb:Mr(n)}),await X(`stickers`),I(`حُفظ في «مكتبتي» ← الملصقات`)}async function Fr(e,t){for(let n of t)try{if(/svg/.test(n.type)||/\.svg$/i.test(n.name)){let t={width:e.doc.width,height:e.doc.height,objects:[]};if(Er({...e,doc:t,add:e=>t.objects.push(e),select(){},render(){},commit(){}},await n.text(),n.name),!t.objects.length)throw Error(`empty svg`);let r=x({...e.doc,objects:t.objects},{objects:t.objects,crop:`content`,background:!1});Y.stickers.unshift({id:y(`sk`),name:n.name.replace(/\.\w+$/,``),objs:t.objects,thumb:Mr(r)})}else{let e=await oi(n),t=await $(e);Y.stickers.unshift({id:y(`sk`),name:n.name.replace(/\.\w+$/,``),image:{src:e,w:t.width,h:t.height},thumb:e})}}catch(e){console.error(e),I(`تعذّر إضافة ${n.name}`,`error`)}await X(`stickers`)}function Ir(t,r,i){let a=n(r.map(C)),o=Math.min(t.doc.width,t.doc.height)*.5,c=Math.min(1,o/Math.max(a.w,a.h,1)),l=s(e(t.doc.width/2,t.doc.height/2),s(m(c,c),e(-(a.x+a.w/2),-(a.y+a.h/2)))),u=[];for(let e of r)e.m=s(l,e.m),t.doc.objects.push(e),u.push(e.id);t.selection=u,t.preview(i),t.render({panels:!0})}function Lr(t,n,r,i){let a=Math.min(1,t.doc.width*.5/n.w,t.doc.height*.5/n.h),o=p(n.src,n.w,n.h,{name:r});o.m=s(e((t.doc.width-n.w*a)/2,(t.doc.height-n.h*a)/2),m(a,a)),t.doc.objects.push(o),t.selection=[o.id],t.preview(i),t.render({panels:!0})}function Rr(e,t){if(t.image)return Lr(e,t.image,t.name,`إدراج ملصق`);Ir(e,t.objs.map(e=>Nr(w(e))),`إدراج ملصق`)}async function zr(e){for(let t of e)try{let e=await oi(t),n=await $(e);Y.images.unshift({id:y(`im`),name:t.name.replace(/\.\w+$/,``),src:e,w:n.width,h:n.height})}catch(e){console.error(e),I(`تعذّر إضافة ${t.name}`,`error`)}await X(`images`)}async function Br(e,t=`stickers`){Y.loaded||await kr();let n=N(`div`,{class:`library`}),r=N(`div`,{class:`chips libtabs`}),i=[[`stickers`,`الملصقات والأشكال`],[`images`,`الصور`],[`styles`,`الأنماط والتأثيرات`],[`fonts`,`الخطوط`]],a=(e,t,n,r)=>N(`div`,{class:`libcard`},N(`button`,{type:`button`,class:`libthumb`,title:t,onClick:n},e),N(`button`,{type:`button`,class:`libdel`,title:`حذف من مكتبتي`,"aria-label":`حذف من مكتبتي`,onClick:async e=>{e.stopPropagation(),await r(),s()}},`×`)),o=e=>N(`img`,{src:e,alt:``,loading:`lazy`}),s=()=>{if(r.innerHTML=``,i.forEach(([e,n])=>r.append(N(`button`,{type:`button`,class:`chip`+(e===t?` on`:``),onClick:()=>{t=e,s()}},n))),n.innerHTML=``,t===`stickers`){n.append(N(`div`,{class:`brow`},F(`plus`,`إضافة من ملف (SVG، PNG، GIF)`,async()=>{await Fr(e,await W(`.svg,image/svg+xml,image/png,image/webp,image/gif,image/jpeg`,{multiple:!0})),s()},{class:`small primary`}),F(`save`,`حفظ المحدد كملصق`,async()=>{await Pr(e),s()},{class:`small`,disabled:!e.selection.length})));let t=N(`div`,{class:`libgrid`},Y.stickers.map(t=>a(o(t.thumb),t.name,()=>{R(),Rr(e,t)},async()=>{Y.stickers=Y.stickers.filter(e=>e.id!==t.id),await X(`stickers`)})));n.append(Y.stickers.length?t:N(`p`,{class:`hint`},`لا توجد ملصقات بعد. أضف ملفات SVG أو PNG أو GIF، أو حدّد شكلًا أو كلمة واحفظها هنا لتستعملها في أي مشروع.`))}else if(t===`images`){n.append(N(`div`,{class:`brow`},F(`plus`,`إضافة صور (PNG، JPG، WebP، GIF)`,async()=>{await zr(await W(`image/png,image/jpeg,image/webp,image/gif`,{multiple:!0})),s()},{class:`small primary`})));let t=N(`div`,{class:`libgrid`},Y.images.map(t=>a(o(t.src),t.name,()=>{R(),Lr(e,t,t.name,`إدراج صورة`)},async()=>{Y.images=Y.images.filter(e=>e.id!==t.id),await X(`images`)})));n.append(Y.images.length?t:N(`p`,{class:`hint`},`لا توجد صور بعد. الصور هنا تبقى على جهازك وتظهر في كل مشاريعك.`))}else if(t===`styles`){let t=e.one;n.append(N(`div`,{class:`brow`},F(`save`,`حفظ نمط المحدد`,async()=>{await Ar(e,t.style),s()},{class:`small primary`,disabled:!t?.style})));let r=N(`div`,{class:`libgrid`},Y.styles.map(t=>a(N(`span`,{class:`pv`,style:Vr(t.style)},`خط`),t.name,()=>{if(!e.selection.length)return I(`حدّد عنصرًا لتطبيق النمط عليه`);R(),e.selected.forEach(e=>{e.style&&Object.assign(e.style,w(t.style))}),e.preview(`نمط من مكتبتي`),e.render({panels:!0})},async()=>{Y.styles=Y.styles.filter(e=>e.id!==t.id),await X(`styles`)})));n.append(Y.styles.length?r:N(`p`,{class:`hint`},`احفظ تنسيق أي عنصر (الألوان والحدود والظل والتوهج والبروز…) لتطبّقه بلمسة لاحقًا. يظهر أيضًا في «أنماط جاهزة».`))}else n.append(N(`p`,{class:`hint`},`أضف خطوطك من ملفات TTF أو OTF أو احذفها من نافذة الخطوط.`),N(`div`,{class:`brow`},F(`font`,`إدارة الخطوط`,()=>{R(),gr(e,e.one?.type===`text`||e.one?.type===`letters`?e.one:null)},{class:`small primary`})))};s(),L(`مكتبتي`,N(`div`,{},r,n),{wide:!0})}var Vr=()=>({});function Hr(e){Vr=e}var Ur=[],Wr=[`#1b1b1b`,`#ffffff`,`#c9a227`,`#8b5a2b`,`#7a1f1f`,`#0f5132`,`#0b3d91`,`#5b2a86`,`#d4af37`,`#b87333`,`#2f4f4f`,`#e8dcc0`],Gr=[{name:`ذهبي`,colors:[`#fff3c4`,`#f2d27a`,`#d4af37`,`#b8860b`,`#7a5a00`,`#3b2a00`]},{name:`عثماني`,colors:[`#7a1f1f`,`#0f5132`,`#0b3d91`,`#c9a227`,`#e8dcc0`,`#1b1b1b`]},{name:`حبر وورق`,colors:[`#111111`,`#3a3a3a`,`#8a7f6a`,`#e8dcc0`,`#f7f1e3`,`#ffffff`]},{name:`حديث`,colors:[`#ff5a5f`,`#ffb400`,`#00a699`,`#007a87`,`#5b2a86`,`#222222`]}],Kr=[{name:`حبر أسود`,style:{fills:[{type:`solid`,color:`#111111`,opacity:1}],strokes:[],shadow:null,glow:null,extrude:null,contour:null}},{name:`ذهب مذهّب`,style:{fills:[{type:`linear`,angle:90,stops:[{offset:0,color:`#fff3c4`},{offset:.45,color:`#d4af37`},{offset:1,color:`#7a5a00`}]}],strokes:[{color:`#3b2a00`,width:3,align:`outside`,cap:`round`,join:`round`}],shadow:{dx:4,dy:6,blur:5,color:`#000000`,opacity:.35},glow:null,extrude:null,contour:null}},{name:`حد ذهبي وأسود`,style:{fills:[{type:`solid`,color:`#0b3d91`,opacity:1}],strokes:[{color:`#111111`,width:4,align:`outside`,cap:`round`,join:`round`},{color:`#d4af37`,width:6,align:`outside`,cap:`round`,join:`round`}],shadow:null,glow:null,extrude:null,contour:null}},{name:`توهج`,style:{fills:[{type:`solid`,color:`#fffbe6`,opacity:1}],strokes:[],shadow:null,glow:{blur:10,color:`#ffc400`,opacity:.95,strength:2},extrude:null,contour:null}},{name:`بارز`,style:{fills:[{type:`linear`,angle:90,stops:[{offset:0,color:`#e8dcc0`},{offset:1,color:`#b8a888`}]}],strokes:[],shadow:null,glow:null,extrude:{depth:14,angle:45,color:`#5c4a2a`},contour:null}},{name:`خطوط متكررة`,style:{fills:[{type:`solid`,color:`#7a1f1f`,opacity:1}],strokes:[],shadow:null,glow:null,extrude:null,contour:{count:3,distance:9,width:2,color:`#7a1f1f`,direction:`out`}}},{name:`نقش منقّط`,style:{fills:[{type:`pattern`,pattern:`dots`,color:`#d4af37`,bg:`#0f5132`,scale:14}],strokes:[{color:`#d4af37`,width:2,align:`outside`,cap:`round`,join:`round`}],shadow:null,glow:null,extrude:null,contour:null}}];function qr(e,t=[]){return N(`div`,{class:`swatches`},[...t,...Wr].map(t=>N(`button`,{type:`button`,class:`sw`,style:{background:t},title:t,"aria-label":t,onClick:()=>e(t)})))}var Jr=e=>e.type===`solid`?e.color:e.stops?.[0]?.color||e.color||`#000000`;function Yr(e,t){let n=t[0].style,r=e=>t.forEach(t=>t.style&&e(t.style)),i=()=>e.render(),a=(t=`تنسيق`)=>{e.preview(t),e.render({panels:!0})},o=n.fills||[],s=n.strokes||[],c=Z(`أنماط جاهزة`,N(`div`,{class:`presets`},Kr.map(e=>N(`button`,{type:`button`,class:`preset`,onClick:()=>{r(t=>Object.assign(t,JSON.parse(JSON.stringify(e.style)))),a(`نمط جاهز`)}},N(`span`,{class:`pv`,style:Xr(e.style)},`خط`),N(`small`,{},e.name))),Y.styles.map(t=>N(`div`,{class:`preset mine`},N(`button`,{type:`button`,class:`pbody`,onClick:()=>{r(e=>Object.assign(e,JSON.parse(JSON.stringify(t.style)))),a(`نمط من مكتبتي`)}},N(`span`,{class:`pv`,style:Xr(t.style)},`خط`),N(`small`,{},t.name)),N(`button`,{type:`button`,class:`libdel`,title:`حذف من مكتبتي`,"aria-label":`حذف من مكتبتي`,onClick:()=>jr(e,t.id)},`×`))),N(`button`,{type:`button`,class:`preset add`,title:`احفظ تنسيق المحدد في مكتبتي`,onClick:()=>Ar(e,n)},N(`span`,{class:`pv`},`+`),N(`small`,{},`حفظ نمطي`)))),l=Z(`التعبئة`,...o.map((n,o)=>Zr(e,t,n,o,r,i,a)),Q(F(`plus`,o.length?`تعبئة إضافية`:`إضافة تعبئة`,()=>{r(e=>{e.fills=e.fills||[],e.fills.unshift({type:`solid`,color:`#1b1b1b`,opacity:1})}),a(`إضافة تعبئة`)},{class:`small`}),o.length?F(null,`بلا تعبئة`,()=>{r(e=>{e.fills=[]}),a(`بلا تعبئة`)},{class:`small`}):null),o.length>1?N(`p`,{class:`hint`},`التعبئة الأولى في القائمة هي الأعلى.`):null),u=Z(`الحدود (يمكن أكثر من حد)`,...s.map((t,n)=>N(`div`,{class:`subcard`},Q(z(`اللون`,H(t.color,e=>{r(t=>{t.strokes[n]&&(t.strokes[n].color=e)}),a(`لون الحد`)},{onInput:e=>{r(t=>{t.strokes[n]&&(t.strokes[n].color=e)}),i()}})),z(`الموضع`,U([[`outside`,`خارج`],[`center`,`منتصف`],[`inside`,`داخل`]],t.align||`center`,e=>{r(t=>{t.strokes[n]&&(t.strokes[n].align=e)}),a(`موضع الحد`)})),F(`up`,`للأعلى`,()=>{r(e=>{n>0&&([e.strokes[n-1],e.strokes[n]]=[e.strokes[n],e.strokes[n-1]])}),a(`ترتيب الحدود`)},{iconOnly:!0,class:`ghost small`,disabled:n===0}),F(`trash`,`حذف الحد`,()=>{r(e=>e.strokes.splice(n,1)),a(`حذف حد`)},{iconOnly:!0,class:`ghost small`})),B(`السماكة`,t.width,{min:.5,max:80,step:.5,onInput:e=>{r(t=>{t.strokes[n]&&(t.strokes[n].width=e)}),i()},onChange:()=>e.preview(`سماكة`)}),Q(z(`النهايات`,U([[`round`,`مستديرة`],[`butt`,`مقطوعة`],[`square`,`مربعة`]],t.cap||`round`,e=>{r(t=>{t.strokes[n]&&(t.strokes[n].cap=e)}),a(`نهايات`)})),z(`الزوايا`,U([[`round`,`مستديرة`],[`miter`,`حادة`],[`bevel`,`مشطوفة`]],t.join||`round`,e=>{r(t=>{t.strokes[n]&&(t.strokes[n].join=e)}),a(`زوايا`)})),z(`متقطع`,U([[``,`متصل`],[`8 6`,`شرطات`],[`1 6`,`نقاط`],[`18 8 2 8`,`شرطة ونقطة`]],t.dash||``,e=>{r(t=>{t.strokes[n]&&(t.strokes[n].dash=e||null)}),a(`تقطيع`)}))))),Q(F(`plus`,s.length?`حدّ إضافي`:`إضافة حدّ`,()=>{r(e=>{e.strokes=e.strokes||[],e.strokes.push({color:e.strokes.length?`#d4af37`:`#111111`,width:e.strokes.length?6:4,align:`outside`,cap:`round`,join:`round`})}),a(`إضافة حد`)},{class:`small`})),s.length>1?N(`p`,{class:`hint`},`الحدود الخارجية تتراكم: الأول ملاصق للشكل والذي بعده حوله، فتصنع «حد ذهبي داخله حد أسود».`):null),d=Qr(e,t,n,r,i,a),f=B(`شفافية العنصر`,Math.round((n.opacity??1)*100),{min:0,max:100,unit:`%`,onInput:e=>{r(t=>{t.opacity=e/100}),i()},onChange:()=>e.preview(`شفافية`)});return N(`div`,{},c,l,u,...d,$r(e,t,r,a),...Ur.map(n=>n(e,t)).filter(Boolean),Z(``,f))}Hr(e=>Xr(e));function Xr(e){let t=e.fills?.[0],n=`#111`,r=`transparent`;t?.type===`solid`&&(n=t.color),t?.type===`linear`&&(r=`linear-gradient(${180-(t.angle??90)+90}deg, ${t.stops.map(e=>`${e.color} ${e.offset*100}%`).join(`,`)})`),t?.type===`pattern`&&(n=t.color),(e.strokes||[]).map(e=>`0 0 0 ${e.width/3}px ${e.color}`);let i={color:n,textShadow:[e.glow?`0 0 8px ${e.glow.color}`:null,e.shadow?`2px 3px 3px rgba(0,0,0,.4)`:null,e.extrude?`2px 2px 0 ${e.extrude.color}, 4px 4px 0 ${e.extrude.color}`:null].filter(Boolean).join(`,`)||`none`,WebkitTextStroke:e.strokes?.[0]?`1px ${e.strokes[e.strokes.length-1].color}`:``};return r!==`transparent`&&Object.assign(i,{backgroundImage:r,WebkitBackgroundClip:`text`,backgroundClip:`text`,color:`transparent`}),i}function Zr(e,t,n,r,i,a,o){let s=(e,t)=>{i(t=>{t.fills[r]&&Object.assign(t.fills[r],e)}),t?o(`تعبئة`):a()},c=[[`solid`,`لون`],[`linear`,`تدرج خطي`],[`radial`,`تدرج دائري`],[`pattern`,`نقش`],[`image`,`صورة داخل الحرف`]],l=e=>{let t=Jr(n),a=e===`solid`?{type:`solid`,color:t,opacity:n.opacity??1}:e===`linear`||e===`radial`?{type:e,angle:90,stops:n.stops||[{offset:0,color:`#f2d27a`},{offset:1,color:t===`#1b1b1b`?`#7a5a00`:t}]}:e===`pattern`?{type:`pattern`,pattern:`dots`,color:`#d4af37`,bg:t,scale:16}:{type:`image`,src:n.src||null};i(e=>{e.fills[r]=JSON.parse(JSON.stringify(a))}),o(`نوع التعبئة`),e===`image`&&!a.src&&u()},u=async()=>{let[e]=await W(`image/*`);if(!e)return;let t=await new Promise(t=>{let n=new FileReader;n.onload=()=>t(n.result),n.readAsDataURL(e)});s({src:t},!0)},d=[Q(z(`النوع`,U(c,n.type,l)),F(n.visible===!1?`eyeOff`:`eye`,`إظهار/إخفاء`,()=>s({visible:n.visible===!1},!0),{iconOnly:!0,class:`ghost small`}),r>0?F(`up`,`للأعلى`,()=>{i(e=>{[e.fills[r-1],e.fills[r]]=[e.fills[r],e.fills[r-1]]}),o(`ترتيب التعبئة`)},{iconOnly:!0,class:`ghost small`}):null,F(`trash`,`حذف`,()=>{i(e=>e.fills.splice(r,1)),o(`حذف تعبئة`)},{iconOnly:!0,class:`ghost small`}))];if(n.type===`solid`&&(d.push(Q(z(`اللون`,H(n.color,e=>s({color:e},!0),{onInput:e=>s({color:e})})),z(`الشفافية`,B(``,Math.round((n.opacity??1)*100),{min:0,max:100,onInput:e=>s({opacity:e/100}),onChange:()=>e.preview(`شفافية`)})))),d.push(qr(e=>s({color:e},!0)))),n.type===`linear`||n.type===`radial`){let t=n.stops||[];d.push(N(`div`,{class:`gradbar`,style:{background:`linear-gradient(to left, ${t.map(e=>`${e.color} ${e.offset*100}%`).join(`,`)})`}})),t.forEach((n,s)=>d.push(Q(z(`لون ${s+1}`,H(n.color,e=>{i(t=>{t.fills[r].stops[s].color=e}),o(`تدرج`)},{onInput:e=>{i(t=>{t.fills[r].stops[s].color=e}),a()}})),z(`الموضع`,B(``,Math.round(n.offset*100),{min:0,max:100,unit:`%`,onInput:e=>{i(t=>{t.fills[r].stops[s].offset=e/100}),a()},onChange:()=>e.preview(`تدرج`)})),t.length>2?F(`minus`,`حذف اللون`,()=>{i(e=>e.fills[r].stops.splice(s,1)),o(`تدرج`)},{iconOnly:!0,class:`ghost small`}):null))),d.push(Q(t.length<6?F(`plus`,`لون في التدرج`,()=>{i(e=>{e.fills[r].stops.push({offset:1,color:`#ffffff`}),e.fills[r].stops.sort((e,t)=>e.offset-t.offset)}),o(`تدرج`)},{class:`small`}):null,F(null,`عكس`,()=>{i(e=>{e.fills[r].stops=e.fills[r].stops.map(e=>({...e,offset:1-e.offset})).reverse()}),o(`عكس التدرج`)},{class:`small`}))),n.type===`linear`?d.push(B(`زاوية التدرج`,n.angle??90,{min:0,max:360,unit:`°`,onInput:e=>s({angle:e}),onChange:()=>e.preview(`زاوية`)})):d.push(B(`اتساع التدرج`,Math.round((n.r??.6)*100),{min:10,max:150,unit:`%`,onInput:e=>s({r:e/100}),onChange:()=>e.preview(`اتساع`)}))}return n.type===`pattern`&&(d.push(Q(z(`النقش`,U(Object.keys(ne).map(e=>[e,{dots:`نقاط`,stripes:`خطوط`,diagonal:`مائل`,grid:`شبكة`,diamonds:`معيّنات`,stars:`نجوم ثمانية`}[e]||e]),n.pattern,e=>s({pattern:e},!0))),z(`لون النقش`,H(n.color,e=>s({color:e},!0),{onInput:e=>s({color:e})})),z(`الأرضية`,H(n.bg||`#ffffff`,e=>s({bg:e},!0),{onInput:e=>s({bg:e})})))),d.push(B(`حجم النقش`,n.scale||16,{min:4,max:120,onInput:e=>s({scale:e}),onChange:()=>e.preview(`حجم النقش`)})),d.push(B(`دوران النقش`,n.rotate||0,{min:0,max:180,unit:`°`,onInput:e=>s({rotate:e}),onChange:()=>e.preview(`دوران النقش`)}))),n.type===`image`&&d.push(Q(n.src?N(`img`,{src:n.src,class:`fillthumb`,alt:``}):null,F(`image`,n.src?`تبديل الصورة`:`اختيار صورة`,u,{class:`small`}))),N(`div`,{class:`subcard`},...d)}function Qr(e,t,n,r,i,a){let o=(e,t,i)=>F(n[e]?`check`:`plus`,i,()=>{r(n=>{n[e]=n[e]?null:JSON.parse(JSON.stringify(t))}),a(i)},{active:!!n[e],class:`toggle small`}),s=(t,a,o,s)=>B(o,n[t][a]??s.def??0,{...s,onInput:e=>{r(n=>{n[t]&&(n[t][a]=e)}),i()},onChange:()=>e.preview(o)}),c=(e,t,o)=>z(o,H(n[e][t],n=>{r(r=>{r[e]&&(r[e][t]=n)}),a(o)},{onInput:n=>{r(r=>{r[e]&&(r[e][t]=n)}),i()}})),l=[];return l.push(Z(`تأثيرات`,Q(o(`contour`,{count:3,distance:8,width:2,color:`#7a1f1f`,direction:`out`},`Contour (حدود متكررة)`),o(`shadow`,{dx:6,dy:8,blur:6,color:`#000000`,opacity:.4},`ظل`),o(`glow`,{blur:10,color:`#ffc400`,opacity:.9,strength:1},`توهج`),o(`extrude`,{depth:12,angle:45,color:`#4a3b22`},`تجسيم (بروز)`)),n.contour?N(`div`,{class:`subcard`},N(`strong`,{},`Contour`),Q(z(`الاتجاه`,U([[`out`,`للخارج`],[`in`,`للداخل`]],n.contour.direction||`out`,e=>{r(t=>{t.contour&&(t.contour.direction=e)}),a(`اتجاه`)})),c(`contour`,`color`,`اللون`)),s(`contour`,`count`,`العدد`,{min:1,max:12}),s(`contour`,`distance`,`المسافة`,{min:2,max:60,step:.5}),s(`contour`,`width`,`سماكة الخط`,{min:.5,max:20,step:.5})):null,n.shadow?N(`div`,{class:`subcard`},N(`strong`,{},`الظل`),Q(c(`shadow`,`color`,`اللون`)),s(`shadow`,`dx`,`إزاحة أفقية`,{min:-60,max:60}),s(`shadow`,`dy`,`إزاحة رأسية`,{min:-60,max:60}),s(`shadow`,`blur`,`التمويه`,{min:0,max:40}),B(`الكثافة`,Math.round((n.shadow.opacity??.4)*100),{min:0,max:100,unit:`%`,onInput:e=>{r(t=>{t.shadow&&(t.shadow.opacity=e/100)}),i()},onChange:()=>e.preview(`ظل`)})):null,n.glow?N(`div`,{class:`subcard`},N(`strong`,{},`التوهج`),Q(c(`glow`,`color`,`اللون`)),s(`glow`,`blur`,`الانتشار`,{min:1,max:50}),s(`glow`,`strength`,`القوة`,{min:1,max:3})):null,n.extrude?N(`div`,{class:`subcard`},N(`strong`,{},`التجسيم`),Q(c(`extrude`,`color`,`لون الجانب`)),s(`extrude`,`depth`,`العمق`,{min:1,max:80}),s(`extrude`,`angle`,`الزاوية`,{min:0,max:360,unit:`°`})):null)),l}function $r(e,t,n,r){let i=e.palette||[],a=async t=>{e.palette=t,await A.setMisc(`palette`,t),e.render({panels:!0})},o=e=>{n(t=>{t.fills=[{type:`solid`,color:e,opacity:1},...(t.fills||[]).slice(1)]}),r(`لون من المكتبة`)},s=t[0].style.fills?.[0]?Jr(t[0].style.fills[0]):null;return Z(`مكتبة الألوان`,N(`div`,{class:`palrow`},N(`small`,{},`لوحتي`),N(`div`,{class:`swatches`},i.map((e,t)=>N(`button`,{type:`button`,class:`sw`,style:{background:e},title:`${e} — ضغطة مطوّلة للحذف`,onClick:()=>o(e),onContextmenu:e=>{e.preventDefault(),a(i.filter((e,n)=>n!==t)),I(`حُذف اللون من لوحتك`)}})),s?N(`button`,{type:`button`,class:`sw add`,title:`أضف اللون الحالي إلى لوحتي`,onClick:()=>{i.includes(s)||a([...i,s]),I(`أُضيف اللون إلى لوحتك`)}},`+`):null)),...Gr.map(e=>N(`div`,{class:`palrow`},N(`small`,{},e.name),N(`div`,{class:`swatches`},e.colors.map(e=>N(`button`,{type:`button`,class:`sw`,style:{background:e},title:e,onClick:()=>o(e)}))))),N(`p`,{class:`hint`},`الضغط المطوّل (أو الزر الأيمن) على لون في «لوحتي» يحذفه.`))}var ei=[];function ti(e){ei.push(e)}function Z(e,...t){return N(`section`,{class:`psec`},e?N(`h3`,{},e):null,...t)}var Q=(...e)=>N(`div`,{class:`brow`},...e);function ni(e,t){let n=e.selected;if(t.innerHTML=``,!n.length){t.append(ii(e));return}let r=n.length===1?n[0]:null,i=[];i.push(N(`div`,{class:`phead`},N(`strong`,{},r?r.name||ri(r):`${n.length} عناصر`),r?N(`small`,{},ri(r)):null)),r?.type===`text`&&i.push(si(e,r)),r?.live&&i.push(Z(`النسخة الحيّة`,N(`p`,{class:`hint`},`هذا الشكل محفوظة معه نسخة حيّة مخفية من النص.`),Q(F(`restore`,`عودة للنسخة الحيّة`,()=>fi(e,r)))));for(let t of ei){let r=t(e,n);r&&i.push(r)}let a=n.filter(e=>e.style);a.length&&i.push(Yr(e,a)),i.push(pi(e,n)),i.push(mi(e,n)),t.append(...i)}function ri(e){return{text:`نص حيّ`,path:`شكل متجهي`,letters:`حروف حيّة`,image:`صورة`,group:`مجموعة`,kufi:`كوفي مربع`}[e.type]||e.type}function ii(e){let t=e.doc,n=[[`1080x1080`,`مربع 1080`],[`1080x1350`,`عمودي 1080×1350`],[`1920x1080`,`أفقي 1920×1080`],[`2480x3508`,`A4 للطباعة`],[`4000x4000`,`كبير 4000`],[`custom`,`مخصص`]],r=`${t.width}x${t.height}`,i=N(`input`,{type:`number`,value:t.width,class:`num`,min:50,max:2e4}),a=N(`input`,{type:`number`,value:t.height,class:`num`,min:50,max:2e4}),o=(n,r)=>{t.width=+n,t.height=+r,e.commit(`حجم اللوحة`),e.emit(`project`),e.render({panels:!0})};i.addEventListener(`change`,()=>o(i.value,a.value)),a.addEventListener(`change`,()=>o(i.value,a.value));let s=e.settings,c=(t,n,r)=>F(r,n,()=>{s[t]=!s[t],e.saveSettings?.(),e.render({panels:!0})},{active:s[t],class:`toggle`});return N(`div`,{},N(`div`,{class:`phead`},N(`strong`,{},`اللوحة`),N(`small`,{},`لا يوجد عنصر محدد`)),Z(`المقاس`,z(`قالب`,U(n,n.some(([e])=>e===r)?r:`custom`,e=>{if(e!==`custom`){let[t,n]=e.split(`x`);o(t,n)}})),Q(z(`العرض`,i),z(`الارتفاع`,a))),Z(`الخلفية`,Q(F(null,`شفافة`,()=>{t.background=null,e.commit(`خلفية`),e.render({panels:!0})},{active:!t.background,class:`toggle`}),z(`لون`,H(t.background||`#ffffff`,n=>{t.background=n,e.commit(`خلفية`),e.render({panels:!0})},{onInput:n=>{t.background=n,e.render()}})))),Z(`أدوات مساعدة`,Q(c(`grid`,`شبكة`,`grid`),c(`rulers`,`مساطر`,`ruler`),c(`snap`,`التقاط`,`magnet`)),B(`حجم الشبكة`,s.gridSize,{min:5,max:200,step:5,onInput:t=>{s.gridSize=t,e.render()},onChange:()=>e.saveSettings?.()}),Q(F(`guide`,`دليل رأسي`,()=>{t.guides.push({axis:`x`,pos:t.width/2}),e.commit(`دليل`),e.render()}),F(`guide`,`دليل أفقي`,()=>{t.guides.push({axis:`y`,pos:t.height/2}),e.commit(`دليل`),e.render()}),t.guides.length?F(`trash`,`حذف الأدلة`,()=>{t.guides=[],e.commit(`أدلة`),e.render({panels:!0})}):null),N(`p`,{class:`hint`},`اسحب من المسطرة لإضافة دليل، وأعِده إليها لحذفه.`)),ai(e),N(`p`,{class:`hint`},`ابدأ بأداة «كتابة» ثم المس اللوحة.`))}function ai(e){let t=e.doc,n=t.reference,r=async()=>{let[n]=await W(`image/*`);if(!n)return;let r=await oi(n),i=await $(r),a=Math.min(t.width/i.width,t.height/i.height);t.reference={src:r,w:i.width*a,h:i.height*a,x:(t.width-i.width*a)/2,y:(t.height-i.height*a)/2,opacity:.35,visible:!0},e.commit(`صورة مرجعية`),e.render({panels:!0})};return Z(`صورة مرجعية (لا تُصدَّر)`,n?N(`div`,{},B(`الشفافية`,Math.round((n.opacity??.35)*100),{min:5,max:100,unit:`%`,onInput:t=>{n.opacity=t/100,e.render()},onChange:()=>e.commit(`مرجع`)}),B(`الحجم`,100,{min:10,max:300,unit:`%`,onChange:t=>{let r=n.x+n.w/2,i=n.y+n.h/2;n.w*=t/100,n.h*=t/100,n.x=r-n.w/2,n.y=i-n.h/2,e.commit(`مرجع`),e.render({panels:!0})}}),Q(F(n.visible===!1?`eyeOff`:`eye`,n.visible===!1?`إظهار`:`إخفاء`,()=>{n.visible=n.visible===!1,e.commit(`مرجع`),e.render({panels:!0})}),F(`image`,`تبديل`,r),F(`trash`,`إزالة`,()=>{t.reference=null,e.commit(`مرجع`),e.render({panels:!0})}))):Q(F(`image`,`اختيار صورة مرجعية`,r)))}function oi(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(r.result),r.onerror=n,r.readAsDataURL(e)})}function $(e){return new Promise((t,n)=>{let r=new Image;r.onload=()=>t(r),r.onerror=n,r.src=e})}function si(e,t){let n=N(`textarea`,{rows:3,dir:`rtl`,class:`textedit`,value:t.text,spellcheck:!1,placeholder:`اكتب النص هنا…`});n.addEventListener(`input`,()=>{K(t,()=>{t.text=n.value,li(t)}),e.render()}),n.addEventListener(`change`,()=>{e.commit(`تعديل النص`)}),n.addEventListener(`blur`,()=>{e.commit(`تعديل النص`)});let r=pe(t.fontId),i=de(t.fontId),a=(n,r)=>r=>{K(t,()=>{t[n]=r}),e.lastTextProps={...e.lastTextProps||{},[n]:r},e.render()},o=t=>()=>e.commit(t),s=i?.altFeatures?.filter(e=>/^(ss\d\d|salt|swsh|cv\d\d)$/.test(e))||[];return N(`div`,{},Z(`النص`,n,Q(F(null,`إضافة تشكيل`,()=>ui(n,t,e),{class:`small`}),F(null,`إزالة التشكيل`,()=>{K(t,()=>{t.text=t.text.replace(RegExp(`[ً-ْٰ]`,`g`),``),li(t)}),e.commit(`إزالة التشكيل`),e.render({panels:!0})},{class:`small`}))),Z(`الخط`,N(`button`,{class:`fontbtn`,type:`button`,onClick:()=>gr(e,t)},P(`font`),N(`span`,{},r.name),N(`small`,{},r.style)),B(`الحجم`,t.size,{min:8,max:1200,step:1,unit:`بكسل`,onInput:a(`size`),onChange:o(`حجم الخط`)}),B(`تباعد الحروف`,t.letterSpacing,{min:-200,max:1e3,step:5,unit:`‰`,onInput:a(`letterSpacing`),onChange:o(`تباعد`)}),B(`تباعد الكلمات`,t.wordSpacing,{min:-300,max:2e3,step:10,unit:`‰`,onInput:a(`wordSpacing`),onChange:o(`تباعد الكلمات`)}),B(`ارتفاع السطر`,t.lineHeight,{min:.6,max:4,step:.05,onInput:a(`lineHeight`),onChange:o(`ارتفاع السطر`)}),Q(...[[`right`,`txtRight`,`يمين`],[`center`,`txtCenter`,`وسط`],[`left`,`txtLeft`,`يسار`]].map(([n,r,i])=>F(r,i,()=>{t.align=n,e.commit(`محاذاة`),e.render({panels:!0})},{active:t.align===n,class:`toggle small`})))),Z(`التطويل (الكشيدة)`,N(`p`,{class:`hint`},`اضغط «مقابض التطويل» ثم اسحب المقبض بين حرفين متصلين لمدّ الوصلة؛ تُرسم الكشيدة منحنية.`),Q(F(`kashida`,`مقابض التطويل`,()=>e.setTool(e.tool===`kashida`?`select`:`kashida`),{active:e.tool===`kashida`,class:`toggle`}),Object.keys(t.kashida||{}).length?F(`restore`,`إلغاء التطويل`,()=>{K(t,()=>{t.kashida={}}),e.commit(`إلغاء التطويل`),e.render({panels:!0})}):null),B(`انحناء الكشيدة`,t.kashidaCurve??.5,{min:0,max:1.5,step:.05,onInput:n=>{t.kashidaCurve=n,e.render()},onChange:o(`انحناء الكشيدة`)})),s.length?Z(`أشكال بديلة في الخط`,N(`p`,{class:`hint`},`مجموعات أسلوبية يوفّرها هذا الخط، تُطبَّق على النص كله. للتطبيق على حرف واحد استعمل «فكّ الكلمة».`),N(`div`,{class:`chips`},s.map(n=>{let r=t.features.includes(n);return N(`button`,{type:`button`,class:`chip ${r?`on`:``}`,onClick:()=>{K(t,()=>{t.features=r?t.features.filter(e=>e!==n):[...t.features,n]}),e.commit(`شكل بديل`),e.render({panels:!0})}},ci(n))}))):null,Z(`تحويل`,N(`label`,{class:`check`},N(`input`,{type:`checkbox`,checked:e.settings.keepLive,onChange:t=>{e.settings.keepLive=t.target.checked,e.saveSettings?.()}}),`احتفظ بنسخة حيّة مخفية`),Q(F(`outline`,`تحويل إلى أشكال`,()=>di(e),{class:`primary`}))))}function ci(e){return/^ss\d\d$/.test(e)?`مجموعة ${+e.slice(2)}`:{salt:`بديل`,swsh:`زخرفي`,jalt:`نهاية بديلة`}[e]||e}function li(e){if(e.kashida)for(let t of Object.keys(e.kashida))+t>=e.text.length-1&&delete e.kashida[t]}function ui(e,t,n){let r=[[`َ`,`فتحة`],[`ُ`,`ضمة`],[`ِ`,`كسرة`],[`ْ`,`سكون`],[`ّ`,`شدّة`],[`ً`,`تنوين فتح`],[`ٌ`,`تنوين ضم`],[`ٍ`,`تنوين كسر`],[`ٰ`,`ألف خنجرية`],[`ـ`,`تطويل ـ`]],i=e.parentElement.querySelector(`.tashkeel`);if(i){i.remove();return}let a=r=>{let i=e.selectionEnd??e.value.length;e.value=e.value.slice(0,i)+r+e.value.slice(i),e.focus(),e.selectionStart=e.selectionEnd=i+r.length,K(t,()=>{t.text=e.value}),n.render(),n.commit(`تشكيل`)};e.after(N(`div`,{class:`chips tashkeel`},N(`small`,{class:`hint`},`ضع المؤشر بعد الحرف ثم اختر:`),r.map(([e,t])=>N(`button`,{type:`button`,class:`chip big`,onClick:()=>a(e),title:t},N(`span`,{class:`mk`},`ـ${e}`),N(`small`,{},t)))))}function di(e){let t=[];for(let n of e.selected){if(n.type===`path`||n.type===`image`||n.type===`group`){t.push(n.id);continue}let r=d(n,{keepLive:e.settings.keepLive});e.replace(n.id,r),t.push(r.id)}e.selection=t,e.commit(`تحويل إلى أشكال`),I(`تم التحويل إلى أشكال. يمكنك الآن تعديل النقاط.`),e.render({panels:!0})}async function fi(e,t){let n=JSON.parse(JSON.stringify(t.live));n.m=t.m.slice(),n.id=y(n.type[0]),await T(n.fontId||`amiri`).catch(()=>{}),e.replace(t.id,n),e.selection=[n.id],e.commit(`عودة للنسخة الحيّة`),I(`عادت النسخة الحيّة (تعديلات الأشكال لم تنتقل إليها)`),e.render({panels:!0})}function pi(r,i){let a=n(i.map(C)),o=i.length===1?i[0]:null,c=o?t(o.m):null,l=(e,t)=>{i.forEach(t=>{t.m=s(e,t.m)}),r.commit(t),r.render({panels:!0})},u=e=>Math.round(e*10)/10,d=N(`input`,{type:`number`,class:`num`,value:u(a.x)}),f=N(`input`,{type:`number`,class:`num`,value:u(a.y)}),p=N(`input`,{type:`number`,class:`num`,value:u(a.w),min:1}),h=N(`input`,{type:`number`,class:`num`,value:u(a.h),min:1}),g=N(`input`,{type:`number`,class:`num`,value:c?u(c.rot):0,step:1});d.onchange=()=>l(e(+d.value-a.x,0),`موضع`),f.onchange=()=>l(e(0,+f.value-a.y),`موضع`),p.onchange=()=>{let e=+p.value/a.w;l(m(e,r.settings.keepRatio?e:1,a.x,a.y),`حجم`)},h.onchange=()=>{let e=+h.value/a.h;l(m(r.settings.keepRatio?e:1,e,a.x,a.y),`حجم`)},g.onchange=()=>l(ee(+g.value-(c?c.rot:0),a.x+a.w/2,a.y+a.h/2),`تدوير`);let _=a.x+a.w/2,v=a.y+a.h/2,y=r.doc.width,te=r.doc.height,b=(e,t)=>()=>{if(i.length>1)i.forEach(t=>{let n=C(t);t.m=s(e(n,a),t.m)});else{let t={x:0,y:0,w:y,h:te};i.forEach(n=>{let r=C(n);n.m=s(e(r,t),n.m)})}r.commit(t),r.render({panels:!0})},ne=t=>()=>{let n=i.map(e=>({o:e,b:C(e)})).sort((e,n)=>t===`x`?e.b.x-n.b.x:e.b.y-n.b.y);if(n.length<3)return I(`التوزيع يحتاج ثلاثة عناصر أو أكثر`);let a=n[0].b,o=n[n.length-1].b,c=t===`x`?a.x+a.w/2:a.y+a.h/2,l=t===`x`?o.x+o.w/2:o.y+o.h/2;n.forEach(({o:r,b:i},a)=>{let o=c+(l-c)*a/(n.length-1),u=t===`x`?i.x+i.w/2:i.y+i.h/2;r.m=s(t===`x`?e(o-u,0):e(0,o-u),r.m)}),r.commit(`توزيع`),r.render({panels:!0})};return Z(`الموضع والحجم`,Q(z(`س`,d),z(`ص`,f)),Q(z(`العرض`,p),z(`الارتفاع`,h),z(`الدوران°`,g)),N(`label`,{class:`check`},N(`input`,{type:`checkbox`,checked:r.settings.keepRatio,onChange:e=>{r.settings.keepRatio=e.target.checked,r.saveSettings?.()}}),`حافظ على النسبة`),Q(F(`flipH`,`قلب أفقي`,()=>l(m(-1,1,_,v),`قلب`)),F(`flipV`,`قلب رأسي`,()=>l(m(1,-1,_,v),`قلب`)),F(`rotate`,`90°`,()=>l(ee(90,_,v),`تدوير`))),N(`h4`,{},i.length>1?`محاذاة العناصر معًا`:`محاذاة إلى اللوحة`),Q(F(`alignR`,`يمين`,b((t,n)=>e(n.x+n.w-(t.x+t.w),0),`محاذاة`),{iconOnly:!0}),F(`alignCH`,`وسط أفقي`,b((t,n)=>e(n.x+n.w/2-(t.x+t.w/2),0),`محاذاة`),{iconOnly:!0}),F(`alignL`,`يسار`,b((t,n)=>e(n.x-t.x,0),`محاذاة`),{iconOnly:!0}),F(`alignT`,`أعلى`,b((t,n)=>e(0,n.y-t.y),`محاذاة`),{iconOnly:!0}),F(`alignCV`,`وسط رأسي`,b((t,n)=>e(0,n.y+n.h/2-(t.y+t.h/2)),`محاذاة`),{iconOnly:!0}),F(`alignB`,`أسفل`,b((t,n)=>e(0,n.y+n.h-(t.y+t.h)),`محاذاة`),{iconOnly:!0})),i.length>2?Q(F(`distH`,`توزيع أفقي`,ne(`x`)),F(`distV`,`توزيع رأسي`,ne(`y`))):null)}function mi(e,t){return Z(`الترتيب والعمق`,Q(F(`front`,`أعلى الكل`,()=>e.arrange(`top`),{iconOnly:!0}),F(`up`,`إلى الأمام`,()=>e.arrange(`up`),{iconOnly:!0}),F(`down`,`إلى الخلف`,()=>e.arrange(`down`),{iconOnly:!0}),F(`back`,`أسفل الكل`,()=>e.arrange(`bottom`),{iconOnly:!0})),Q(F(`copy`,`تكرار`,()=>e.duplicateSelection()),F(`trash`,`حذف`,()=>e.deleteSelection(),{class:`danger`})),t.some(e=>e.type!==`path`&&e.type!==`image`&&e.type!==`group`&&e.type!==`text`)?Q(F(`outline`,`تحويل إلى أشكال`,()=>di(e))):null,t.length>1?Q(F(`group`,`تجميع`,()=>e.emit(`group`))):null,t.length===1&&t[0].type===`group`?Q(F(`ungroup`,`فك التجميع`,()=>e.emit(`ungroup`))):null)}function hi(e,t){t.innerHTML=``;let n=e.doc.objects,r=N(`ul`,{class:`layers`});t.append(N(`div`,{class:`layer-tools`},F(`plus`,`طبقة نص جديدة`,()=>e.emit(`newTextLayer`),{iconOnly:!0,class:`small`}),F(`copy`,`تكرار الطبقة`,()=>e.duplicateSelection(),{iconOnly:!0,class:`small`,disabled:!e.selection.length}),F(`trash`,`حذف الطبقات المحددة`,()=>e.deleteSelection(),{iconOnly:!0,class:`small danger`,disabled:!e.selection.length}))),n.length||t.append(N(`p`,{class:`hint`},`لا توجد طبقات بعد.`)),[...n].reverse().forEach(t=>{let n=e.selection.includes(t.id),i=N(`span`,{class:`lname`,title:`لمستان لإعادة التسمية`},t.name||ri(t));i.addEventListener(`dblclick`,()=>{let n=N(`input`,{value:t.name||``,class:`rename`});i.replaceWith(n),n.focus(),n.select(),n.addEventListener(`blur`,()=>{t.name=n.value.trim()||t.name,e.commit(`إعادة تسمية`),e.render({panels:!0})}),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&n.blur()})});let a=N(`li`,{class:`layer ${n?`sel`:``} ${t.visible===!1?`hidden`:``}`,"data-id":t.id},N(`span`,{class:`grip`,title:`اسحب لتغيير الترتيب`},P(`grip`,22)),N(`span`,{class:`ltype`},P({text:`text`,path:`nodes`,letters:`explode`,image:`image`,group:`group`,kufi:`kufi`}[t.type]||`square`,20)),i,t.live?N(`span`,{class:`badge-live`,title:`معه نسخة حيّة مخفية`},`حيّ`):null,F(t.visible===!1?`eyeOff`:`eye`,t.visible===!1?`إظهار`:`إخفاء`,n=>{n.stopPropagation(),t.visible=t.visible===!1,e.commit(`إظهار/إخفاء`),e.render({panels:!0})},{iconOnly:!0,class:`ghost small`,size:22}),F(t.locked?`lock`:`unlock`,t.locked?`فك القفل`:`قفل`,n=>{n.stopPropagation(),t.locked=!t.locked,e.commit(`قفل`),e.render({panels:!0})},{iconOnly:!0,class:`ghost small ${t.locked?`on`:``}`,size:22}));a.addEventListener(`click`,n=>{n.target.closest(`.btn,.grip,input`)||e.select(t.id,{add:n.shiftKey||n.ctrlKey})}),a.querySelector(`.grip`).addEventListener(`pointerdown`,t=>gi(t,e,a,r)),r.append(a)}),t.append(r)}function gi(e,t,n,r){e.preventDefault();let i=n.getAttribute(`data-id`),a=[...r.children],o=a.map(e=>e.getBoundingClientRect()),s=e.clientY;n.classList.add(`dragging`);let c=e.currentTarget;c.setPointerCapture(e.pointerId);let l=a.indexOf(n),u=e=>{let t=e.clientY-s;n.style.transform=`translateY(${t}px)`;let r=e.clientY;l=o.findIndex(e=>r<e.top+e.height/2),l<0&&(l=a.length-1),a.forEach((e,t)=>e.classList.toggle(`drop-before`,t===l&&e!==n))},d=()=>{c.removeEventListener(`pointermove`,u),c.removeEventListener(`pointerup`,d),c.removeEventListener(`pointercancel`,d),n.style.transform=``,n.classList.remove(`dragging`);let e=t.doc.objects,r=e.findIndex(e=>e.id===i),[o]=e.splice(r,1),s=Math.max(0,Math.min(a.length-1,l)),f=Math.max(0,Math.min(e.length,a.length-1-s));e.splice(f,0,o),t.commit(`ترتيب الطبقات`),t.render({panels:!0})};c.addEventListener(`pointermove`,u),c.addEventListener(`pointerup`,d),c.addEventListener(`pointercancel`,d)}var _i={select:dr,pan:fr,text:pr,kashida:mr},vi=[{id:`select`,icon:`select`,label:`تحديد`,mobile:!0,key:`v`},{id:`text`,icon:`text`,label:`كتابة`,mobile:!0,key:`t`},{id:`kashida`,icon:`kashida`,label:`تطويل`,mobile:!0,key:`k`},{id:`pan`,icon:`pan`,label:`تحريك اللوحة`,mobile:!1,key:`h`}];function yi(e,t,n=null){if(_i[e.id]=e,!t)return;let r=n?vi.findIndex(e=>e.id===n):-1;r>=0?vi.splice(r+1,0,t):vi.push(t)}var bi=22,xi={id:`nodes`,target(e){let t=e.one;return t&&t.type===`path`?t:null},cpFor(e){if(this.cpId!==e.id||this.cpD!==e.d){let t=se(e.d);this.cp=t,this.cpId=e.id,this.cpD=e.d}return this.cp},write(e,t){t.d=re(this.cp,2),this.cpD=t.d,e.render()},sel(e){return e.toolState.nodes||[]},seg(e){let[t,n]=e.split(`:`).map(Number);return this.cp.children[t]?.segments[n]},screen(e,t,n){return e.toScreen(...u(t.m,n.x,n.y))},overlay(e){let t=e.app,n=this.target(t);if(!n)return``;let r=this.cpFor(n),a=[e.z,0,0,e.z,e.tx,e.ty],o=n.m,s=[a[0]*o[0],a[0]*o[1],a[0]*o[2],a[0]*o[3],a[0]*o[4]+a[4],a[0]*o[5]+a[5]],c=`<path class="nodepath" d="${i(n.d,s)}"/>`,l=new Set(this.sel(t)),u=r.children.reduce((e,t)=>e+t.segments.length,0)>400;if(r.children.forEach((t,r)=>t.segments.forEach((t,i)=>{let a=`${r}:${i}`,[o,s]=this.screen(e,n,t.point);if(l.has(a))for(let[r,i]of[[`hi`,t.handleIn],[`ho`,t.handleOut]]){if(i.isZero())continue;let[l,u]=this.screen(e,n,t.point.add(i));c+=`<line class="hline" x1="${o}" y1="${s}" x2="${l}" y2="${u}"/><circle class="hit" data-handle="${r}:${a}" cx="${l}" cy="${u}" r="${bi}"/><circle class="hdot" cx="${l}" cy="${u}" r="7"/>`}let d=u?4:6;c+=`<circle class="hit" data-handle="n:${a}" cx="${o}" cy="${s}" r="${u?12:bi}"/><rect class="node ${l.has(a)?`on`:``} ${t.hasHandles()?`curve`:``}" x="${o-d}" y="${s-d}" width="${d*2}" height="${d*2}"/>`})),this.marquee){let e=this.marquee;c+=`<rect class="marquee" x="${Math.min(e.sx0,e.sx1)}" y="${Math.min(e.sy0,e.sy1)}" width="${Math.abs(e.sx1-e.sx0)}" height="${Math.abs(e.sy1-e.sy0)}"/>`}return c},localDelta(e,t,n){let r=a([e.m[0],e.m[1],e.m[2],e.m[3],0,0]);return u(r,t.x-n.x,t.y-n.y)},mirrorPartners(e,t,n){let r=e.settings.mirror;if(!r||r===`none`)return[];let i=this.cp.bounds,a=i.center.x,o=i.center.y,s=Math.max(i.width,i.height)*.03,c=[];for(let e of n){let t=this.seg(e).point,i=r===`x`?new v.Point(2*a-t.x,t.y):new v.Point(t.x,2*o-t.y),l=null,u=s;this.cp.children.forEach((e,t)=>e.segments.forEach((e,r)=>{let a=`${t}:${r}`;if(n.includes(a))return;let o=e.point.getDistance(i);o<u&&(u=o,l=a)})),l&&c.push(l)}return c},down(e,t){let n=t.app,r=this.target(n);if(!r){let r=t.hitObject(e.e,e.x,e.y);r?.type===`path`?(n.select(r.id),n.setTool(`nodes`)):I(r?`حوّل العنصر إلى أشكال أولًا لتعديل نقاطه`:`اختر شكلًا لتعديل نقاطه`);return}this.cpFor(r),this.s0=[e.sx,e.sy],this.moved=!1;let i=e.target.closest?.(`[data-handle]`);if(i){let[a,o,s]=i.getAttribute(`data-handle`).split(`:`),c=`${o}:${s}`;if(a===`n`){let i=this.sel(n);e.shift||e.ctrl?i=i.includes(c)?i.filter(e=>e!==c):[...i,c]:i.includes(c)||(i=[c]),n.toolState.nodes=i;let a=i.map(e=>this.seg(e)).filter(Boolean),o=this.mirrorPartners(n,r,i).map(e=>this.seg(e));this.op={kind:`node`,start:{x:e.x,y:e.y},segs:a,p0:a.map(e=>e.point.clone()),partners:o,pp0:o.map(e=>e.point.clone())},t.drawOverlay(),n.render({panels:!0})}else{let t=this.seg(c),n=t.handleIn.isCollinear?.(t.handleOut)??!1;this.op={kind:a,seg:t,start:{x:e.x,y:e.y},h0:(a===`hi`?t.handleIn:t.handleOut).clone(),smooth:n&&!e.alt}}return}let[o,s]=u(a(r.m),e.x,e.y),c=this.cp.getNearestLocation(new v.Point(o,s)),l=Math.hypot(r.m[0],r.m[1])*t.z;if(c&&c.point.getDistance(new v.Point(o,s))*l<14){let t=c.path,i=t.divideAt(c);if(i){let a=`${this.cp.children.indexOf(t)}:${i.index}`;n.toolState.nodes=[a],this.write(n,r),this.cpD=r.d,n.commit(`إضافة عقدة`),this.op={kind:`node`,start:{x:e.x,y:e.y},segs:[i],p0:[i.point.clone()],partners:[],pp0:[]},n.render({panels:!0});return}}let d=t.hitObject(e.e,e.x,e.y);d&&d.id!==r.id?(n.setTool(`select`),n.select(d.id)):e.pointerType===`mouse`?this.marquee={sx0:e.sx,sy0:e.sy,sx1:e.sx,sy1:e.sy,add:e.shift}:this.pan={sx:e.sx,sy:e.sy,tx:t.tx,ty:t.ty,moved:!1}},move(e,t){let n=t.app,r=this.target(n);if(this.marquee){this.marquee.sx1=e.sx,this.marquee.sy1=e.sy,t.drawOverlay();return}if(this.pan){let n=this.pan;Math.hypot(e.sx-n.sx,e.sy-n.sy)>6&&(n.moved=!0),t.tx=n.tx+e.sx-n.sx,t.ty=n.ty+e.sy-n.sy,t.draw();return}let i=this.op;if(!i||!r||!this.moved&&Math.hypot(e.sx-this.s0[0],e.sy-this.s0[1])<3)return;this.moved=!0;let[a,o]=this.localDelta(r,e,i.start);if(i.kind===`node`){i.segs.forEach((e,t)=>{e.point=i.p0[t].add([a,o])});let e=n.settings.mirror;i.partners.forEach((t,n)=>{t.point=i.pp0[n].add(e===`x`?[-a,o]:[a,-o])})}else{let e=i.h0.add([a,o]);i.kind===`hi`?(i.seg.handleIn=e,i.smooth&&(i.seg.handleOut=e.normalize(-i.seg.handleOut.length||-e.length))):(i.seg.handleOut=e,i.smooth&&(i.seg.handleIn=e.normalize(-i.seg.handleIn.length||-e.length)))}this.write(n,r)},up(e,t){let n=t.app,r=this.target(n);if(this.marquee){let e=this.marquee;this.marquee=null;let i=Math.min(e.sx0,e.sx1),a=Math.max(e.sx0,e.sx1),o=Math.min(e.sy0,e.sy1),s=Math.max(e.sy0,e.sy1);if(a-i<3&&s-o<3){n.toolState.nodes=[],n.render({panels:!0});return}let c=[];this.cp.children.forEach((e,n)=>e.segments.forEach((e,l)=>{let[u,d]=this.screen(t,r,e.point);u>=i&&u<=a&&d>=o&&d<=s&&c.push(`${n}:${l}`)})),n.toolState.nodes=e.add?[...new Set([...this.sel(n),...c])]:c,n.render({panels:!0})}else if(this.pan){let e=this.pan.moved;this.pan=null,e||(n.toolState.nodes=[],n.render({panels:!0}))}else this.op&&(this.op=null,this.moved&&n.commit(`تعديل العقد`),n.render({panels:!0}))},cancel(e){this.op=null,this.marquee=null,this.pan=null,e.app.revert()},deleteNodes(e){let t=this.target(e);if(!t)return;this.cpFor(t);let n=this.sel(e).map(e=>e.split(`:`).map(Number)).sort((e,t)=>t[0]-e[0]||t[1]-e[1]);if(!n.length)return I(`حدّد عقدة أولًا`);for(let[e,t]of n)this.cp.children[e]?.segments[t]?.remove();for(let e of[...this.cp.children])e.segments.length<2&&e.remove();e.toolState.nodes=[],this.write(e,t),e.commit(`حذف عقد`),e.render({panels:!0})},setType(e,t){let n=this.target(e);if(!n)return;this.cpFor(n);let r=this.sel(e).map(e=>this.seg(e)).filter(Boolean);if(!r.length)return I(`حدّد عقدة أولًا`);for(let e of r)t===`corner`?(e.handleIn=new v.Point(0,0),e.handleOut=new v.Point(0,0)):e.smooth({type:`catmull-rom`,factor:.5});this.write(e,n),e.commit(t===`corner`?`عقدة حادة`:`عقدة منحنية`),e.render({panels:!0})}};export{P as A,mr as C,H as D,R as E,Ee as F,j as I,A as L,U as M,B as N,z as O,I as P,gr as S,F as T,Tr as _,di as a,yr as b,hi as c,Z as d,kr as f,Dr as g,Or as h,yi as i,L as j,N as k,ni as l,Pr as m,vi as n,$ as o,Br as p,_i as r,ti as s,xi as t,Q as u,vr as v,G as w,xr as x,Sr as y};