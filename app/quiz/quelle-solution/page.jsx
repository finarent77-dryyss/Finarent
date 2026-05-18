import QuizClient from './QuizClient';

export const metadata = {
  title: 'Quiz : quelle solution de financement pour vous ?',
  description: 'En 5 questions, découvrez la solution de financement Finarent la plus adaptée à votre projet : prêt pro, crédit-bail, LOA, leasing.',
  alternates: { canonical: '/quiz/quelle-solution' },
};

export default function QuizPage() {
  return <QuizClient />;
}
