import { test, expect, Page, Locator } from '@playwright/test';
test.use({hasTouch:true});

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}
async function reachable(page: Page, control: Locator) {
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeVisible();
  const controlBox = await control.boundingBox();
  const nav = await page.getByRole('navigation', {name:'Main navigation'}).boundingBox();
  expect(controlBox!.height).toBeGreaterThanOrEqual(44);
  if (nav && await page.locator('.app-nav').evaluate(el => getComputedStyle(el).position === 'fixed')) {
    expect(controlBox!.y + controlBox!.height).toBeLessThanOrEqual(nav.y + 1);
  }
}
const screens = [
  {name:'small phone',width:320,height:480},
  {name:'compact iPhone size',width:320,height:568},
  {name:'compact Android size',width:360,height:640},
  {name:'older iPhone size',width:375,height:667},
  {name:'modern iPhone size',width:390,height:844},
  {name:'large Android size',width:412,height:915},
  {name:'large iPhone size',width:430,height:932},
  {name:'foldable inner screen size',width:600,height:960},
  {name:'phone landscape',width:844,height:390},
  {name:'large phone landscape',width:915,height:412},
  {name:'tablet',width:768,height:1024},
  {name:'desktop',width:1280,height:800},
];

for (const screen of screens) {
  test(`all main screens fit ${screen.name} (${screen.width}×${screen.height})`, async ({page}) => {
    await page.setViewportSize({width:screen.width,height:screen.height});
    await page.emulateMedia({reducedMotion:'reduce'});
    const errors: string[]=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto('/');
    await noOverflow(page);
    await page.getByRole('button',{name:'Try Decido as a guest'}).click();
    await noOverflow(page);
    const nav=page.getByRole('navigation',{name:'Main navigation'});
    for (const button of await nav.getByRole('button').all()) {
      const box=await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    await reachable(page,page.getByRole('button',{name:'Next: set a budget'}));
    await page.getByRole('button',{name:'Next: set a budget'}).click();
    await noOverflow(page);
    expect(await page.getByLabel('Budget in RM',{exact:true}).evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await reachable(page,page.getByRole('button',{name:'Next: pick a craving'}));
    if (screen.width===390) await page.screenshot({path:'../../outputs/decido-phone-budget.png'});
    await page.getByRole('button',{name:'Next: pick a craving'}).click();
    await noOverflow(page);
    await reachable(page,page.getByRole('button',{name:'Find a suggestion'}));
    await page.getByRole('button',{name:'Find a suggestion'}).click();
    await noOverflow(page);
    await reachable(page,page.getByRole('button',{name:'Save this choice'}));
    await page.getByRole('button',{name:'Save this choice'}).click();
    await noOverflow(page);
    await nav.getByRole('button',{name:'History'}).click();
    await noOverflow(page);
    await reachable(page,page.getByRole('button',{name:'Clear history',exact:true}));
    await page.getByRole('button',{name:'Clear history',exact:true}).click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box=await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(screen.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(screen.height + 1);
    await dialog.getByRole('button',{name:'Cancel'}).click();
    await nav.getByRole('button',{name:'Spending'}).click();await noOverflow(page);
    await nav.getByRole('button',{name:'Settings'}).click();await noOverflow(page);
    await reachable(page,page.getByRole('button',{name:'Save budgets'}));
    await expect(page.getByLabel('Food budget (RM)',{exact:true})).toHaveCSS('font-size','16px');
    expect(errors).toEqual([]);
  });
}

test('large text reflows without horizontal scrolling', async ({page}) => {
  await page.setViewportSize({width:320,height:568});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.addStyleTag({content:'html {font-size:200% !important;}'});
  await noOverflow(page);
  await page.getByRole('button',{name:'Try Decido as a guest'}).click();
  await noOverflow(page);
  await reachable(page,page.getByRole('button',{name:'Next: set a budget'}));
  await page.getByRole('button',{name:'Next: set a budget'}).click();
  await noOverflow(page);
  await reachable(page,page.getByRole('button',{name:'Next: pick a craving'}));
  await page.getByRole('navigation').getByRole('button',{name:'Settings'}).click();
  await noOverflow(page);
  await reachable(page,page.getByRole('button',{name:'Save budgets'}));
});

test('navigation makes room for a simulated keyboard and recovers after it closes', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Try Decido as a guest'}).click();
  await page.getByRole('button',{name:'Next: set a budget'}).click();
  const input = page.getByLabel('Budget in RM',{exact:true});
  await expect(input).toBeVisible();
  await input.focus();
  await expect(input).toBeFocused();
  await page.evaluate(()=>{
    Object.defineProperty(window.visualViewport,'height',{configurable:true,get:()=>window.innerHeight - 320});
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await page.evaluate(()=>{
    delete (window.visualViewport as unknown as {height?:number}).height;
    (document.activeElement as HTMLElement)?.blur();
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect(page.getByRole('navigation')).toBeVisible();
});

test('reserved bottom space follows navigation height changes', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Try Decido as a guest'}).click();
  await page.locator('.app-nav').evaluate(el=>el.style.paddingBottom='44px');
  await expect.poll(async()=>page.evaluate(()=>{
    const nav=document.querySelector('.app-nav')!.getBoundingClientRect();
    const reserved=parseFloat(getComputedStyle(document.querySelector('.app-shell')!).paddingBottom);
    return reserved >= nav.height;
  })).toBe(true);
  await reachable(page,page.getByRole('button',{name:'Next: set a budget'}));
});
