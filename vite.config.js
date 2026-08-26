import { defineConfig } from 'vite';

const audioPatch = String.raw`
/* Week 6 reliable game audio patch */
try {
  beep = function (f = 600, d = .07, t = 'square', v = .10) {
    if (!sound) return;
    const c = audio();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = t;
    o.frequency.setValueAtTime(f, c.currentTime);
    g.gain.setValueAtTime(Math.max(v, .075), c.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + d + .02);
  };
  const unlockWeek6Audio = () => {
    const c = audio();
    if (c && c.state === 'suspended') c.resume();
  };
  document.addEventListener('pointerdown', unlockWeek6Audio, true);
  document.addEventListener('keydown', unlockWeek6Audio, true);
  document.addEventListener('touchstart', unlockWeek6Audio, { capture: true, passive: true });
  document.addEventListener('click', (e) => {
    if (!sound) return;
    if (e.target.closest('.game button, .mcard, .lane, .hole, .stack-slot, .pill')) {
      unlockWeek6Audio();
      beep(430, .03, 'square', .08);
    }
  }, true);
} catch (e) {}
`;

export default defineConfig({
  assetsInclude: ['**/*.bin'],
  plugins: [
    {
      name: 'week6-student-layout-and-audio-fix',
      transformIndexHtml(source) {
        let html = source;

        html = html.replace(
          "html=html.replace('<section class=\"section\" id=\"boss\">',tutorialHTML+'<section class=\"section\" id=\"boss\">');",
          "html=html.replace('</main>',tutorialHTML+'</main>');"
        );

        html = html.replace(
          "'<a href=\"#forward\">Forwarding</a><a href=\"#tutorial\">Tutorial</a><a href=\"#boss\">Boss</a>'",
          "'<a href=\"#forward\">Forwarding</a><a href=\"#boss\">Boss</a><a href=\"#tutorial\">Tutorial</a>'"
        );

        const marker = 'document.open();document.write(html);document.close();';
        const patchJson = JSON.stringify(audioPatch);
        const replacement = `const __closeScript='<'+'/script>';\n    html=html.replace(__closeScript,${patchJson}+__closeScript);\n    ${marker}`;
        html = html.replace(marker, replacement);

        return html;
      },
    },
  ],
});
