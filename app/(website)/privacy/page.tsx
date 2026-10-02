export const metadata = { title: 'Privacy Policy | Edunova' };

const s: [string, string][] = [
  ['Who we are', 'Edunova provides a learning management platform to schools in Nigeria. We act as a data processor for school data and as a data controller for our own website and accounts.'],
  ['Data we collect', 'Account details (name, email, phone), school and class records, learning activity, grades, attendance, fee records, and technical data such as device and log information.'],
  ['Why we use it (NDPR)', 'We process personal data under the Nigeria Data Protection Regulation (NDPR) and the Nigeria Data Protection Act 2023, on the basis of contract, consent and legitimate interest, to run the service, secure it and improve it.'],
  ['Children', 'Schools are responsible for obtaining parental consent for students under 18 before using Edunova.'],
  ['Sharing', 'We do not sell personal data. We share it only with service providers needed to run Edunova, such as hosting and payment processors, and where the law requires.'],
  ['Retention and security', 'We keep data while a school account is active and as the law requires. We use access controls and encrypted connections to protect it.'],
  ['Your rights', 'You may request access, correction, deletion or restriction of your personal data, and may complain to the Nigeria Data Protection Commission.'],
  ['Contact', 'Use the contact page to reach our data protection contact.'],
];
export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: October 2026</p>
      {s.map(([h, t]) => <section key={h} className="mt-8"><h2 className="text-xl font-semibold text-slate-900">{h}</h2><p className="mt-2 leading-relaxed text-slate-700">{t}</p></section>)}
    </article>
  );
}
