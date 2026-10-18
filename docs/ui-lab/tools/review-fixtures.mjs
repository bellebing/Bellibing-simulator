// Explicit opt-in to the pre-existing illustrative record; SIMULATE is Pending.
export async function chooseIllustrativeResult(page) {
  const details=page.locator('.demo-note');
  const open=await details.evaluate(node=>node.open);
  if(!open)await details.locator('summary').click();
  await page.locator('#reviewScenario').selectOption('result');
  if(!open)await details.locator('summary').click();
}
