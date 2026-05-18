'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/prospects/tracker';

// Capture les UTM + referrer + landing page au premier hit (first-touch).
// Stocké en localStorage et envoyé avec chaque tracking event.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
