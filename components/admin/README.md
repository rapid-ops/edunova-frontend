# Admin kit (components/admin)

Import from '@/components/admin/<Name>'. Props only grow; existing ones stay stable.

- PageHeader { title, subtitle?, actions? }
- StatCard { label, value, icon (Lucide), tone? blue|green|purple|orange|red, hint?, loading? }
- StatusBadge { tone? green|blue|orange|red|purple|gray, children }
- Avatar { name?, src? (avatar_url), size?, className? } initials when src is empty
- Pagination { page (1-based), pageSize, total, onPage, noun? }
- FilterBar { search, onSearch, placeholder?, children? } and selectClass for selects
- DataTable<T> { columns: Column<T>[], rows, rowKey, onRowClick?, loading?, emptyTitle?, emptyMessage? }
  Column { key, header, render?, className?, primary?, hideOnMobile? } table on md+, cards below md
- DetailPanel { open, title, onClose, children } right panel on lg, full page below lg
- EmptyState { icon?, title, message?, action? }, ErrorState { message?, onRetry? }, Skeleton { className }
- Charts (inline SVG, no library):
  LineChart { labels, series: [{ name, color, values }], height?, max?, unit? }
  BarChart { labels, series, height?, max?, format? } (several series are grouped)
  DonutChart { segments: [{ label, value, color }], size?, thickness?, centerLabel?, centerSub? }
  ProgressRing { value 0-100, size?, thickness?, color?, label? }

Example:
  <PageHeader title="Students" subtitle="Manage students" actions={<button>Add</button>} />
  <StatCard label="Total" value={n} icon={Users} loading={loading} />
  <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} loading={loading} />
  <Pagination page={page} pageSize={10} total={total} onPage={setPage} noun="students" />

Navigation lives in lib/admin-nav.ts. To switch a sidebar entry to a new page set its href and enabled: true.
