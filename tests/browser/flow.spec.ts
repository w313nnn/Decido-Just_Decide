import { test, expect } from '@playwright/test';

test('a new guest can follow the numbered steps, save once, and clear history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Try Decido as a guest' }).click();
  await expect(page.getByRole('list', { name: 'Your progress' })).toContainText('1Choose2Budget3Craving');
  await page.getByRole('button', { name: 'Next: set a budget' }).click();
  await page.getByLabel('Budget in RM', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Next: pick a craving' }).click();
  await page.getByRole('button', { name: 'Find a suggestion' }).click();
  await expect(page.getByRole('status')).toContainText('No options fit');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByLabel('Budget in RM', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Next: pick a craving' }).click();
  await page.getByRole('button', { name: 'Find a suggestion' }).click();
  await expect(page.getByRole('button', { name: 'Save this choice' })).toBeVisible();
  await page.screenshot({ path: '../../outputs/decido-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Save this choice' }).click();
  await expect(page.getByRole('heading', { name: 'That’s decided.' })).toBeVisible();
  await page.getByRole('button', { name: 'View history' }).click();
  await expect(page.getByText('1 saved choice', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear history', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('1 saved choice', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear history', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear history' }).click();
  await expect(page.getByRole('heading', { name: 'No choices saved yet' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Try Decido as a guest' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'History' }).click();
  await expect(page.getByRole('heading', { name: 'No choices saved yet' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a network failure cannot create a pretend signed-in account', async ({ page }) => {
  await page.route('https://identitytoolkit.googleapis.com/**', route => route.abort('internetdisconnected'));
  await page.goto('/');
  await page.getByText('Sign in to sync your history', {exact:true}).click();
  await page.getByLabel('Email', {exact:true}).fill('student@example.com');
  await page.getByLabel('Password', {exact:true}).fill('some-password');
  await page.getByRole('button', {name:'Sign in',exact:true}).last().click();
  await expect(page.getByRole('alert')).toContainText('Could not connect');
  await expect(page.getByRole('button', {name:'Try Decido as a guest'})).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);
});

test('mobile layout, reduced motion, dietary settings and denied sign-in', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://identitytoolkit.googleapis.com/**', route => route.fulfill({
    status: 400, contentType: 'application/json', body: JSON.stringify({error:{code:400,message:'INVALID_LOGIN_CREDENTIALS'}}),
  }));
  await page.goto('/');
  await page.getByText('Sign in to sync your history', { exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('student@example.com');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try Decido as a guest' })).toBeVisible();
  await page.getByRole('button', { name: 'Try Decido as a guest' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Vegetarian', { exact: true }).check();
  await page.getByRole('navigation').getByRole('button', { name: 'Decide', exact: true }).click();
  await page.getByRole('button', { name: 'Next: set a budget' }).click();
  await expect(page.getByRole('heading', { name: 'How much would you like to spend?' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '../../outputs/decido-mobile.png', fullPage: true });
});
