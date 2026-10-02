export interface Post { slug: string; title: string; date: string; read: string; tag: string; excerpt: string; body: string[] }
export const posts: Post[] = [
  { slug: 'moving-your-school-online', title: 'Moving your school online: where to start', date: '2026-09-10', read: '4 min', tag: 'Guides',
    excerpt: 'A simple first month for schools going digital.',
    body: ['Start with one class and one subject. Prove the routine before you scale.', 'Put your timetable, lesson notes and assignments in one place so students know where to look.', 'Train teachers first. A confident teacher is the best onboarding tool you have.'] },
  { slug: 'keeping-parents-in-the-loop', title: 'Keeping parents in the loop', date: '2026-09-17', read: '3 min', tag: 'Parents',
    excerpt: 'Why attendance and fee updates reduce office calls.',
    body: ['Parents want three things: grades, attendance and fees.', 'Sending updates by WhatsApp reaches families faster than paper notices.', 'A parent portal cuts repeated questions to the school office.'] },
  { slug: 'digital-certificates-that-last', title: 'Digital certificates that cannot be faked', date: '2026-09-24', read: '3 min', tag: 'Certificates',
    excerpt: 'How verifiable certificates protect your graduates.',
    body: ['Paper certificates are easy to copy.', 'A verifiable certificate lets an employer confirm it online in seconds.', 'This protects your school name as well as your students.'] },
  { slug: 'ai-tutoring-in-the-classroom', title: 'AI tutoring in the classroom', date: '2026-09-30', read: '5 min', tag: 'EdTech',
    excerpt: 'How an AI tutor supports teachers instead of replacing them.',
    body: ['An AI tutor answers routine questions so teachers can focus on harder ones.', 'Students get help at any hour, including during revision.', 'Teachers stay in control of the course content.'] },
];
