import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';

test.describe('Counter App', () => {
  test('ページが表示され、カウンターが 0 から始まる', async ({ page }) => {
    await page.goto(`${BASE_URL}/counter`);
    // 数値表示を待つ
    const counter = page.locator('text=0').first();
    await expect(counter).toBeVisible({ timeout: 5000 });
  });

  test('増やすボタンで値が +1 される', async ({ page }) => {
    // まずカウンターを 0 にリセット
    await fetch(`${BASE_URL}/api/counter`); // warm up

    await page.goto(`${BASE_URL}/counter`);
    await page.waitForTimeout(1000); // WebSocket 接続待ち

    // 現在の値を取得
    const res = await fetch('http://localhost:3001/api/counter');
    const json = await res.json();
    const before = json.value;

    // +1 ボタンをクリック
    await page.getByRole('button', { name: /増やす/ }).click();
    await page.waitForTimeout(1000);

    // 値が増加していることを確認
    const res2 = await fetch('http://localhost:3001/api/counter');
    const json2 = await res2.json();
    expect(json2.value).toBe(before + 1);
  });

  test('減らすボタンで値が -1 される', async ({ page }) => {
    // まず値を 5 にしておく
    for (let i = 0; i < 5; i++) {
      await fetch('http://localhost:3001/api/counter/inc', { method: 'POST' });
    }

    await page.goto(`${BASE_URL}/counter`);
    await page.waitForTimeout(1000);

    const res = await fetch('http://localhost:3001/api/counter');
    const json = await res.json();
    const before = json.value;

    // -1 ボタンをクリック
    await page.getByRole('button', { name: /減らす/ }).click();
    await page.waitForTimeout(1000);

    const res2 = await fetch('http://localhost:3001/api/counter');
    const json2 = await res2.json();
    expect(json2.value).toBe(before - 1);
  });

  test('他端末の変更がリアルタイムに反映される', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/counter`);
    await page.waitForTimeout(1000);

    // API からの現在値を取得
    const res = await fetch('http://localhost:3001/api/counter');
    const json = await res.json();
    const before = json.value;

    // 別のタブ（端末）からAPIで値を変更
    await fetch('http://localhost:3001/api/counter/inc', { method: 'POST' });
    await fetch('http://localhost:3001/api/counter/inc', { method: 'POST' });
    await fetch('http://localhost:3001/api/counter/inc', { method: 'POST' });

    // WebSocket 経由で反映されるまで待つ
    await page.waitForTimeout(2000);

    // ページ上に新しい値が表示されていることを確認
    const newValue = before + 3;
    const valueLocator = page.locator(`text=${newValue}`);
    await expect(valueLocator).toBeVisible({ timeout: 5000 });
  });
});
