# Suggestion card design

The suggestion screen uses a warm menu-card layout and an analogous palette: logo orange (#FC4914, sampled from the logo), amber (#E6AC3D), coral (#E67768) and cream (#FFF8ED). Dark cocoa is the reading colour. Food has a peach header, drinks use an amber tint, and desserts use coral. Text labels and icons identify the category as well as colour.

The item name, listed price and estimated walk are grouped at the top. The description, budget, reason and location each have their own space. Save and Show another option keep visible labels and large touch targets. Extra prototype details are available under Before you head out.

## Typography

- Fraunces: item names and page headings.
- Lora: descriptions and explanations.
- Plus Jakarta Sans: navigation, buttons, labels and numbers.

The Latin font files are served with the application instead of loaded from Google Fonts at runtime. Their SIL Open Font License notices are in `public/fonts/`. System fonts provide fallbacks for other characters and emoji.

Existing GSAP panel timelines provide short, scoped entrance transitions and respect reduced-motion settings. The redesign keeps the existing recommendation rules and account behaviour.

This design is being reviewed on the test site before its changes are pushed to the GitHub repository.
