/**
 * script.js – Minimalist Modern Digital Invitation
 * Features: Countdown Timer | RSVP → WhatsApp | Music Player | Fade-in Animations
 */

/* ─────────────────────────────────────────────
   CONFIG – Edit this section to customise
   ───────────────────────────────────────────── */
const CONFIG = {
  // Wedding date & time (ISO 8601, local timezone)
  weddingDate: '2025-09-27T09:00:00',

  // Couple info
  groomName:  'Raka Anandita',
  brideName:  'Sari Dewi Putri',

  // WhatsApp number for RSVP (international format, no + or spaces)
  whatsappNumber: '6281234567890',

  // Google Maps embed URL – replace src with your venue embed link
  // Get from: maps.google.com → Share → Embed a map → copy src URL
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798475978946!2d107.60898731477386!3d-6.914744395003375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e815b2!2sBandung%20City%20Hall!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid',

  // Background music path (place .mp3 inside assets/music/)
  musicSrc: 'assets/music/background.mp3',
};

/* ─────────────────────────────────────────────
   OPENING OVERLAY
   ───────────────────────────────────────────── */
(function initOpeningOverlay() {
  const overlay = document.getElementById('opening-overlay');
  const openBtn = document.getElementById('open-invitation-btn');
  const audio   = document.getElementById('bg-audio');
  if (!overlay || !openBtn) return;

  openBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    // Remove from tab order after transition
    setTimeout(() => overlay.setAttribute('aria-hidden', 'true'), 900);
  });
})();

/* ─────────────────────────────────────────────
   COUNTDOWN TIMER
   ───────────────────────────────────────────── */
(function initCountdown() {
  const target   = new Date(CONFIG.weddingDate).getTime();
  const elDays   = document.getElementById('cd-days');
  const elHours  = document.getElementById('cd-hours');
  const elMins   = document.getElementById('cd-minutes');
  const elSecs   = document.getElementById('cd-seconds');
  const doneMsg  = document.getElementById('cd-done');
  if (!elDays) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      elDays.textContent   = '00';
      elHours.textContent  = '00';
      elMins.textContent   = '00';
      elSecs.textContent   = '00';
      if (doneMsg) doneMsg.style.display = 'block';
      return;
    }

    const days    = Math.floor(diff / 86_400_000);
    const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000)  / 60_000);
    const seconds = Math.floor((diff % 60_000)     / 1_000);

    elDays.textContent    = pad(days);
    elHours.textContent   = pad(hours);
    elMins.textContent    = pad(minutes);
    elSecs.textContent    = pad(seconds);

    setTimeout(tick, 1_000);
  }

  tick();
})();

/* ─────────────────────────────────────────────
   MUSIC PLAYER
   ───────────────────────────────────────────── */
(function initMusicPlayer() {
  const btn   = document.getElementById('music-btn');
  const audio = document.getElementById('bg-audio');
  if (!btn || !audio) return;

  // Inject music source from config
  audio.src = CONFIG.musicSrc;
  audio.loop = true;
  audio.volume = 0.5;

  const iconPlay = btn.querySelector('.icon-play');
  const iconPause = btn.querySelector('.icon-pause');

  function setPlayingUI(playing) {
    if (playing) {
      btn.classList.add('playing');
      iconPlay.style.display  = 'none';
      iconPause.style.display = 'block';
      btn.setAttribute('aria-label', 'Matikan musik');
      btn.setAttribute('title', 'Matikan musik');
    } else {
      btn.classList.remove('playing');
      iconPlay.style.display  = 'block';
      iconPause.style.display = 'none';
      btn.setAttribute('aria-label', 'Nyalakan musik');
      btn.setAttribute('title', 'Nyalakan musik');
    }
  }

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // Autoplay policy blocked; user must interact – already did so here
      });
      setPlayingUI(true);
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });

  audio.addEventListener('ended', () => setPlayingUI(false));
  setPlayingUI(false); // initial state
})();

/* ─────────────────────────────────────────────
   RSVP FORM → WhatsApp
   ───────────────────────────────────────────── */
(function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name       = document.getElementById('rsvp-name').value.trim();
    const attendance = document.getElementById('rsvp-attendance').value;
    const guests     = document.getElementById('rsvp-guests').value;
    const message    = document.getElementById('rsvp-message').value.trim();

    if (!name || !attendance) {
      showToast('Mohon lengkapi nama dan konfirmasi kehadiran.');
      return;
    }

    const attendanceText = {
      hadir:         '✅ Hadir',
      'tidak-hadir': '❌ Tidak Hadir',
      'belum-pasti': '🤔 Belum Pasti',
    }[attendance] || attendance;

    let text = `Halo, saya ingin konfirmasi kehadiran:\n\n`;
    text += `👤 *Nama*: ${name}\n`;
    text += `📋 *Kehadiran*: ${attendanceText}\n`;
    if (attendance === 'hadir') {
      text += `👥 *Jumlah Tamu*: ${guests || 1} orang\n`;
    }
    if (message) {
      text += `💬 *Pesan*: ${message}\n`;
    }
    text += `\n_Dikirim dari undangan digital ${CONFIG.groomName} & ${CONFIG.brideName}_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`, '_blank');

    form.reset();
    showToast('Terima kasih! Mengalihkan ke WhatsApp…');
  });
})();

/* ─────────────────────────────────────────────
   FADE-IN on SCROLL (IntersectionObserver)
   ───────────────────────────────────────────── */
(function initFadeIn() {
  if (!('IntersectionObserver' in window)) {
    // Fallback – just show everything
    document.querySelectorAll('.fade-in, .fade-in-group').forEach((el) => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in, .fade-in-group').forEach((el) => {
    observer.observe(el);
  });
})();

/* ─────────────────────────────────────────────
   GOOGLE MAPS EMBED (lazy inject)
   ───────────────────────────────────────────── */
(function initMap() {
  const placeholder = document.getElementById('map-placeholder');
  if (!placeholder) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        const iframe = document.createElement('iframe');
        iframe.src             = CONFIG.mapsEmbedUrl;
        iframe.allowFullscreen = true;
        iframe.loading         = 'lazy';
        iframe.referrerPolicy  = 'no-referrer-when-downgrade';
        iframe.title           = 'Peta lokasi pernikahan';
        placeholder.replaceWith(iframe);
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(placeholder);
})();

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION HELPER
   ───────────────────────────────────────────── */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ─────────────────────────────────────────────
   COPY TO CLIPBOARD (rekening) – event delegation
   ───────────────────────────────────────────── */
(function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('Nomor rekening disalin!'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Nomor rekening disalin!');
    }
  });
})();
