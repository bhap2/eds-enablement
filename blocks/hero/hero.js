/*
 * Hero Block
 *
 * Default: an image-background hero (decorated by aem.js auto-blocking; the
 * <picture> is positioned behind the heading via hero.css).
 *
 * Variant `video`: a full-bleed autoplay/muted/looping background video behind
 * the hero content. Authors supply a link to a video file (mp4/webm) — usually
 * a standalone link in the block; an optional image acts as the poster.
 */
export default function decorate(block) {
  if (!block.classList.contains('video')) return;

  // Find an authored video URL (a link to a video file).
  const link = [...block.querySelectorAll('a')]
    .find((a) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(a.getAttribute('href') || ''));
  if (!link) return;

  const src = link.getAttribute('href');
  const poster = block.querySelector('img');

  const video = document.createElement('video');
  video.className = 'hero-video';
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.muted = true; // ensure autoplay is allowed
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  if (poster?.src) video.setAttribute('poster', poster.src);

  const source = document.createElement('source');
  source.src = src;
  const ext = src.split('.').pop().split('?')[0].toLowerCase();
  source.type = ext === 'webm' ? 'video/webm' : 'video/mp4';
  video.append(source);

  // Remove the authored link wrapper (and its container) so only text remains.
  const linkContainer = link.closest('p') || link;
  linkContainer.remove();
  // Drop a poster image cell if it was authored purely as the poster.
  if (poster) {
    const picWrap = poster.closest('picture')?.parentElement || poster.parentElement;
    if (picWrap && picWrap !== block) picWrap.remove();
  }

  block.prepend(video);
}
