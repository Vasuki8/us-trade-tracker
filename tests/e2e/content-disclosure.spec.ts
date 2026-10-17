import {test,expect} from '@playwright/test';
test('methods details are keyboard accessible and preserve full definitions',async({page})=>{
 await page.goto('/methods/');
 const details=page.locator('details.content-details').filter({has:page.locator('summary',{hasText:'Comparisons and shares'})});
 await expect(details).toHaveCount(1);await expect(details).not.toHaveAttribute('open','');
 const summary=details.locator('summary');await summary.focus();await page.keyboard.press('Enter');await expect(details).toHaveAttribute('open','');
 await expect(details).toContainText('percentage');await page.keyboard.press('Enter');await expect(details).not.toHaveAttribute('open','');
});
test('methods remain accessible without JavaScript and print closed explanations',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}});
 try{const page=await context.newPage();await page.goto('/methods/');const details=page.locator('details.content-details').filter({has:page.locator('summary',{hasText:'Estimated duties'})}).first();
 await expect(details).toHaveCount(1);await details.locator('summary').click();await expect(details.locator('p').first()).toBeVisible();await details.locator('summary').click();await expect(details.locator('p').first()).toBeHidden();
 await page.emulateMedia({media:'print'});await expect(details.locator('p').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});
test('briefing keeps essential duty warnings visible while full explanation prints',async({page})=>{
 await page.goto('/briefing/');const details=page.locator('details.content-details').filter({has:page.locator('summary',{hasText:'Duty calculation details'})});
 await expect(details).toHaveCount(1);await expect(details.locator('p').first()).toBeHidden();
 await expect(page.locator('.briefing')).toContainText('Estimated duties');
 await expect(page.locator('.briefing .duty-warning')).toBeVisible();await page.emulateMedia({media:'print'});await expect(details.locator('p').first()).toBeVisible();
});
