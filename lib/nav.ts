import type { useRouter } from 'next/navigation';

type Router = ReturnType<typeof useRouter>;

// Go back to the page the user came from. If the page was opened directly, go to the fallback instead.
export function goBack(router: Router, fallback: string) {
  if (typeof window !== 'undefined' && window.history.length > 1) router.back();
  else router.push(fallback);
}
