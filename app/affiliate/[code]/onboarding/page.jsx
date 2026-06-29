import AffiliateOnboardingClient from './AffiliateOnboardingClient';

export const metadata = {
  title: 'Onboarding fiscal | Finarent Affiliation',
};

export default async function AffiliateOnboardingPage({ params }) {
  const { code } = await params;
  return <AffiliateOnboardingClient code={code} />;
}
