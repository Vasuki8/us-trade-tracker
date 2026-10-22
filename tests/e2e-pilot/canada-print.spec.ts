import {test,expect} from '@playwright/test';

test('Canada print tables retain every row and column at A4 and Letter content widths',async({page})=>{
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('/countries/1220/');
  await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();
  await expect(page.locator('.canada-preview .table-scroll').first().locator('tbody tr')).toHaveCount(24);
  await page.emulateMedia({media:'print'});
  for(const width of [704,725]){
    await page.setViewportSize({width,height:1000});
    const tables=await page.locator('.canada-preview .table-scroll').evaluateAll(regions=>regions.map(region=>{
      const box=region.getBoundingClientRect(),rows=region.querySelectorAll('tr'),last=rows[rows.length-1].getBoundingClientRect();
      const cells=[...region.querySelectorAll<HTMLElement>('th,td')];
      return {bottom:box.bottom,right:box.right,lastRowBottom:last.bottom,lastCellRight:Math.max(...cells.map(cell=>cell.getBoundingClientRect().right)),overflowingCells:cells.filter(cell=>cell.scrollWidth>cell.clientWidth+1).map(cell=>cell.textContent)};
    }));
    const fragmentedQualifications=await page.locator('.canada-preview .data-card tbody tr td:last-child').evaluateAll(cells=>cells.flatMap(cell=>{
      const text=cell.querySelector('small')??cell,style=getComputedStyle(text),canvas=document.createElement('canvas'),context=canvas.getContext('2d')!;
      context.font=style.font;
      const cellStyle=getComputedStyle(cell),available=cell.clientWidth-parseFloat(cellStyle.paddingLeft)-parseFloat(cellStyle.paddingRight);
      return (text.textContent?.match(/[A-Za-z]{4,}/g)??[]).filter(word=>context.measureText(word).width>available+1);
    }));
    expect(fragmentedQualifications,`${width}px: qualification words must fit without fragmentation`).toEqual([]);
    expect(tables.length).toBeGreaterThanOrEqual(2);
    for(const table of tables){
      expect(table.lastRowBottom,`${width}px: every table row must fit its printed container`).toBeLessThanOrEqual(table.bottom+1);
      expect(table.lastCellRight,`${width}px: all columns must fit the print width`).toBeLessThanOrEqual(table.right+1);
      expect(table.overflowingCells,`${width}px: cell text must remain readable`).toEqual([]);
    }
  }
});
