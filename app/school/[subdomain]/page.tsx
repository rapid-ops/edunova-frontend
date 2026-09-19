'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface School {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  subdomain: string;
  logo_url: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacher_name: string;
}

export default function SchoolWebsite() {
  const { subdomain } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
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
      const coursesRes = await api.get(`/courses/school/${s.id}`);
      setCourses(coursesRes.data.courses.filter((c: any) => c.is_published));
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500">School not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-blue-700 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">{school?.name}</h1>
          <p className="text-blue-200 mt-1">{school?.address}</p>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-blue-800 text-white px-6 py-3">
        <div className="max-w-5xl mx-auto flex gap-6 text-sm">
          {['Home', 'Courses', 'About', 'Contact'].map((n) => (
            <a key={n} href={`#${n.toLowerCase()}`} className="hover:text-blue-200 transition">{n}</a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="bg-gradient-to-br from-blue-50 to-white px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-blue-800 mb-4">Welcome to {school?.name}</h2>
          <p className="text-gray-600 text-lg max-w-2xl">
            Providing quality education and shaping the leaders of tomorrow.
            Join us in our journey of academic excellence.
          </p>
          <div className="flex gap-4 mt-8">
            <a href="#courses" className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition">
              View Courses
            </a>
            <a href="#contact" className="border border-blue-700 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Courses */}
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
                  {c.teacher_name && (
                    <p className="text-blue-600 text-sm mt-2">Instructor: {c.teacher_name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">About Us</h2>
          <p className="text-gray-600 max-w-2xl">
            {school?.name} is committed to delivering world-class education in a nurturing environment.
            Our dedicated staff and modern curriculum prepare students for success in academics and life.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <div className="space-y-3 text-gray-600">
            <p>Email: <a href={`mailto:${school?.email}`} className="text-blue-600">{school?.email}</a></p>
            <p>Phone: <span className="text-gray-800">{school?.phone}</span></p>
            <p>Address: <span className="text-gray-800">{school?.address}</span></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-200 px-6 py-6 text-center text-sm">
        <p>© {new Date().getFullYear()} {school?.name}. Powered by <span className="text-white font-medium">Edunova</span></p>
      </footer>
    </div>
  );
}
