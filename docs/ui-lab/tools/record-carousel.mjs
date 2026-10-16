import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

// Real Chromium frames and physical pointer/keyboard input, not a rendered mock.
export async function recordCarouselDemo(page, { output, revision, workingTreeDirty }) {
  const scratch = mkdtempSync(resolve(tmpdir(), 'bellibing-carousel-'));
  const session = await page.context().newCDPSession(page);
  const frames = [];
  const started = performance.now();
  const onFrame = event => {
    const file = `${String(frames.length).padStart(5, '0')}.jpg`;
    writeFileSync(resolve(scratch, file), Buffer.from(event.data, 'base64'));
    frames.push({ file, time: (performance.now() - started) / 1000 });
    session.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});
  };
  try {
    session.on('Page.screencastFrame', onFrame);
    await session.send('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: 1440, maxHeight: 810, everyNthFrame: 1 });
    await page.waitForTimeout(700);
    await page.locator('.portrait.selected').hover(); await page.waitForTimeout(800);
    const area = await page.locator('#galleryArt').boundingBox();
    const x = area.x + area.width / 2, y = area.y + 120;
    await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 14; i++) { await page.mouse.move(x - i * 16, y); await page.waitForTimeout(16); }
    await page.mouse.up(); await page.waitForTimeout(900);
    assert.equal(await page.locator('.hero-copy h2').innerText(), 'Augusta');
    await page.locator('[data-art="iuno"]').click(); await page.waitForTimeout(750);
    assert.equal(await page.locator('.hero-copy h2').innerText(), 'Augusta');
    await page.locator('[data-art="iuno"]').click(); await page.waitForTimeout(900);
    assert.equal(await page.locator('.hero-copy h2').innerText(), 'Iuno');
    await page.locator('#openGallery').click(); await page.locator('[data-filter="account"]').click(); await page.waitForTimeout(650);
    await page.locator('#galleryArt').focus(); await page.keyboard.press('End'); await page.waitForTimeout(750);
    await page.keyboard.press('Home'); await page.waitForTimeout(800);
    await page.locator('[data-filter="all"]').click(); await page.waitForTimeout(500);
    await page.locator('#closeGallery').click(); await page.waitForTimeout(850);
    const ended = (performance.now() - started) / 1000;
    await session.send('Page.stopScreencast');
    session.off('Page.screencastFrame', onFrame);
    assert.ok(frames.length > 30, 'Motion demonstration captured too few real frames');
    const concat = frames.map((frame, i) => `file '${frame.file}'\nduration ${Math.max(.02, (frames[i + 1]?.time ?? ended) - frame.time).toFixed(4)}\n`).join('') + `file '${frames.at(-1).file}'\n`;
    writeFileSync(resolve(scratch, 'frames.txt'), concat);
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'frames.txt', '-vf', 'fps=24', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', resolve(output, 'carousel-interaction.mp4')], { cwd: scratch });
    writeFileSync(resolve(output, 'carousel-interaction.json'), JSON.stringify({ revision, workingTreeDirty, source: 'Chromium CDP screencast', frames: frames.length, durationSeconds: ended, viewport: page.viewportSize(), interactions: ['compact hover expansion', 'physical horizontal drag, momentum and snap', 'neighbor click centers without selection', 'center click selects Iuno', 'Account/All filter', 'Home/End center at catalog bounds', 'collapse'] }, null, 2) + '\n');
  } finally {
    await session.detach();
    rmSync(scratch, { recursive: true, force: true });
  }
}
