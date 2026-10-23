import {test,expect,type Page} from '@playwright/test';

const ready=(page:Page)=>expect(page.getByRole('button',{name:'Copy overview link',exact:true})).toBeEnabled();
for(const code of ['090121','090122'])for(const direction of ['imports','exports'])for(const period of ['monthly','annual'])for(const months of [12,60]){
  test(`monitor research retains ${code} ${direction} ${period} ${months}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    const overview=`/?product=${code==='090121'?'090122':'090121'}&direction=${direction}&comparison=${period}&months=${months}`;
    const profile=`/products/${code}/?direction=${direction}&months=${months}${period==='monthly'?'&comparison=monthly':''}`;
    const changes=`${code==='090121'?'/changes/':`/changes/${code}/`}?direction=${direction}&metric=dollars${period==='monthly'?'&period=monthly':''}#changes-heading`;
    await page.goto(overview);await ready(page);
    const row=page.getByRole('article',{name:new RegExp(`HS ${code}$`)}),link=row.getByRole('heading').getByRole('link');
    await expect(link).toHaveAttribute('href',profile);
    await row.getByText('Source & research links',{exact:true}).click();
    await expect(row.getByRole('link',{name:'Country changes',exact:true})).toHaveAttribute('href',changes);
    await expect(row.getByRole('link',{name:'Release briefing',exact:true})).toHaveAttribute('href',code==='090121'?'/briefing/':`/briefing/${code}/`);
    await page.emulateMedia({media:'print'});await expect(link).toHaveAttribute('href',profile);await expect(row.getByRole('link',{name:'Country changes',exact:true})).toHaveAttribute('href',changes);await page.emulateMedia({media:'screen'});
    await link.focus();await page.keyboard.press('Enter');
    const checkProfile=async()=>{
      await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();
      await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
      await expect(page.getByLabel('History window')).toHaveValue(String(months));
      await expect(page.locator('.country-list input:checked')).toHaveCount(0);
    };
    await checkProfile();await page.reload();await checkProfile();
    await page.getByRole('checkbox',{name:'CANADA',exact:true}).check();
    await expect(page.getByLabel('Country comparison period')).toHaveValue(period);
    await page.goBack();await ready(page);await expect(link).toHaveAttribute('href',profile);
    const details=row.locator('details');if(!(await details.getAttribute('open')!==null))await row.getByText('Source & research links',{exact:true}).click();
    await row.getByRole('link',{name:'Country changes',exact:true}).focus();await page.keyboard.press('Enter');
    const checkChanges=async()=>{
      await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeEnabled();
      await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
      await expect(page.getByRole('radio',{name:period==='monthly'?'Latest month versus the same month last year':'Rolling twelve months',exact:true})).toBeChecked();
      await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');
    };
    await checkChanges();await page.reload();await checkChanges();await page.goBack();await ready(page);
    await expect(link).toHaveAttribute('href',profile);expect(errors).toEqual([]);
  });
}

test('static monitor links describe the displayed default, with explained destination defaults',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false}),page=await context.newPage();
  try{
    await page.goto('/?product=090122&direction=exports&comparison=annual&months=12');
    await expect(page.getByText(/Initial view: Roasted coffee imports, latest month, 5Y history/)).toBeVisible();
    const row=page.getByRole('article',{name:/HS 090122$/});
    await expect(row.getByRole('heading').getByRole('link')).toHaveAttribute('href','/products/090122/?direction=imports&months=60&comparison=monthly');
    await row.getByText('Source & research links',{exact:true}).click();
    const link=row.getByRole('link',{name:'Country changes',exact:true});
    await expect(link).toHaveAttribute('href','/changes/090122/?direction=imports&metric=dollars&period=monthly#changes-heading');
    await link.click();await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
    await expect(page.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();
    await expect(page.getByText(/initial view shows U.S. imports ranked by dollar change over rolling twelve months/)).toBeVisible();
  }finally{await context.close();}
});
