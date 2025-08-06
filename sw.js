// اسم ذاكرة التخزين المؤقت (Cache)
const CACHE_NAME = 'gamiati-cache-v1';

// قائمة بالملفات الأساسية التي يجب تخزينها مؤقتًا
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', // تأكد من أن هذا المسار صحيح لملف CSS الخاص بك
  '/script.js', // تأكد من أن هذا المسار صحيح لملف JavaScript الخاص بك
  '/icons/icon-192x192.png', // تأكد من وجود مجلد icons والأيقونات
  '/icons/icon-512x512.png'
];

// حدث التثبيت (Install Event): يتم تشغيله عند تثبيت Service Worker لأول مرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // إضافة جميع الملفات الأساسية إلى ذاكرة التخزين المؤقت
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to open cache or add URLs:', error);
      })
  );
});

// حدث الجلب (Fetch Event): يتم تشغيله في كل مرة يطلب فيها المتصفح موردًا
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا كان المورد موجودًا في ذاكرة التخزين المؤقت، قم بإرجاعه
        if (response) {
          return response;
        }
        // إذا لم يكن موجودًا، قم بجلب المورد من الشبكة
        return fetch(event.request)
          .then((networkResponse) => {
            // تحقق مما إذا كان الاستجابة صالحة
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // استنساخ الاستجابة لتخزينها في ذاكرة التخزين المؤقت وإرجاعها
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          })
          .catch(() => {
            // في حالة عدم توفر الشبكة وعدم وجود المورد في ذاكرة التخزين المؤقت
            // يمكنك هنا إرجاع صفحة "عدم الاتصال" مخصصة
            console.log('Network request failed and no cache match.');
            // يمكنك إضافة صفحة offline.html هنا إذا كنت تريد
            // return caches.match('/offline.html');
          });
      })
  );
});

// حدث التفعيل (Activate Event): يتم تشغيله بعد تثبيت Service Worker الجديد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف ذاكرات التخزين المؤقت القديمة التي لم تعد مستخدمة
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
