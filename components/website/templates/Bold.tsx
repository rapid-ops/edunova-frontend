import type { TemplateProps } from '@/lib/theme';
import { makeCtx, OPTS, UtilityBar, Header, Hero, Video, Facts, Footer } from './chrome';
import { About, Programmes, News, Events, Staff, Gallery, Admissions, Testimonials, Faq, Contact } from './sections';

export default function Bold(p: TemplateProps) {
  const x = makeCtx(p, OPTS.bold);
  return (
    <div>
      <Header x={x} kind="dark" /><Hero x={x} kind="overlay" /><Video x={x} />
      <Programmes x={x} kind="cards" /><Facts x={x} kind="band" /><Admissions x={x} /><About x={x} />
      <News x={x} kind="cards" /><Events x={x} /><Staff x={x} kind="cards" /><Gallery x={x} />
      <Testimonials x={x} /><Faq x={x} /><Contact x={x} />
      <Footer x={x} />
    </div>
  );
}
