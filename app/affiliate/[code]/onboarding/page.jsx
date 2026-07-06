import AffiliateOnboardingClient from './AffiliateOnboardingClient';

export const metadata = {
  title: 'Onboarding fiscal | Finarent Affiliation',
};

export default async function AffiliateOnboardingPage({ params, searchParams }) {
  const { code } = await params;
  const sp = await searchParams;
  const token = typeof sp?.token === 'string' ? sp.token : '';
  return <AffiliateOnboardingClient code={code} token={token} />;
}
