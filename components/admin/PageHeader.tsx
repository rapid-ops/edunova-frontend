export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-2 pt-5 sm:flex-row sm:items-start sm:justify-between lg:px-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0b1a4a]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
