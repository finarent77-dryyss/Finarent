import { redirect } from 'next/navigation';

// Pas de page index pour /quiz (un seul quiz pour l'instant).
// Redirige vers le quiz par défaut.
export default function QuizIndex() {
  redirect('/quiz/quelle-solution');
}
