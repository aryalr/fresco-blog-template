
# Tutorial: Mengubah Website Statis Next.js menjadi Portofolio Dinamis dengan Panel Admin

Selamat datang di tutorial ini! Anda akan belajar cara mengubah website portofolio yang awalnya statis (konten diubah secara manual di dalam kode) menjadi sebuah aplikasi web dinamis.

Setelah mengikuti tutorial ini, Anda akan memiliki:
1.  **Website Portofolio** yang kontennya diambil dari database.
2.  **Panel Admin** sederhana yang dilindungi kata sandi.
3.  **Fungsi CRUD** (Create, Read, Update, Delete) di panel admin untuk mengubah semua konten di halaman utama, termasuk teks dan gambar.

Targetnya adalah Anda memahami alur kerja fundamental sehingga dapat membuat proyek serupa di masa depan tanpa perlu bergantung pada tutorial lagi.

---

### **Teknologi yang Akan Kita Gunakan**

Untuk meminimalkan kerumitan, kita akan menggunakan ekosistem Next.js sepenuhnya:
*   **Frontend:** Next.js dengan React (sudah ada).
*   **Backend:** Next.js API Routes (server backend terintegrasi di dalam Next.js).
*   **Database:** SQLite, sebuah database berbasis file yang sangat ringan dan tidak memerlukan server terpisah.
*   **ORM:** Prisma, sebuah tool modern untuk berinteraksi dengan database secara aman dan efisien.
*   **Autentikasi:** Next-Auth.js, library standar untuk autentikasi di Next.js.

---

## **Langkah 1: Menyiapkan Database dengan Prisma**

Langkah pertama adalah menyiapkan struktur database untuk menyimpan semua konten website.

### 1.1. Instalasi Prisma
Buka terminal Anda di direktori proyek dan jalankan perintah berikut:

```bash
npm install prisma --save-dev
npm install @prisma/client
```

### 1.2. Inisialisasi Prisma
Sekarang, inisialisasi Prisma. Perintah ini akan membuat folder `prisma` dengan file `schema.prisma` dan sebuah file `.env`.

```bash
npx prisma init --datasource-provider sqlite
```

### 1.3. Konfigurasi File `.env`
Buka file `.env` yang baru dibuat dan pastikan isinya seperti ini. Ini memberitahu Prisma untuk membuat file database bernama `dev.db` di dalam folder `prisma`.

```
DATABASE_URL="file:./prisma/dev.db"
```

### 1.4. Mendesain Skema Database
Buka file `prisma/schema.prisma`. Ini adalah tempat kita mendefinisikan "tabel" atau model database. Hapus isinya dan ganti dengan skema berikut. Skema ini dirancang untuk menyimpan semua data yang sebelumnya ada di `data.json`.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Model untuk autentikasi admin
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
}

// Model untuk konten halaman
model Header {
  id        Int    @id @default(1)
  title     String
  paragraph String
}

model About {
  id        Int      @id @default(1)
  paragraph String
  why       String[]
  why2      String[]
}

model Gallery {
  id         Int    @id @default(autoincrement())
  title      String
  largeImage String
  smallImage String
}

model Service {
  id   Int    @id @default(autoincrement())
  icon String
  name String
  text String
}

model Testimonial {
  id   Int    @id @default(autoincrement())
  img  String
  text String
  name String
}

model Team {
  id   Int    @id @default(autoincrement())
  img  String
  name String
  job  String
}
```

### 1.5. Menjalankan Migrasi Database
Setelah skema didefinisikan, jalankan migrasi. Perintah ini akan:
1.  Membuat file database SQLite di `prisma/dev.db`.
2.  Membuat tabel-tabel sesuai dengan model yang Anda definisikan.
3.  Menghasilkan Prisma Client yang *type-safe* untuk digunakan di kode Anda.

```bash
npx prisma migrate dev --name init
```

Jika ditanya, beri nama migrasi (misalnya, "init"). Setelah selesai, database Anda siap!

---

## **Langkah 2: Memasukkan Data Awal ke Database**

Agar website tidak kosong, kita perlu memasukkan data dari `data.json` ke database yang baru kita buat. Kita akan melakukannya dengan sebuah skrip sederhana.

### 2.1. Buat Skrip Seeding
Buat file baru di dalam folder `prisma` bernama `seed.mjs`.

```javascript
// prisma/seed.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Baca data dari data.json
const jsonData = JSON.parse(fs.readFileSync(path.resolve('./app/data/data.json'), 'utf-8'));

async function main() {
  console.log('Start seeding ...');

  // Hapus data lama (opsional, tapi bagus untuk testing)
  await prisma.team.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.service.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.about.deleteMany();
  await prisma.header.deleteMany();
  console.log('Old data deleted.');

  // Masukkan data Header
  await prisma.header.create({ data: jsonData.Header });

  // Masukkan data About
  await prisma.about.create({ data: jsonData.About });
  
  // Masukkan data Gallery, Services, Testimonials, Team
  for (const item of jsonData.Gallery) {
    await prisma.gallery.create({ data: item });
  }
  for (const item of jsonData.Services) {
    await prisma.service.create({ data: item });
  }
  for (const item of jsonData.Testimonials) {
    await prisma.testimonial.create({ data: item });
  }
  for (const item of jsonData.Team) {
    await prisma.team.create({ data: item });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 2.2. Jalankan Skrip Seeding
Tambahkan skrip `seed` ke `package.json` Anda:

```json
// package.json
"scripts": {
  // ... skrip lainnya
  "prisma:seed": "node prisma/seed.mjs"
},
```

Sekarang, jalankan perintah ini di terminal:

```bash
npm run prisma:seed
```

Data awal Anda kini sudah ada di dalam database!

---

## **Langkah 3: Membuat Backend API**

Selanjutnya, kita akan membuat API endpoints menggunakan Next.js API Routes. Endpoint ini akan menjadi jembatan antara frontend dan database.

### 3.1. Buat API untuk Mengambil Semua Konten
Buat file baru: `app/api/content/route.js`. Ini akan menjadi endpoint publik untuk menampilkan data di halaman portofolio.

```javascript
// app/api/content/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const header = await prisma.header.findFirst({ where: { id: 1 } });
    const about = await prisma.about.findFirst({ where: { id: 1 } });
    const gallery = await prisma.gallery.findMany();
    const services = await prisma.service.findMany();
    const testimonials = await prisma.testimonial.findMany();
    const team = await prisma.team.findMany();

    // Mengambil data Features statis karena tidak ada di DB
    const featuresData = [
        {
          "icon": "fa fa-comments-o",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        },
        {
          "icon": "fa fa-bullhorn",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        },
        {
          "icon": "fa fa-group",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        },
        {
          "icon": "fa fa-magic",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        }
      ];

    const landingPageData = {
      Header: header,
      About: about,
      Gallery: gallery,
      Services: services,
      Testimonials: testimonials,
      Team: team,
      Features: featuresData, // Data statis
    };

    return NextResponse.json(landingPageData);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
```

Sekarang Anda bisa mengakses `http://localhost:3000/api/content` di browser untuk melihat data dalam format JSON.

### 3.2. Hubungkan Halaman Utama ke API
Buka `app/page.tsx` dan ubah cara data dimuat. Ganti pengambilan data dari `data.json` menjadi pengambilan data dari API.

```tsx
// app/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Gallery } from "./components/gallery";
import { Testimonials } from "./components/testimonials";
import { Team } from "./components/Team";
import { Contact } from "./components/contact";
// Hapus import JsonData
// import JsonData from "./data/data.json"; 
import "./globals.css";

const App = () => {
  // Ganti state awal menjadi objek kosong
  const [landingPageData, setLandingPageData] = useState({});

  // Ambil data dari API saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/content");
        const data = await response.json();
        setLandingPageData(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    import("smooth-scroll").then((SmoothScroll) => {
      new SmoothScroll.default('a[href*="#"]', {
        speed: 1000,
        speedAsDuration: true,
      });
    });
  }, []);

  return (
    <div>
      <Navigation />
      {/* Gunakan optional chaining (?) untuk mencegah error saat data belum ada */}
      <Header data={landingPageData?.Header} />
      <Features data={landingPageData?.Features} />
      <About data={landingPageData?.About} />
      <Services data={landingPageData?.Services} />
      <Gallery data={landingPageData?.Gallery} />
      <Testimonials data={landingPageData?.Testimonials} />
      <Team data={landingPageData?.Team} />
      <Contact data={{}} /> {/* Contact tidak punya data dinamis */}
    </div>
  );
};

export default App;

```

Sekarang, buka website Anda. Tampilannya akan sama, tetapi datanya sudah berasal dari database melalui API!

---

## **Langkah 4: Membuat Panel Admin (UI & Logika Update)**

Ini adalah bagian paling inti. Kita akan membuat halaman admin untuk mengubah konten.

### 4.1. Buat Halaman Admin
Buat file baru: `app/admin/page.jsx`.

```jsx
// app/admin/page.jsx
"use client";
import { useState, useEffect } from 'react';

// Komponen Form Sederhana
const SectionForm = ({ title, data, setData, onSave }) => {
    if (!data) return <p>Loading {title}...</p>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <h2>Edit {title}</h2>
            {Object.keys(data).map(key => (
                key !== 'id' && (
                    <div key={key} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>{key}</label>
                        <input
                            type="text"
                            name={key}
                            value={data[key]}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                )
            ))}
            <button onClick={onSave} style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
                Save {title}
            </button>
        </div>
    );
};


export default function AdminPage() {
    const [header, setHeader] = useState(null);
    const [about, setAbout] = useState(null);

    // Ambil data awal
    useEffect(() => {
        const fetchContent = async () => {
            const res = await fetch('/api/content');
            const data = await res.json();
            setHeader(data.Header);
            setAbout(data.About);
        };
        fetchContent();
    }, []);

    // Fungsi untuk menyimpan perubahan
    const handleSave = async (section, data) => {
        try {
            const res = await fetch(`/api/content/${section}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`Failed to save ${section}`);
            alert(`${section} saved successfully!`);
        } catch (error) {
            console.error(error);
            alert(`Error saving ${section}: ${error.message}`);
        }
    };
    
    // TODO: Lindungi halaman ini dengan autentikasi

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1>Admin Panel</h1>
            <p>Ubah konten halaman utama di sini.</p>

            <SectionForm title="Header" data={header} setData={setHeader} onSave={() => handleSave('header', header)} />
            <SectionForm title="About" data={about} setData={setAbout} onSave={() => handleSave('about', about)} />
            
            {/* Tambahkan form untuk section lain (Gallery, Team, dll.) di sini */}
        </div>
    );
}

```

### 4.2. Buat API untuk Update Konten
Buat file baru `app/api/content/[section]/route.js`. Ini adalah *dynamic route* yang akan menangani update untuk `header`, `about`, dll.

```javascript
// app/api/content/[section]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  // TODO: Tambahkan pengecekan autentikasi di sini
  
  const { section } = params;
  const data = await request.json();

  try {
    let updatedRecord;
    switch (section) {
      case 'header':
        updatedRecord = await prisma.header.update({
          where: { id: 1 },
          data: { title: data.title, paragraph: data.paragraph },
        });
        break;
      case 'about':
        updatedRecord = await prisma.about.update({
          where: { id: 1 },
          data: { paragraph: data.paragraph }, // why/why2 tidak di-handle di sini utk simplicitas
        });
        break;
      // Tambahkan case untuk section lain di sini
      default:
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating ${section}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
```

Sekarang, coba buka `http://localhost:3000/admin`. Anda akan melihat panel sederhana untuk mengubah judul dan paragraf di Header dan About. Coba ubah teksnya, klik "Save", lalu buka halaman utama. Kontennya akan berubah!

---

## **Langkah 5: Menambahkan Autentikasi**

Panel admin tidak boleh diakses oleh sembarang orang. Kita akan melindunginya dengan login email dan kata sandi.

### 5.1. Instalasi Next-Auth dan Bcrypt
`next-auth` untuk sesi login, dan `bcrypt` untuk mengenkripsi kata sandi.

```bash
npm install next-auth bcrypt
npm install @types/bcrypt --save-dev
```

### 5.2. Buat API Autentikasi
Buat file `app/api/auth/[...nextauth]/route.js`. Ini adalah *catch-all route* yang menangani semua logika autentikasi.

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return { id: user.id, email: user.email };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // Redirect ke halaman login kustom
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 5.3. Buat Skrip untuk Mendaftarkan Admin
Kita butuh satu pengguna admin. Buat skrip `prisma/registerAdmin.mjs` untuk membuatnya.

```javascript
// prisma/registerAdmin.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com'; // Ganti dengan email Anda
  const password = 'password123'; // Ganti dengan password aman

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });

  console.log(`Admin user created with email: ${user.email}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Jalankan skrip ini:

```bash
node prisma/registerAdmin.mjs
```

### 5.4. Buat Halaman Login
Buat file `app/login/page.jsx`.

```jsx
// app/login/page.jsx
"use client";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError('Invalid email or password');
    } else {
      router.replace('/admin'); // Redirect ke admin setelah berhasil login
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <h1>Login to Admin Panel</h1>
      <form onSubmit={handleSubmit}>
        {/* ... (form input untuk email dan password) ... */}
         <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
         <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

### 5.5. Lindungi Halaman Admin dan API
Terakhir, kita perlu memastikan hanya admin yang sudah login yang bisa mengakses halaman `/admin` dan API `PUT`.

**Provider Sesi:** Buat file `app/providers.jsx`.

```jsx
// app/providers.jsx
"use client";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Update `app/layout.tsx`:**

```tsx
// app/layout.tsx
import { Providers } from './providers'; // Import

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* Bungkus children */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Lindungi Halaman Admin (`app/admin/page.jsx`):**

```jsx
// Di dalam fungsi AdminPage di app/admin/page.jsx
import { useSession, signIn } from 'next-auth/react';

export default function AdminPage() {
    const { data: session, status } = useSession();
    // ... state lainnya ...

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn(); // Redirect ke halaman login jika belum login
        }
    }, [status]);
    
    if (status !== 'authenticated') {
        return <p>Loading or not authenticated...</p>;
    }
    
    // ... sisa kode komponen ...
}
```

**Lindungi API (`app/api/content/[section]/route.js`):**

```javascript
// di dalam fungsi PUT di app/api/content/[section]/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // sesuaikan path

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  // ... sisa logika PUT ...
}
```

---

## **Langkah 6: Penutup & Langkah Selanjutnya**

Selamat! Anda telah berhasil mengubah website statis menjadi aplikasi dinamis dengan panel admin yang fungsional.

### **Apa yang Telah Anda Pelajari:**

*   **Arsitektur Full-Stack dengan Next.js:** Anda membangun backend dan frontend dalam satu proyek yang sama.
*   **Manajemen Database dengan Prisma:** Anda mendesain skema, melakukan migrasi, dan berinteraksi dengan database secara *type-safe*.
*   **Pembuatan API:** Anda membuat API untuk membaca (GET) dan memperbarui (PUT) data.
*   **Autentikasi:** Anda mengamankan endpoint dan halaman menggunakan sistem login berbasis sesi.
*   **Pemisahan Data dan Tampilan:** Konten tidak lagi `hardcoded`, melainkan dikelola secara terpisah di database.

### **Langkah Selanjutnya:**

*   **Lengkapi Panel Admin:** Tambahkan form untuk seksi `Gallery`, `Team`, dan `Services`. Untuk gambar, Anda perlu membuat fungsi upload file.
*   **Deployment:** Untuk deploy ke platform seperti Vercel, database SQLite mungkin bukan pilihan terbaik. Pertimbangkan untuk beralih ke database serverless seperti [Vercel Postgres](https://vercel.com/storage/postgres) yang terintegrasi baik dengan Prisma.
*   **Tingkatkan UX Admin:** Gunakan library UI seperti Chakra UI atau Material-UI untuk membuat panel admin lebih cantik dan fungsional.
*   **Refaktor:** Jelajahi Next.js Server Components untuk mengambil data di sisi server, yang bisa lebih efisien daripada `useEffect` di sisi klien.

Anda kini memiliki fondasi yang kuat. Teruslah bereksperimen dan membangun di atas apa yang telah Anda pelajari. Semoga berhasil!
