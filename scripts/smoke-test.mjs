import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8080');
await page.waitForTimeout(1500);

const hasGame = await page.evaluate(() => !!window.game);
const activeScenes = await page.evaluate(() =>
    window.game ? window.game.scene.getScenes(true).map(s => s.scene.key) : []
);

console.log('window.game exposed:', hasGame);
console.log('active scenes:', activeScenes);

await page.screenshot({ path: 'scripts/smoke.png' });

await browser.close();
