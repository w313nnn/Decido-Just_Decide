import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { FoodCategory, FoodPreference } from '../types/food';
import { parsePromptLocally } from '../services/aiHelperService';
import { AnimatedPanel, scrollToStep } from './AnimatedPanel';

interface Props {
  onDecide: (category: FoodCategory, budget: number, preference: FoodPreference, note?: string) => void;
  defaultBudgets: { food: number; drink: number; dessert: number };
  initialSelection?: { category: FoodCategory; budget: number; preference: FoodPreference };
}
const steps = ['Choose', 'Budget', 'Craving'];
const choices: Record<FoodCategory, { id: FoodPreference; label: string }[]> = {
  food: [{id:'anything',label:'Anything'}, {id:'spicy',label:'Spicy'}, {id:'soup',label:'Soup'}, {id:'rice',label:'Rice'}, {id:'noodles',label:'Noodles'}, {id:'light',label:'Something light'}],
  drink: [{id:'anything',label:'Anything'}, {id:'refreshing',label:'Refreshing'}, {id:'comfort',label:'Coffee or tea'}, {id:'sweet',label:'Something sweet'}, {id:'light',label:'Something light'}],
  dessert: [{id:'anything',label:'Anything'}, {id:'refreshing',label:'Something cold'}, {id:'soup',label:'Warm tong sui'}, {id:'sweet',label:'Something sweet'}, {id:'light',label:'Something light'}],
};
export function DecideFlow({ onDecide, defaultBudgets, initialSelection }: Props) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<FoodCategory>(initialSelection?.category || 'food');
  const [budget, setBudget] = useState(String(initialSelection?.budget ?? defaultBudgets.food));
  const [preference, setPreference] = useState<FoodPreference>(initialSelection?.preference || 'anything');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { contextSafe } = useGSAP({ scope: root });
  const move = contextSafe((next: number) => {
    setStep(next); setMessage('');
    // Focus after React commits the new step; the effect below owns the focus.
  });
  useGSAP(() => {
    if (step > 1 && heading.current) {
      heading.current.focus({ preventScroll: true });
      scrollToStep(heading.current);
    }
  }, { scope: root, dependencies: [step], revertOnUpdate: true });
  const amount = Number(budget);
  const valid = budget.trim() !== '' && Number.isFinite(amount) && amount >= 1 && amount <= 100;
  function selectCategory(value: FoodCategory) {
    setCategory(value); setBudget(String(defaultBudgets[value])); setPreference('anything');
  }
  function useDescription() {
    const parsed = parsePromptLocally(description);
    const nextCategory = parsed.category || category;
    setCategory(nextCategory);
    setBudget(String(parsed.budget ?? defaultBudgets[nextCategory]));
    setPreference(choices[nextCategory].some(c => c.id === parsed.preference) ? parsed.preference! : 'anything');
    setStep(2);
    setMessage('Check your budget, then choose a craving. Dietary needs can be set in Settings.');
  }
  return <div ref={root}>
    <div className="page-intro"><p className="eyebrow">UTAR Sungai Long · Prototype</p>
      <h1>What should we have?</h1><p>Choose a few details. We’ll suggest something nearby.</p></div>
    <ol className="step-list" aria-label="Your progress">
      {steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>
        <button type="button" disabled={index + 1 > step} onClick={() => move(index + 1)}>
          <span className="step-number">{index + 1}</span><span>{label}</span>
        </button></li>)}
    </ol>
    <AnimatedPanel animationKey={step} className="surface">
      <form onSubmit={event => { event.preventDefault();
        if (step === 1) move(2);
        else if (!valid) setMessage('Enter a budget from RM1 to RM100.');
        else if (step === 2) move(3);
        else onDecide(category, Math.round(amount * 100) / 100, preference);
      }}>
        <p className="eyebrow" data-reveal>Step {step} of 3</p>
        <h2 ref={heading} tabIndex={-1} data-reveal>{step === 1 ? 'What are you looking for?' : step === 2 ? 'How much would you like to spend?' : 'What do you feel like?'}</h2>
        <p className="muted" data-reveal>{step === 1 ? 'Pick one to get started.' : step === 2 ? 'This is your maximum budget for one item. We won’t raise it for you.' : 'Choose a craving, or leave it on Anything.'}</p>
        {step === 1 && <fieldset data-reveal><legend className="sr-only">Category</legend><div className="choice-grid three">
          {([{id:'food',label:'Food',emoji:'🍚'}, {id:'drink',label:'Drink',emoji:'🥤'}, {id:'dessert',label:'Dessert',emoji:'🍰'}] as const).map(c =>
            <label key={c.id} className={`choice ${category === c.id ? 'selected' : ''}`}>
              <input type="radio" name="category" value={c.id} checked={category === c.id} onChange={() => selectCategory(c.id)} />
              <span className="choice-emoji" aria-hidden="true">{c.emoji}</span><span>{c.label}</span>
            </label>)}
        </div></fieldset>}
        {step === 2 && <div data-reveal>
          <label htmlFor="budget">Budget in RM</label>
          <input id="budget" className="budget-input" type="number" inputMode="decimal" min="1" max="100" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} required aria-describedby="budget-help" />
          <p id="budget-help" className="muted small">You can enter any amount from RM1 to RM100.</p>
          <div className="preset-row">{[3,5,10,15,20].map(n => <button type="button" className="secondary" aria-pressed={amount === n} key={n} onClick={() => setBudget(String(n))}>RM{n}</button>)}</div>
        </div>}
        {step === 3 && <fieldset data-reveal><legend className="sr-only">Craving</legend><div className="choice-grid">
          {choices[category].map(c => <label className={`choice compact ${preference === c.id ? 'selected' : ''}`} key={c.id}>
            <input type="radio" name="preference" checked={preference === c.id} onChange={() => setPreference(c.id)} value={c.id} />{c.label}
          </label>)}
        </div><p className="summary">{category === 'food' ? 'Food' : category === 'drink' ? 'Drink' : 'Dessert'} · Up to RM{Number(budget).toFixed(2)}</p></fieldset>}
        {message && <p role="status" className="notice">{message}</p>}
        <div className="actions" data-reveal>
          {step > 1 && <button type="button" className="secondary" onClick={() => move(step - 1)}>Back</button>}
          <button className="primary grow" type="submit">{step === 1 ? 'Next: set a budget' : step === 2 ? 'Next: pick a craving' : 'Find a suggestion'}</button>
        </div>
      </form>
    </AnimatedPanel>
    {step === 1 && <details className="shortcut"><summary>Prefer to describe what you want?</summary>
      <label htmlFor="description">A short description</label><input id="description" value={description} maxLength={300} onChange={e => setDescription(e.target.value)} placeholder="For example: noodles under RM10" />
      <p className="small muted">This shortcut recognises simple words on your device. You can check and change the choices before continuing.</p>
      <button type="button" disabled={!description.trim()} className="secondary" onClick={useDescription}>Fill in my choices</button>
    </details>}
    <p className="small muted footnote">Suggestions use a sample local list, not your live location. Prices and dietary labels need checking with the shop.</p>
  </div>;
}
