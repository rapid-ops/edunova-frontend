'use client';
import { useState, useEffect } from 'react';
import { Award, Briefcase, BookOpen, Star } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function SkillPassportPage() {
  const { user } = useAuthStore();
  const [passport, setPassport] = useState<any>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [careerLoading, setCareerLoading] = useState(false);
  const [tab, setTab] = useState<'passport' | 'careers'>('passport');

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/ai/skill-passport/${user.id}`)
      .then(r => setPassport(r.data.passport))
      .catch(() => {});
  }, [user]);

  const matchCareers = async () => {
    setCareerLoading(true);
    try {
      const r = await api.post('/ai/career-match', { student_id: user?.id });
      setCareers(r.data.careers || []);
    } catch {}
    finally { setCareerLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Award size={22} className="text-blue-600" />Skill Passport
      </h1>
      <div className="flex gap-2">
        <button onClick={() => setTab('passport')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'passport' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          Passport
        </button>
        <button onClick={() => setTab('careers')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'careers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          Careers
        </button>
      </div>

      {tab === 'passport' && (
        <div className="bg-white rounded-xl border p-5 space-y-5">
          {!passport && <p className="text-gray-400 text-sm">Loading...</p>}
          {passport && (
            <>
              <div>
                <h2 className="font-semibold flex items-center gap-2 mb-2">
                  <BookOpen size={15} />Courses Completed
                </h2>
                {passport.courses_completed?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {passport.courses_completed.map((c: any, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{c.title}</span>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm">None yet.</p>}
              </div>
              <div>
                <h2 className="font-semibold flex items-center gap-2 mb-2">
                  <Star size={15} />Competencies
                </h2>
                {passport.competencies?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {passport.competencies.map((c: string, i: number) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm">None yet.</p>}
              </div>
              <div>
                <h2 className="font-semibold flex items-center gap-2 mb-2">
                  <Award size={15} />Certificates
                </h2>
                {passport.certificates?.length ? (
                  <div className="space-y-1">
                    {passport.certificates.map((c: any, i: number) => (
                      <p key={i} className="text-sm">{c.title} — {new Date(c.issued_at).toLocaleDateString()}</p>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm">None yet.</p>}
              </div>
              <p className="text-sm text-gray-500">
                Avg quiz score: <strong>{passport.avg_quiz_score}%</strong>
              </p>
            </>
          )}
        </div>
      )}

      {tab === 'careers' && (
        <div className="space-y-4">
          <button onClick={matchCareers} disabled={careerLoading} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-40">
            {careerLoading ? 'Analyzing...' : 'Match My Careers'}
          </button>
          {!careers.length && !careerLoading && (
            <p className="text-gray-400 text-sm">Click above to get career matches.</p>
          )}
          {careers.map((c: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border p-5 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Briefcase size={15} />{c.title}
                </h3>
                <span className="text-blue-600 font-bold text-sm">
                  {Math.round((c.match_score || 0) * 100)}% match
                </span>
              </div>
              {c.required_skills?.length > 0 && (
                <p className="text-xs text-gray-500">Required: {c.required_skills.join(', ')}</p>
              )}
              {c.skill_gaps?.length > 0 && (
                <p className="text-xs text-red-500">Gaps: {c.skill_gaps.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
