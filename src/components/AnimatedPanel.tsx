import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export function AnimatedPanel({ children, animationKey, scroll = false, className = '' }: {
  children: React.ReactNode; animationKey?: string | number; scroll?: boolean; className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current);
      if (!targets.length) return;
      if (scroll) {
        const positions = targets.map(target => ({ target, below: target.getBoundingClientRect().top >= window.innerHeight }));
        positions.forEach(({ target, below }) => gsap.from(target, {
          autoAlpha: 0, y: 10, duration: 0.25, ease: 'power2.out', clearProps: 'all',
          ...(below ? { scrollTrigger: { trigger: target, start: 'clamp(top 96%)', once: true } } : {}),
        }));
      } else {
        gsap.timeline({ defaults: { duration: 0.24, ease: 'power2.out' } })
          .addLabel('enter')
          .from(targets, { autoAlpha: 0, y: 8, stagger: 0.035, clearProps: 'all' }, 'enter');
      }
    });
    return () => media.revert();
  }, { scope: root, dependencies: [animationKey], revertOnUpdate: true });
  return <div ref={root} className={className}>{children}</div>;
}

// Called from useGSAP's contextSafe wrapper in the decision form.
export function scrollToStep(target: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.scrollIntoView({ block: 'nearest' });
    return;
  }
  if (target.getBoundingClientRect().top < 0) {
    gsap.to(window, { scrollTo: { y: target, offsetY: 24, autoKill: true }, duration: 0.25, overwrite: 'auto' });
  }
}
