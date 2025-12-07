"use client";
import { useState, useEffect, ChangeEvent } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface ContentData {
  id?: number;
  [key: string]: string | number | undefined;
}

interface SectionFormProps {
  title: string;
  data: ContentData | null;
  setData: React.Dispatch<React.SetStateAction<ContentData | null>>;
  onSave: () => void;
}

const SectionForm = ({ title, data, setData, onSave }: SectionFormProps) => {
    if (!data) return <p>Loading {title}...</p>;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setData((prev) => {
            if (!prev) return null;
            return { ...prev, [name]: value };
        });
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <h2>Edit {title}</h2>
            {Object.keys(data).map((key) => (
                key !== 'id' && (
                    <div key={key} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>
                            {key}
                        </label>
                        <input
                            type="text"
                            name={key}
                            value={data[key] ?? ''}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                )
            ))}
            <button
                onClick={onSave}
                style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Save {title}
            </button>
        </div>
    );
};

export default function AdminPage() {
  const { data: session, status } = useSession();
    const [header, setHeader] = useState<ContentData | null>(null);
    const [about, setAbout] = useState<ContentData | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn(); // Redirect ke halaman login jika belum login
        }
    }, [status]);

    useEffect(() => {
      if (status == 'authenticated') {
        const fetchContent = async () => {
            try {
                const res = await fetch('/api/content');
                const data = await res.json() as { Header: ContentData; About: ContentData };
                setHeader(data.Header);
                setAbout(data.About);
            } catch (err) {
                console.error("Failed to fetch content", err);
            }
        };
        fetchContent();
      }
    }, [status]);

    const handleSave = async (section: string, data: ContentData | null) => {
        if (!data) return;

        try {
            const res = await fetch(`/api/content?section=${section}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to save ${section}`);
            }

            alert(`${section} saved successfully!`);

        // 2. ERROR HANDLING
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "An unknown error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }

            alert(`Error saving ${section}: ${errorMessage}`);
        }
    };

    if (status !== 'authenticated') {
            return <p>Loading or not authenticated...</p>;
        }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1>Admin Panel</h1>
            <p>Ubah konten halaman utama disini</p>

            <SectionForm
                title="Header"
                data={header}
                setData={setHeader}
                onSave={() => handleSave('header', header)}
            />
            <SectionForm
                title="About"
                data={about}
                setData={setAbout}
                onSave={() => handleSave('about', about)}
            />

            {/*TODO: Tambahkan section untuk update konten lainya disini*/}

        </div>
    );
}
