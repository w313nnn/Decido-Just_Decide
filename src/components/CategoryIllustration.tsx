import type { FoodCategory } from '../types/food';

const art = {
  food: {
    backdrop: '#f6d6a8',
    drawing: <>
      <path d="m45 32 19-20M52 34l22-17" stroke="#9e4625" strokeWidth="3.5" />
      <path d="M22 46c2-11 14-16 26-16s24 5 26 16" fill="#ffe096" />
      <path d="M29 43c3-4 6 4 10 0s7 4 11 0 7 4 11 0" stroke="#b36a29" strokeWidth="2" />
      <path d="M19 47h58c-3 17-14 27-29 27S22 64 19 47Z" fill="#ef7957" />
      <path d="M30 57h36" stroke="#fff0df" strokeWidth="3" />
    </>,
  },
  drink: {
    backdrop: '#f3d488',
    drawing: <>
      <path d="m49 46 7-28 11-5" stroke="#a84935" strokeWidth="4" />
      <path d="M28 34h40l-5 40H33Z" fill="#efa866" />
      <path d="M31 46h34l-3 25H34Z" fill="#c77e49" stroke="none" />
      <path d="M27 34h42" stroke="#fff8ed" strokeWidth="6" />
      <g fill="#6b4030" stroke="none"><circle cx="40" cy="63" r="3" /><circle cx="50" cy="66" r="3" /><circle cx="57" cy="60" r="3" /></g>
    </>,
  },
  dessert: {
    backdrop: '#f0b6a6',
    drawing: <>
      <path d="M23 53 50 28l24 19v21L23 73Z" fill="#f7c88a" />
      <path d="m23 53 51-6v9l-51 7Z" fill="#f38c8a" />
      <path d="M23 53 50 28l24 19Z" fill="#fff1df" />
      <path d="M49 31c-7-2-5-10 0-12 5 1 8 8 3 11Z" fill="#dc5e59" />
      <path d="m50 19 3-4" stroke="#8b4b32" strokeWidth="2" />
    </>,
  },
};

export function CategoryIllustration({ category, className }: { category?: FoodCategory; className: string }) {
  const { backdrop, drawing } = category === 'drink' || category === 'dessert' ? art[category] : art.food;
  return (
    <svg className={className} viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <path d="M85 43c6 24-12 42-36 42S8 72 9 48 27 10 51 10s29 11 34 33Z" fill={backdrop} />
      <circle cx="48" cy="48" r="43" fill="none" stroke="#8b4b32" strokeOpacity=".25" strokeDasharray="3 5" />
      <g fill="none" stroke="#743c2a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{drawing}</g>
      <path d="M81 15c0 4 2 6 6 6-4 0-6 2-6 6 0-4-2-6-6-6 4 0 6-2 6-6Z" fill="#a6512c" />
    </svg>
  );
}
