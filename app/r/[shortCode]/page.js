import { redirect } from 'next/navigation';

export default function RedirectPage({ params }) {
  // Forward to API route which handles logging + redirect
  redirect(`/api/r/${params.shortCode}`);
}
