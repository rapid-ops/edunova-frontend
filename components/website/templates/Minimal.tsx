import type { TemplateProps } from '@/lib/theme';
import { makeCtx, OPTS, UtilityBar, Header, Hero, Video, Facts, Footer } from './chrome';
import { About, Programmes, News, Events, Staff, Gallery, Admissions, Testimonials, Faq, Contact } from './sections';

export default function Minimal(p: TemplateProps) {
  const x = makeCtx(p, OPTS.minimal);
  return (
    <div>
      <Header x={x} kind="centered" /><Hero x={x} kind="plain" /><Video x={x} /><Facts x={x} kind="row" />
      <About x={x} /><Programmes x={x} kind="rows" /><News x={x} kind="rows" /><Events x={x} />
      <Staff x={x} kind="round" /><Gallery x={x} /><Admissions x={x} /><Testimonials x={x} /><Faq x={x} /><Contact x={x} />
      <Footer x={x} />
    </div>
  );
}
