document.documentElement.classList.add('js-enabled');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

function closeMenu(returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;

function setupReveals() {
  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('motion-ready');
    revealObserver?.disconnect();
    return;
  }
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  document.documentElement.classList.add('motion-ready');
}

setupReveals();
motionPreference.addEventListener('change', setupReveals);

const streamButton = document.querySelector('#load-stream');
const streamStage = document.querySelector('#stream-stage');
const streamPoster = document.querySelector('#stream-poster');
const playerMount = document.querySelector('#twitch-player');
const streamMessage = document.querySelector('#stream-message');
let playerLoaded = false;

function updatePlayerSize() {
  const canEmbed = streamStage.clientWidth >= 400 && Boolean(location.hostname);
  streamStage.classList.toggle('can-embed', canEmbed);
  if (!canEmbed && playerLoaded) {
    playerMount.replaceChildren();
    playerMount.hidden = true;
    streamPoster.hidden = false;
    playerLoaded = false;
    streamMessage.textContent = 'Continue watching on Twitch.';
  }
}

updatePlayerSize();
if ('ResizeObserver' in window) {
  new ResizeObserver(updatePlayerSize).observe(streamStage);
} else {
  window.addEventListener('resize', updatePlayerSize);
}

streamButton.addEventListener('click', () => {
  if (playerLoaded) return;
  if (!location.hostname || streamStage.clientWidth < 400) {
    window.open('https://www.twitch.tv/naye', '_blank', 'noopener,noreferrer');
    return;
  }

  const playerURL = new URL('https://player.twitch.tv/');
  playerURL.search = new URLSearchParams({
    channel: 'naye',
    parent: location.hostname,
    autoplay: 'true',
    muted: 'false'
  }).toString();

  const iframe = document.createElement('iframe');
  iframe.src = playerURL.href;
  iframe.title = 'Naye’s Twitch stream';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  playerMount.append(iframe);
  playerMount.hidden = false;
  streamPoster.hidden = true;
  playerLoaded = true;
  streamMessage.textContent = 'Want to join the chat? Say hello over on Twitch.';
  iframe.focus({ preventScroll: true });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const contactDialog = document.querySelector('#contact-dialog');
document.querySelector('[data-open-contact]').addEventListener('click', (event) => {
  if (typeof contactDialog.showModal !== 'function') return;
  event.preventDefault();
  contactDialog.showModal();
});

contactDialog.addEventListener('click', (event) => {
  if (event.target !== contactDialog) return;
  const bounds = contactDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) contactDialog.close();
});

document.querySelectorAll('[data-copy-source]').forEach((button) => {
  let resetTimer;
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copySource);
    const status = document.getElementById(button.getAttribute('aria-describedby'));
    const text = source.innerText.trim();
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Text selected. You can copy it manually.';
    } finally {
      resetTimer = setTimeout(() => { status.textContent = ''; }, 5000);
    }
  });
});
