export const metadata = { title: 'Terms of Service | Edunova' };

const s: [string, string][] = [
  ['Acceptance', 'By creating an account or using Edunova you agree to these terms. Schools agree on behalf of their staff and students.'],
  ['The service', 'Edunova provides online tools for schools to manage learning, results, communication and fees. Features depend on your plan.'],
  ['Accounts', 'You must give accurate information and keep your login secure. Schools are responsible for activity under their accounts.'],
  ['Fees and payment', 'Paid plans are billed in Naira, monthly or annually. Fees already paid are non-refundable except where the law requires.'],
  ['Acceptable use', 'Do not misuse the service, attempt to break its security, upload unlawful content or infringe others\' rights.'],
  ['Your content', 'Schools own their data and content. You give us permission to host and process it to provide the service.'],
  ['Availability', 'We aim for reliable service but do not guarantee it will be uninterrupted or error free.'],
  ['Liability', 'To the extent the law allows, our liability is limited to the fees paid in the previous three months.'],
  ['Governing law', 'These terms are governed by the laws of the Federal Republic of Nigeria.'],
];
export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: October 2026</p>
      {s.map(([h, t]) => <section key={h} className="mt-8"><h2 className="text-xl font-semibold text-slate-900">{h}</h2><p className="mt-2 leading-relaxed text-slate-700">{t}</p></section>)}
    </article>
  );
}
