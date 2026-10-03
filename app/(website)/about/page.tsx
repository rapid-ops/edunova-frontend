export const metadata = { title: 'About | Edunova', description: 'Built in Nigeria, for Africa.' };

const timeline = [['Idea', 'Edunova starts as a way to help Nigerian schools teach online.'], ['First schools', 'Early schools join and shape the product.'], ['Today', 'A full LMS with AI, parent portal and verifiable certificates.']];

export default function About() {
  return (
    <>
      <section className="px-4 py-16"><div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Built in Nigeria, for Africa</h1>
        <p className="mt-4 text-lg text-slate-600">Our mission is to give every African school the tools to teach well online, at a price they can afford.</p>
      </div></section>
      <section className="bg-slate-50 px-4 py-14"><div className="mx-auto max-w-3xl space-y-5">
        <h2 className="text-2xl font-bold text-slate-900">Our journey</h2>
        {timeline.map(([t, d], i) => (
          <div key={t} className="flex gap-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{i + 1}</div><div><div className="font-semibold text-slate-900">{t}</div><p className="text-slate-600">{d}</p></div></div>
        ))}
      </div></section>
    </>
  );
}
