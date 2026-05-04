const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('[BOT] Initializing Neural Link (Playwright)...');
  
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: 'videos/',
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark'
  });

  const page = await context.newPage();
  
  console.log('[BOT] Accessing local mainframe...');
  await page.goto('http://127.0.0.1:4201');

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/01_boot_sequence.png' });

  // Click through configuration if needed
  try {
     console.log('[BOT] Attempting to bypass initial firewall (Config Wizard)...');
     await page.click('button:has-text("[ INITIATE_NEURAL_UPLINK ]")', { timeout: 3000 });
     await page.waitForTimeout(1000);
     await page.screenshot({ path: 'screenshots/02_uplink_established.png' });
  } catch (e) {
     console.log('[BOT] No config wizard detected. Proceeding.');
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/03_terminal_view.png' });

  // Type Easter Egg
  console.log('[BOT] Injecting payload: "knock knock"');
  await page.fill('.input-wrapper input', 'knock knock');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/04_easter_egg_knock.png' });

  // Navigate Hubs
  const tabs = ['GRID', 'MISSIONS', 'SOCIAL', 'HARDWARE', 'SYSTEM'];
  
  for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      console.log(`[BOT] Accessing Subnet: ${tab}`);
      try {
          await page.click(`.dock-btn:has-text("${tab === 'MISSIONS' ? 'OPERATIONS' : tab}")`);
          await page.waitForTimeout(2000);
          
          // Click info button
          await page.click('.info-btn');
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `screenshots/05_${tab}_info.png` });
          
          // Acknowledge info
          await page.click('button:has-text("[ ACKNOWLEDGE ]")');
          await page.waitForTimeout(500);

          await page.screenshot({ path: `screenshots/06_${tab}_view.png` });
      } catch(e) {
          console.log(`[BOT] Failed to navigate to ${tab}.`);
      }
  }

  // Go back to terminal
  console.log('[BOT] Returning to Terminal...');
  await page.click(`.dock-btn:has-text("TERMINAL")`);
  await page.waitForTimeout(1000);
  
  // Trigger system wipe just to see the chaos
  console.log('[BOT] Initiating System Wipe...');
  await page.fill('.input-wrapper input', 'wipe');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/07_system_wipe.png' });
  await page.waitForTimeout(4000); // Wait for shatter to finish

  console.log('[BOT] Logging off.');
  await context.close();
  await browser.close();
  console.log('[BOT] Session terminated. Media saved to screenshots/ and videos/');
})();
