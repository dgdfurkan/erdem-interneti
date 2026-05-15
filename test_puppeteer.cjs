const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Go to the local site
  await page.goto('http://localhost:5174/erdem-interneti/', { waitUntil: 'networkidle2' });
  
  // Wait for canvas
  await page.waitForSelector('canvas');
  
  // Wait a moment for rendering
  await new Promise(r => setTimeout(r, 1000));
  
  // Click in the middle of the screen
  await page.mouse.click(400, 400);
  
  // Wait a second for animation
  await new Promise(r => setTimeout(r, 1000));
  
  // Get all images
  const info = await page.evaluate(() => {
    const title = document.querySelector('.project-title')?.innerText;
    const imgs = document.querySelectorAll('.project-gallery img');
    return {
      title,
      images: Array.from(imgs).map(img => ({
        src: img.src,
        width: img.clientWidth,
        height: img.clientHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  
  await browser.close();
})();
