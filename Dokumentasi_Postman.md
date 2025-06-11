# Dokumentasi API TrashWave

## Gambaran Umum

TrashWave adalah API streaming musik yang komprehensif yang menyediakan fungsionalitas untuk penemuan musik, streaming, manajemen playlist, interaksi artis, dan banyak lagi. Dokumentasi ini mencakup semua endpoint yang tersedia dan penggunaannya.

**Base URL:** `https://trashwave-production.up.railway.app`  
**Versi API:** v1  
**Autentikasi:** JWT Bearer Token / API Key

---

## Daftar Isi

1. [Autentikasi](#autentikasi)
2. [Manajemen Akun](#manajemen-akun)
3. [Manajemen Artis](#manajemen-artis)
4. [Manajemen Lagu](#manajemen-lagu)
5. [Manajemen Album](#manajemen-album)
6. [Manajemen Playlist](#manajemen-playlist)
7. [Sistem Iklan](#sistem-iklan)
8. [Integrasi Spotify](#integrasi-spotify)
9. [Penanganan Error](#penanganan-error)

---

## Autentikasi

### Autentikasi JWT Token

Sebagian besar endpoint memerlukan autentikasi menggunakan JWT token yang dikirim dalam header `Authorization`:

```
Authorization: Bearer <jwt_token>
```

### Autentikasi API Key

Beberapa endpoint mendukung autentikasi API key menggunakan header `x-api-key`:

```
x-api-key: <api_key>
```

---

## Manajemen Akun

### 1. Registrasi Pengguna

**Endpoint:** `POST /api/v1/account/register`  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirm_password": "string",
  "full_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "country": "string",
  "gender": "male|female|other",
  "profile_picture": "file"
}
```

### 2. Login Pengguna

**Endpoint:** `POST /api/v1/account/login`  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

### 3. Dapatkan Profil Pengguna berdasarkan Username

**Endpoint:** `GET /api/v1/account/user/:username`  
**Autentikasi:** Diperlukan

### 4. Dapatkan Profil Sendiri

**Endpoint:** `GET /api/v1/account/user`  
**Autentikasi:** Diperlukan (x-api-key atau JWT)

### 5. Perbarui Profil

**Endpoint:** `PUT /api/v1/account/profile`  
**Content-Type:** `multipart/form-data`  
**Autentikasi:** Diperlukan

**Request Body:**

```json
{
  "password": "string (opsional)",
  "full_name": "string (opsional)",
  "date_of_birth": "YYYY-MM-DD (opsional)",
  "country": "string (opsional)",
  "profile_picture": "file (opsional)"
}
```

### 6. Berlangganan Pengguna

**Endpoint:** `POST /api/v1/account/subscribe`  
**Autentikasi:** Diperlukan (x-api-key)

**Request Body:**

```json
{
  "api_level": "premium|free"
}
```

### 7. Dapatkan Kuota Pengguna

**Endpoint:** `GET /api/v1/account/quota`  
**Autentikasi:** Diperlukan (JWT)

### 8. Buat Akun Admin

**Endpoint:** `POST /api/v1/account/admin`  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirm_password": "string",
  "full_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "gender": "male|female|other",
  "country": "string"
}
```

### 9. Hapus/Nonaktifkan Akun

**Endpoint:** `DELETE /api/v1/account/delete`  
**Autentikasi:** Diperlukan (JWT)

**Request Body:**

```json
{
  "password": "string"
}
```

---

## Manajemen Artis

### 1. Dapatkan Semua Artis

**Endpoint:** `GET /api/v1/artists/`

### 2. Dapatkan Artis berdasarkan Nama

**Endpoint:** `GET /api/v1/artists/:artistName`

### 3. Dapatkan Lagu Artis

**Endpoint:** `GET /api/v1/artists/:artistName/songs`

### 4. Dapatkan Album Artis

**Endpoint:** `GET /api/v1/artists/:artistName/albums`

### 5. Registrasi Artis

**Endpoint:** `POST /api/v1/artists/register`  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "username": "string",
  "name": "string",
  "real_name": "string",
  "email": "string",
  "password": "string",
  "bio": "string",
  "genres": "string (dipisahkan koma)",
  "social_links": "string",
  "profile_picture": "file",
  "dob": "YYYY-MM-DD",
  "country": "string",
  "phone": "string",
  "gender": "male|female|other"
}
```

### 6. Follow/Unfollow Artis

**Endpoint:** `POST /api/v1/artists/:artistName/follow`  
**Autentikasi:** Diperlukan (JWT)

### 7. Perbarui Profil Artis

**Endpoint:** `PUT /api/v1/artists/:artistName`  
**Autentikasi:** Diperlukan (JWT)  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

```json
{
  "bio": "string (opsional)",
  "genre": "string (opsional)",
  "social_links": "string (opsional)"
}
```

### 8. Ban Artis (Khusus Admin)

**Endpoint:** `DELETE /api/v1/artists/:artistName`  
**Autentikasi:** Diperlukan (Admin JWT)

### 9. Verifikasi Artis (Khusus Admin)

**Endpoint:** `PUT /api/v1/artists/:artistName/verify`  
**Autentikasi:** Diperlukan (Admin JWT)

**Request Body:**

```json
{
  "status": "verified"
}
```

---

## Manajemen Lagu

### 1. Dapatkan Semua Lagu

**Endpoint:** `GET /api/v1/songs/`

**Parameter Query:**

- `genre`: Filter berdasarkan genre
- `search`: Query pencarian

### 2. Dapatkan Lagu berdasarkan ID

**Endpoint:** `GET /api/v1/songs/:id`

### 3. Tambah Lagu

**Endpoint:** `POST /api/v1/songs/`  
**Autentikasi:** Diperlukan (Artist JWT)  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "string",
  "album_id": "number",
  "genre": "string",
  "duration": "number (detik)",
  "lyrics": "string",
  "explicit_content": "0|1",
  "release_date": "YYYY-MM-DD HH:mm:ss",
  "audio_file": "file",
  "cover_image": "file"
}
```

### 4. Perbarui Lagu

**Endpoint:** `PUT /api/v1/songs/:id`  
**Autentikasi:** Diperlukan (Artist JWT)  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

```json
{
  "title": "string (opsional)",
  "album_id": "number (opsional)",
  "genre": "string (opsional)",
  "duration": "number (opsional)",
  "lyrics": "string (opsional)",
  "explicit_content": "0|1 (opsional)"
}
```

### 5. Hapus Lagu

**Endpoint:** `DELETE /api/v1/songs/:id`  
**Autentikasi:** Diperlukan (Artist JWT)

### 6. Like/Unlike Lagu

**Endpoint:** `POST /api/v1/songs/:id/like`  
**Autentikasi:** Diperlukan (JWT)

### 7. Putar Lagu

**Endpoint:** `POST /api/v1/songs/:id/play`  
**Autentikasi:** Diperlukan (JWT)

### 8. Download Lagu

**Endpoint:** `POST /api/v1/songs/:id/download`  
**Autentikasi:** Diperlukan (JWT)

---

## Manajemen Album

### 1. Dapatkan Semua Album

**Endpoint:** `GET /api/v1/albums/`

### 2. Dapatkan Album berdasarkan ID

**Endpoint:** `GET /api/v1/albums/:id`

### 3. Dapatkan Lagu Album

**Endpoint:** `GET /api/v1/albums/:id/songs`

### 4. Tambah Album

**Endpoint:** `POST /api/v1/albums/`  
**Autentikasi:** Diperlukan (Artist JWT)  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

```json
{
  "title": "string",
  "description": "string (opsional)",
  "genre": "string",
  "release_date": "YYYY-MM-DD (opsional)"
}
```

### 5. Perbarui Album

**Endpoint:** `PUT /api/v1/albums/:id`  
**Autentikasi:** Diperlukan (Artist JWT)

### 6. Hapus Album

**Endpoint:** `DELETE /api/v1/albums/:id`  
**Autentikasi:** Diperlukan (Artist JWT)

### 7. Like/Unlike Album

**Endpoint:** `POST /api/v1/albums/:id/like`  
**Autentikasi:** Diperlukan (JWT)

### 8. Tambah Lagu ke Album

**Endpoint:** `POST /api/v1/albums/:id/songs/:songId`  
**Autentikasi:** Diperlukan (Artist JWT)

### 9. Hapus Lagu dari Album

**Endpoint:** `DELETE /api/v1/albums/:id/songs/:songId`  
**Autentikasi:** Diperlukan (Artist JWT)

---

## Manajemen Playlist

### 1. Dapatkan Semua Playlist

**Endpoint:** `GET /api/v1/playlists`

### 2. Dapatkan Playlist berdasarkan Nama

**Endpoint:** `GET /api/v1/playlists/:name`

### 3. Buat Playlist

**Endpoint:** `POST /api/v1/playlists`  
**Autentikasi:** Diperlukan (JWT)  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "is_public": "true|false",
  "cover_image": "file"
}
```

### 4. Perbarui Playlist

**Endpoint:** `PUT /api/v1/playlists/:id`  
**Autentikasi:** Diperlukan (JWT)  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "name": "string (opsional)",
  "description": "string (opsional)",
  "is_public": "true|false (opsional)",
  "cover_image": "file (opsional)"
}
```

### 5. Hapus Playlist

**Endpoint:** `DELETE /api/v1/playlists/:id`  
**Autentikasi:** Diperlukan (JWT)

### 6. Like/Unlike Playlist

**Endpoint:** `POST /api/v1/playlists/:id/like`  
**Autentikasi:** Diperlukan (JWT)

### 7. Tambah Lagu ke Playlist

**Endpoint:** `POST /api/v1/playlists/:id/songs`  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**

```json
{
  "song_name": "string",
  "position": "number"
}
```

### 8. Hapus Lagu dari Playlist

**Endpoint:** `DELETE /api/v1/playlists/:id/songs/:songId`

---

## Sistem Iklan

### 1. Buat Iklan (Khusus Admin)

**Endpoint:** `POST /api/v1/ads`  
**Autentikasi:** Diperlukan (Admin JWT)  
**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "target_url": "string",
  "duration": "number (detik)",
  "budget": "number",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "streaming_quota": "number",
  "video": "file (opsional)",
  "audio": "file (opsional)"
}
```

### 2. Tonton Iklan

**Endpoint:** `GET /api/v1/ads/watch`

### 3. Hapus Iklan (Khusus Admin)

**Endpoint:** `DELETE /api/v1/ads/:id`  
**Autentikasi:** Diperlukan (Admin JWT)

---

## Integrasi Spotify

### Pencarian dan Pengambilan Lagu

#### 1. Cari Lagu di Spotify

**Endpoint:** `GET /api/v1/songs/search/spotify`

**Parameter Query:**

- `query`: Query pencarian (wajib)
- `market`: Kode pasar (opsional, mis. "ES")
- `limit`: Jumlah hasil (opsional, default: 20)
- `offset`: Offset untuk pagination (opsional, default: 0)

#### 2. Dapatkan Track Spotify

**Endpoint:** `GET /api/v1/songs/spotify/:trackId`

**Parameter Query:**

- `market`: Kode pasar (opsional)

#### 3. Dapatkan Beberapa Track Spotify

**Endpoint:** `GET /api/v1/songs/spotify/tracks/:trackIds`

**Parameter Path:**

- `trackIds`: ID track yang dipisahkan koma

### Pencarian dan Pengambilan Album

#### 1. Cari Album di Spotify

**Endpoint:** `GET /api/v1/albums/search/spotify`

**Parameter Query:**

- `query`: Query pencarian (wajib)
- `market`: Kode pasar (opsional)
- `limit`: Jumlah hasil (opsional)
- `offset`: Offset untuk pagination (opsional)

#### 2. Dapatkan Album Spotify

**Endpoint:** `GET /api/v1/albums/spotify/:albumId`

**Parameter Query:**

- `market`: Kode pasar (opsional)

#### 3. Dapatkan Beberapa Album Spotify

**Endpoint:** `GET /api/v1/albums/spotify/albums/:albumIds`

**Parameter Path:**

- `albumIds`: ID album yang dipisahkan koma

### Pencarian dan Pengambilan Playlist

#### 1. Cari Playlist di Spotify

**Endpoint:** `GET /api/v1/playlists/search/spotify`

**Parameter Query:**

- `query`: Query pencarian (wajib)
- `market`: Kode pasar (opsional)

#### 2. Dapatkan Detail Playlist Spotify

**Endpoint:** `GET /api/v1/playlists/spotify/:playlistId`

**Parameter Query:**

- `market`: Kode pasar (opsional)
- `fields`: Field spesifik yang akan dikembalikan (opsional)
- `additional_types`: Tipe konten tambahan (opsional)

#### 3. Cari Beberapa Jenis Konten

**Endpoint:** `GET /api/v1/playlists/search/spotify/multiple`

**Parameter Query:**

- `query`: Query pencarian (wajib)
- `types`: Jenis konten untuk dicari (mis. "album,track,playlist")
- `limit`: Jumlah hasil (opsional)
- `offset`: Offset untuk pagination (opsional)
- `market`: Kode pasar (opsional)

---

## Penanganan Error

### Kode Status HTTP Umum

- `200 OK`: Permintaan berhasil
- `201 Created`: Resource berhasil dibuat
- `400 Bad Request`: Parameter permintaan tidak valid
- `401 Unauthorized`: Autentikasi diperlukan
- `403 Forbidden`: Izin tidak mencukupi
- `404 Not Found`: Resource tidak ditemukan
- `409 Conflict`: Resource sudah ada
- `422 Unprocessable Entity`: Error validasi
- `500 Internal Server Error`: Error server

### Format Response Error

```json
{
  "success": false,
  "message": "Deskripsi error",
  "error": "Informasi error detail",
  "code": "KODE_ERROR"
}
```

---

## Rate Limiting

API menerapkan rate limiting untuk memastikan penggunaan yang adil. Periksa header response untuk informasi rate limit:

- `X-RateLimit-Limit`: Batas permintaan per jendela waktu
- `X-RateLimit-Remaining`: Permintaan tersisa dalam jendela saat ini
- `X-RateLimit-Reset`: Waktu ketika rate limit direset

---

## Level Berlangganan

### Tier Gratis

- Kuota streaming terbatas
- Kuota download terbatas
- Perlu menonton iklan

### Tier Premium

- Streaming unlimited
- Download unlimited
- Tanpa iklan
- Kuota API lebih tinggi

---

## Panduan Upload File

### Format yang Didukung

- **File Audio**: MP3, WAV, FLAC
- **File Gambar**: JPG, PNG, GIF
- **File Video**: MP4, AVI, MOV

### Batas Ukuran File

- **File Audio**: Maksimal 50MB
- **File Gambar**: Maksimal 10MB
- **File Video**: Maksimal 100MB

---

## Best Practices

1. **Autentikasi**: Selalu sertakan header autentikasi yang benar
2. **Penanganan Error**: Implementasikan penanganan error yang tepat untuk semua panggilan API
3. **Rate Limiting**: Hormati rate limit dan implementasikan exponential backoff
4. **Upload File**: Validasi jenis dan ukuran file sebelum upload
5. **Pagination**: Gunakan pagination untuk dataset besar
6. **Caching**: Implementasikan caching untuk data yang sering diakses

---

## Kontak & Dukungan

Untuk dukungan API, pembaruan dokumentasi, atau permintaan fitur, silakan hubungi tim pengembangan TrashWave atau lihat repository GitHub.

**Repository GitHub:** https://github.com/Sencpc/TrashWave

---

_Dokumentasi ini dibuat berdasarkan koleksi Postman TrashWave dan merepresentasikan spesifikasi API terkini per Juni 2025._
