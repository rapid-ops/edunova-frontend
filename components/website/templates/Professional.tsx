import type { TemplateProps } from '@/lib/theme';
import { makeCtx, OPTS, UtilityBar, Header, Hero, Video, Facts, Footer } from './chrome';
import { About, Programmes, News, Events, Staff, Gallery, Admissions, Testimonials, Faq, Contact } from './sections';

export default function Professional(p: TemplateProps) {
  const x = makeCtx(p, OPTS.professional);
  return (
    <div>
      <UtilityBar x={x} /><Header x={x} kind="dark" /><Hero x={x} kind="split" /><Facts x={x} kind="band" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <About x={x} /><Programmes x={x} kind="table" /><News x={x} kind="rows" /><Staff x={x} kind="cards" />
          <Gallery x={x} /><Testimonials x={x} /><Faq x={x} />
        </div>
        <aside className="space-y-6 py-14 lg:sticky lg:top-24 lg:self-start lg:py-20">
          <Admissions x={x} side /><Events x={x} side /><Contact x={x} side />
        </aside>
      </div>
      <Footer x={x} />
    </div>
  );
}
