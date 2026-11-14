import type { FoodCategory } from '../types/food';

const categoryImages: Record<FoodCategory, string> = {
  food: '🍜', drink: '🧋', dessert: '🍰',
};

// Suggestions and history supply the meal's saved image; category tiles use a representative image.
export function CategoryIllustration({ category, emoji, className }: {
  category?: FoodCategory; emoji?: string; className: string;
}) {
  const kind = category === 'drink' || category === 'dessert' ? category : 'food';
  return (
    <span className={`meal-art ${className}`} data-category={kind} aria-hidden="true">
      <span className="meal-art-orbit" />
      <span className="meal-art-image">{emoji?.trim() || categoryImages[kind]}</span>
      <span className="meal-art-spark">✦</span>
    </span>
  );
}
