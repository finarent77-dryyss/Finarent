'use client';

import { useState } from 'react';

/**
 * Wrapper qui propose deux modes :
 *  - "guide" : wizard Pretto-style (1 question par écran)
 *  - "expert" : formulaire historique single-page
 * Toggle visible si les deux composants sont fournis. Default = "guide".
 */
export default function SimulatorModeToggle({ ExpertComponent, WizardComponent }) {
  const [mode, setMode] = useState('guide');
  if (!WizardComponent) return <ExpertComponent />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="inline-flex bg-gray-100 rounded-xl p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('guide')}
            className={`px-4 py-2 rounded-lg transition ${mode === 'guide' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-1.5 text-emerald-500"></i>
            Mode guidé
          </button>
          <button
            type="button"
            onClick={() => setMode('expert')}
            className={`px-4 py-2 rounded-lg transition ${mode === 'expert' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fa-solid fa-sliders mr-1.5 text-violet-500"></i>
            Mode expert
          </button>
        </div>
      </div>

      {mode === 'guide' ? <WizardComponent /> : <ExpertComponent />}
    </div>
  );
}
