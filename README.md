# Phiếu tư vấn da — Dr. Tố Nguyên

Form tư vấn da 3 bước, tự động lưu vào Google Sheet.

---

## Cấu trúc project

```
skin-form/
├── pages/
│   ├── index.js          ← Form chính (UI)
│   └── api/
│       └── submit-form.js ← API route gửi data
├── google-apps-script.js  ← Script dán vào Google Sheet
├── .env.local.example     ← Template biến môi trường
└── package.json
```

---

## Hướng dẫn triển khai

### Bước 1 — Chuẩn bị Google Sheet

1. Tạo một Google Sheet mới (hoặc dùng Sheet có sẵn)
2. Vào **Extensions → Apps Script**
3. Xóa code mặc định, dán toàn bộ nội dung file `google-apps-script.js` vào
4. Nhấn **Save** (Ctrl+S)

### Bước 2 — Deploy Apps Script thành Web App

1. Nhấn **Deploy → New deployment**
2. Chọn type: **Web app**
3. Description: `Skin Form API` (tuỳ ý)
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Nhấn **Deploy**
7. **Copy URL** vừa tạo (dạng `https://script.google.com/macros/s/ABC.../exec`)

> ⚠️ Mỗi lần sửa code Apps Script, phải tạo deployment mới (New deployment),
> không phải "Manage deployments" → Edit. URL sẽ thay đổi.

### Bước 3 — Cấu hình Next.js

1. Copy file `.env.local.example` thành `.env.local`
2. Dán URL Apps Script vào:

```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

### Bước 4 — Chạy local để test

```bash
npm install
npm run dev
```

Mở http://localhost:3000, điền form, kiểm tra Google Sheet có data chưa.

### Bước 5 — Deploy lên Vercel

**Cách 1 — Vercel CLI:**
```bash
npm i -g vercel
vercel
```

**Cách 2 — Vercel Dashboard:**
1. Push code lên GitHub
2. Vào vercel.com → Import project
3. Vào **Settings → Environment Variables**
4. Thêm: `GOOGLE_APPS_SCRIPT_URL` = URL của bạn
5. Redeploy

---

## Lưu ý quan trọng

- File `.env.local` **KHÔNG được** commit lên GitHub (đã có trong .gitignore của Next.js)
- Trên Vercel, biến môi trường phải được thêm thủ công trong Settings
- Nếu sửa Apps Script, nhớ tạo **New deployment** và cập nhật URL trong Vercel
- Google Sheet tab sẽ tự động được tạo với tên **"Phiếu tư vấn"**

---

## Test Apps Script

Trong Apps Script editor, chạy hàm `testDoPost()` để kiểm tra không cần form.
