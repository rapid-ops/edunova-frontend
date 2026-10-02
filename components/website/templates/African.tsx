import type { TemplateProps } from '@/lib/theme';
import { makeCtx, OPTS, UtilityBar, Header, Hero, Video, Facts, Footer } from './chrome';
import { About, Programmes, News, Events, Staff, Gallery, Admissions, Testimonials, Faq, Contact } from './sections';

export default function African(p: TemplateProps) {
  const x = makeCtx(p, OPTS.african);
  return (
    <div>
      <UtilityBar x={x} /><Header x={x} /><Hero x={x} kind="pattern" /><Video x={x} /><Facts x={x} kind="band" />
      <About x={x} /><Programmes x={x} kind="numbered" /><Events x={x} /><News x={x} kind="cards" />
      <Staff x={x} kind="cards" /><Gallery x={x} /><Admissions x={x} /><Testimonials x={x} /><Faq x={x} /><Contact x={x} />
      <Footer x={x} />
    </div>
  );
}
