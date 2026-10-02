import type { TemplateProps } from '@/lib/theme';
import { makeCtx, OPTS, UtilityBar, Header, Hero, Video, Facts, Footer } from './chrome';
import { About, Programmes, News, Events, Staff, Gallery, Admissions, Testimonials, Faq, Contact } from './sections';

export default function Vibrant(p: TemplateProps) {
  const x = makeCtx(p, OPTS.vibrant);
  return (
    <div>
      <Header x={x} /><Hero x={x} kind="bright" /><Facts x={x} kind="cards" /><Video x={x} />
      <Programmes x={x} kind="cards" /><About x={x} /><News x={x} kind="cards" /><Events x={x} />
      <Staff x={x} kind="round" /><Gallery x={x} kind="masonry" /><Admissions x={x} /><Testimonials x={x} /><Faq x={x} /><Contact x={x} />
      <Footer x={x} />
    </div>
  );
}
