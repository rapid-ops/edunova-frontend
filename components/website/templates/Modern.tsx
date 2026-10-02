import type { TemplateProps } from '@/lib/theme';
import { makeCtx, OPTS, UtilityBar, Header, Hero, Video, Facts, Footer } from './chrome';
import { About, Programmes, News, Events, Staff, Gallery, Admissions, Testimonials, Faq, Contact } from './sections';

export default function Modern(p: TemplateProps) {
  const x = makeCtx(p, OPTS.modern);
  return (
    <div>
      <UtilityBar x={x} /><Header x={x} /><Hero x={x} kind="overlay" /><Video x={x} /><Facts x={x} kind="row" />
      <About x={x} /><Programmes x={x} kind="list" /><News x={x} kind="cards" /><Events x={x} />
      <Staff x={x} kind="grid" /><Gallery x={x} /><Admissions x={x} /><Testimonials x={x} /><Faq x={x} /><Contact x={x} />
      <Footer x={x} />
    </div>
  );
}
