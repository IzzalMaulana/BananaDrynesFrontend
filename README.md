This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend Flask Structure for Model Serving

To serve your `.h5` model for AI prediction, add a backend folder with the following structure:

```
backend/
  ├── app.py                  # Main Flask app for prediction API
  ├── requirements.txt        # Python dependencies
  └── model_xgboost_pisangtes.h5  # Your trained model file
```

- `app.py`: Flask API to load the model and handle prediction requests.
- `requirements.txt`: List of required Python packages (Flask, TensorFlow, Pillow, etc).
- `model_xgboost_pisangtes.h5`: Your Keras/TensorFlow model file.

**How to use:**
1. Place your `.h5` model in the `backend/` folder.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `python app.py`
4. Frontend can POST images to `http://localhost:5000/predict` for predictions.

Untuk memastikan **frontend dan backend Anda sudah terkoneksi**, lakukan langkah berikut:

---

### 1. **Cek Log di Terminal Backend**
- Saat Anda upload gambar dari web, lihat terminal tempat Anda menjalankan `python app.py`.
- Jika backend menerima request, biasanya akan muncul log seperti:
  ```
  127.0.0.1 - - [tanggal waktu] "POST /predict HTTP/1.1" 200 -
  ```
- Jika **tidak ada log sama sekali** saat upload gambar, berarti frontend TIDAK berhasil mengirim request ke backend.

---

### 2. **Cek Network di Browser**
- Buka web Anda di browser.
- Tekan `F12` → buka tab **Network**.
- Upload gambar.
- Cari request ke `/predict`:
  - **Jika ada** request ke `http://localhost:5000/predict` dan statusnya **200**/**400**/**500**: frontend dan backend sudah terkoneksi, tapi mungkin ada error di backend.
  - **Jika tidak ada** request ke `localhost:5000/predict` atau statusnya **(failed)**: frontend dan backend **belum terkoneksi**.

---

### 3. **Cek Error di Console Browser**
- Masih di F12, buka tab **Console**.
- Jika ada error seperti `CORS`, `Failed to fetch`, atau `NetworkError`, berarti ada masalah koneksi.

---

### 4. **Cek Kode Frontend**
Pastikan di file `HomeSection.tsx` ada baris seperti:
```js
<code_block_to_apply_changes_from>
```
dan **bukan** ke alamat lain.

---

## **Kesimpulan**
- **Jika backend menerima request POST /predict saat upload gambar:**  
  → **Frontend dan backend sudah terkoneksi.**
- **Jika tidak ada request sama sekali di backend:**  
  → **Belum terkoneksi.**  
  Cek apakah backend sudah berjalan, alamat sudah benar, dan tidak ada firewall yang memblokir.

---

**Jika masih bingung, kirimkan:**
- Screenshot/tab Network setelah upload gambar.
- Log terminal backend saat upload gambar.
- Pesan error di browser (jika ada).

Saya akan bantu cek dan pastikan koneksi frontend-backend Anda benar-benar berjalan!
