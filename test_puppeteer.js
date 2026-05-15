const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Go to the local site
  await page.goto('http://localhost:5174/erdem-interneti/', { waitUntil: 'networkidle2' });
  
  // Wait for canvas
  await page.waitForSelector('canvas');
  
  // Click in the middle of the screen to open a project
  await page.mouse.click(window.innerWidth / 2 || 600, window.innerHeight / 2 || 400);
  
  // Wait a second for animation
  await new Promise(r => setTimeout(r, 1000));
  
  // Get all images in project-gallery
  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.project-gallery img');
    return Array.from(imgs).map(img => ({
      src: img.src,
      width: img.clientWidth,
      height: img.clientHeight,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    }));
  });
  
  console.log("Found images:", images.length);
  console.log(images);
  
  await browser.close();
})();
