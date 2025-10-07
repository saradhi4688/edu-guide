import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { X } from 'lucide-react';
import { logEvent } from '../utils/telemetry';

const steps = [
  { id: 'complete_profile', title: 'Complete Profile', desc: 'Add academic details and preferences so recommendations improve.' },
  { id: 'take_quiz', title: 'Take Aptitude Quiz', desc: 'Take a short quiz to surface suitable streams and courses.' },
  { id: 'generate_recs', title: 'Generate Recommendations', desc: 'Allow permissions and generate smart college & course matches.' },
  { id: 'explore_streams', title: 'Explore Streams', desc: 'Browse streams & courses and save what interests you.' }
];

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem('__GUIDED_TOUR_DONE__');
      if (!done) {
        setActive(true);
        logEvent('guided_tour_shown');
      }
    } catch (e) {}
  }, []);

  function close(skip = false) {
    setActive(false);
    localStorage.setItem('__GUIDED_TOUR_DONE__', '1');
    logEvent('guided_tour_completed', { skipped: skip });
  }

  if (!active) return null;

  const step = steps[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => close(true)} />
      <Card className="max-w-2xl w-full z-10">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.desc}</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => close(true)} aria-label="Close tour"><X className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">Step {index + 1} of {steps.length}</div>
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { if (index > 0) { setIndex(index - 1); logEvent('guided_tour_prev', { index: index - 1 }); } }} disabled={index === 0}>Back</Button>
              <Button onClick={() => { if (index < steps.length - 1) { setIndex(index + 1); logEvent('guided_tour_next', { index: index + 1 }); } else { close(false); } }}>{index < steps.length - 1 ? 'Next' : 'Finish'}</Button>
            </div>
            <div>
              <Button variant="ghost" onClick={() => { close(true); }}>Skip Tour</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
