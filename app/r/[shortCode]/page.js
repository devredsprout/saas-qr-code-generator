import { redirect } from 'next/navigation';
export default function RedirectPage({ params }) {
  redirect(`/api/r/${params.shortCode}`);
}
