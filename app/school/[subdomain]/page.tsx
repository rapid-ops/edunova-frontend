'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SchoolWebsite() {
  const { subdomain } = useParams();
  const router = useRouter();
  const [school, setSchool] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchSchoolData();
  }, [subdomain]);

  const fetchSchoolData = async () => {
    try {
      const res = await api.get(`/schools/subdomain/${subdomain}`);
      const s = res.data.school;
      setSchool(s);

      if (s.external_website_url) {
        window.location.href = s.external_website_url;
        return;
      }

      if (s.website_config) {
        setConfig(JSON.parse(s.website_config));
      }

      const coursesRes = await api.get(`/courses/school/${s.id}`);
      setCourses(coursesRes.data.courses.filter((c: any) => c.is_published));
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;
  if (notFound) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-500">School not found.</p></div>;

  const primaryColor = config.primary_color || '#1d4ed8';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header style={{ backgroundColor: primaryColor }} className="text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">{school?.name}</h1>
          <p className="mt-1 opacity-80">{config.tagline || school?.address}</p>
        </div>
      </header>

      <nav style={{ backgroundColor: primaryColor }} className="opacity-90 text-white px-6 py-3">
        <div className="max-w-5xl mx-auto flex gap-6 text-sm">
          {['Home', 'Courses', 'About', 'Contact'].map((n) => (
            <a key={n} href={`#${n.toLowerCase()}`} className="hover:opacity-70 transition">{n}</a>
          ))}
        </div>
      </nav>

      <section id="home" className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>Welcome to {school?.name}</h2>
          <p className="text-gray-600 text-lg max-w-2xl">{config.about || 'Providing quality education and shaping the leaders of tomorrow.'}</p>
          <div className="flex gap-4 mt-8">
            <a href="#courses" style={{ backgroundColor: primaryColor }} className="text-white px-6 py-3 rounded-lg font-medium">View Courses</a>
            <a href="#contact" style={{ borderColor: primaryColor, color: primaryColor }} className="border px-6 py-3 rounded-lg font-medium">Contact Us</a>
          </div>
        </div>
      </section>

      <section id="courses" className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Our Courses</h2>
          <p className="text-gray-500 mb-8">Explore our published curriculum</p>
          {courses.length === 0 ? (
            <p className="text-gray-400">No published courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <h3 className="font-semibold text-lg">{c.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{c.description}</p>
                  {c.teacher_name && <p className="text-sm mt-2" style={{ color: primaryColor }}>Instructor: {c.teacher_name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">About Us</h2>
          <p className="text-gray-600 max-w-2xl">{config.about || `${school?.name} is committed to delivering world-class education in a nurturing environment.`}</p>
        </div>
      </section>

      <section id="contact" className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <div className="space-y-3 text-gray-600">
            <p>Email: <a href={`mailto:${config.email || school?.email}`} style={{ color: primaryColor }}>{config.email || school?.email}</a></p>
            <p>Phone: <span className="text-gray-800">{config.phone || school?.phone}</span></p>
            <p>Address: <span className="text-gray-800">{config.address || school?.address}</span></p>
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: primaryColor }} className="text-white px-6 py-6 text-center text-sm opacity-90">
        <p>© {new Date().getFullYear()} {school?.name}. Powered by <span className="font-medium">Edunova</span></p>
      </footer>
    </div>
  );
}
