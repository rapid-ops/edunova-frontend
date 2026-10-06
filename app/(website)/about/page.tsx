import type { Metadata } from 'next';
import Reveal from '@/components/website/Reveal';

export const metadata: Metadata = {
  title: 'About | Edunova',
  description: 'Learn about Edunova and our mission to power African schools.',
};

const team = [
  { name: 'Amara Osei', role: 'Co-founder & CEO', bio: 'Amara spent a decade in Nigerian ed-admin before building the tool she wished existed. She leads strategy and school partnerships.' },
  { name: 'Tunde Adeyemi', role: 'CTO', bio: 'Tunde architected Edunova from a single Termux session. He obsesses over uptime, API performance, and developer experience.' },
  { name: 'Chisom Eze', role: 'Head of Product', bio: 'Chisom turns school-admin pain into clean product flows. She runs weekly calls with principals across six Nigerian states.' },
];

const milestones = [
  { year: '2022', event: 'Idea born at a Lagos hackathon' },
  { year: '2023', event: 'First school onboarded' },
  { year: '2024', event: 'AI Tutor launched' },
  { year: '2025', event: 'Blockchain certificates introduced' },
  { year: '2026', event: 'Expanding across West Africa' },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-800">
      <section className="bg-slate-900 text-white px-4 py-24 text-center">
        <Reveal>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Built in Nigeria, for Africa</h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-lg leading-relaxed">Edunova exists because African schools deserve world-class tools built around their realities — local languages, local payment rails, and communication channels parents already use.</p>
        </Reveal>
      </section>
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <Reveal><h2 className="text-3xl font-bold text-center mb-12">Our Team</h2></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <Reveal key={member.name}>
              <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center text-center border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                <p className="text-blue-600 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Reveal><h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2></Reveal>
          <ol className="relative border-l border-blue-200 ml-4 space-y-8">
            {milestones.map((m) => (
              <Reveal key={m.year}>
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 ring-4 ring-white" />
                  <p className="text-blue-700 font-bold text-sm mb-1">{m.year}</p>
                  <p className="text-slate-700">{m.event}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      <section className="px-4 py-20 max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="text-3xl font-bold mb-6">Built for Nigerian realities</h2>
          <p className="text-slate-600 text-lg leading-relaxed">Payments run through Paystack in Naira. Notifications go out on WhatsApp. Our infrastructure is sized for variable connectivity and the realities of running a school in Lagos, Abuja, or Enugu — not Silicon Valley.</p>
        </Reveal>
      </section>
    </main>
  );
}
