import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174/erdem-interneti/', { waitUntil: 'networkidle2' });
  
  // Wait for canvas
  await page.waitForSelector('canvas');
  await new Promise(r => setTimeout(r, 1000));
  
  // Click middle of canvas
  await page.mouse.click(600, 400);
  await new Promise(r => setTimeout(r, 1000));
  
  // Get outerHTML of project-page
  const html = await page.evaluate(() => {
    const el = document.querySelector('.project-page');
    return el ? el.outerHTML : 'NOT_FOUND';
  });
  
  console.log(html);
  await browser.close();
})();
