import ContactForm, { ContactLinks } from '@/components/website/ContactForm';

export const metadata = { title: 'Contact | Edunova', description: 'Talk to the Edunova team.' };

export default function Contact() {
  return (
    <section className="px-4 py-16"><div className="mx-auto max-w-5xl">
      <h1 className="mb-10 text-4xl font-bold tracking-tight text-slate-900">Contact us</h1>
      <div className="grid gap-10 md:grid-cols-2"><ContactForm /><ContactLinks /></div>
    </div></section>
  );
}
