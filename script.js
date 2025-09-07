// script.js
// Controls: Lover popup (open/close/minimize/restore), thumbnails, typing effect,
// mobile nav toggle, hero reveal, and some small UX improvements.

// Ensure DOM loaded
document.addEventListener('DOMContentLoaded', function() {

  // Elements
  const loverBtn = document.getElementById('loverBtn');
  const overlay = document.getElementById('loverOverlay');
  const lover = document.getElementById('loverGui');
  const closeBtn = document.getElementById('closeBtn');
  const minimizeBtn = document.getElementById('minimizeBtn');
  const loverMain = document.getElementById('loverMain');
  const loverThumbs = document.getElementById('loverThumbs');
  const mini = document.getElementById('loverMini');
  const openLoverCta = document.getElementById('openLoverCta');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const profileImg = document.getElementById('profileImg');

  // Simple typing effect for hero title (Ovi)
  (function typeWriter(){
    const el = document.getElementById('heroTitle');
    const text = "Hai Ovi 🩷";
    el.textContent = ""; // clear
    let i = 0;
    const speed = 90;
    function step(){
      if(i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      }
    }
    step();
  })();

  // open lover popup
  function openLover() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    // focus for accessibility
    setTimeout(()=> {
      const firstBtn = lover.querySelector('.thumb, button');
      if(firstBtn) firstBtn.focus();
    }, 300);
  }

  // close lover popup (with animation)
  function closeLoverFn() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    // hide minimized just in case
    mini.style.display = 'none';
  }

  // minimize: hide overlay and show mini preview
  function minimizeLover() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    mini.style.display = 'block';
  }

  // restore from mini
  function restoreFromMini() {
    mini.style.display = 'none';
    openLover();
  }

  // Thumbs click to change main image
  loverThumbs.addEventListener('click', function(e){
    const btn = e.target.closest('.thumb');
    if(!btn) return;
    const src = btn.dataset.src;
    if(src){
      // fade effect
      loverMain.style.opacity = 0;
      setTimeout(()=> {
        loverMain.src = src;
        loverMain.style.opacity = 1;
      }, 180);
      // active class
      document.querySelectorAll('#loverThumbs .thumb').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      // also update hero profile image to keep consistent if we want
      profileImg.src = src;
    }
  });

  // make lover popup draggable by header
  (function makeDraggable() {
    const handle = document.getElementById('loverHead');
    const dialog = document.getElementById('loverGui') || document.querySelector('.lover');
    if(!handle || !dialog) return;
    let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

    function onDown(e){
      dragging = true;
      dialog.style.transition = 'none';
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = dialog.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('touchend', onUp);
    }

    function onMove(e){
      if(!dragging) return;
      e.preventDefault();
      const mx = e.touches ? e.touches[0].clientX : e.clientX;
      const my = e.touches ? e.touches[0].clientY : e.clientY;
      let dx = mx - startX;
      let dy = my - startY;
      const newLeft = startLeft + dx;
      const newTop = startTop + dy;
      // clamp within viewport
      const vw = window.innerWidth, vh = window.innerHeight;
      const rect = dialog.getBoundingClientRect();
      const clampedLeft = Math.max(8, Math.min(newLeft, vw - rect.width - 8));
      const clampedTop = Math.max(8, Math.min(newTop, vh - rect.height - 8));
      dialog.style.position = 'fixed';
      dialog.style.left = (clampedLeft + rect.width/2) + 'px'; // center transform compensation
      dialog.style.top = (clampedTop + rect.height/2) + 'px';
      dialog.style.transform = 'translate(-50%,-50%)';
    }

    function onUp(){
      dragging = false;
      dialog.style.transition = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, {passive:false});
  })();

  // event wiring
  loverBtn.addEventListener('click', openLover);
  openLoverCta && openLoverCta.addEventListener('click', openLover);
  closeBtn.addEventListener('click', closeLoverFn);
  minimizeBtn.addEventListener('click', minimizeLover);
  mini.addEventListener('click', restoreFromMini);

  // click outside to close
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closeLoverFn();
  });

  // ESC to close
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeLoverFn();
  });

  // mobile toggle
  mobileToggle && mobileToggle.addEventListener('click', function(){
    if(navLinks.style.display === 'flex') navLinks.style.display = '';
    else navLinks.style.display = 'flex';
  });

  // small intersection reveal for sections
  const revealEls = document.querySelectorAll('.section, .grid, .hero-inner');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting) en.target.classList.add('reveal');
    });
  }, {threshold: .12});
  revealEls.forEach(el => io.observe(el));

  // ensure loverMain uses full cover without "critical cropping"
  // We'll switch between object-fit:cover and contain based on aspect ratio
  function ensureFullImageFits(imgEl) {
    if(!imgEl) return;
    imgEl.onload = function(){
      try{
        const iw = imgEl.naturalWidth, ih = imgEl.naturalHeight;
        // if image is tall, use contain to avoid ugly crop of face; if wide, cover is fine
        if(ih > iw) {
          imgEl.style.objectFit = 'contain';
          imgEl.style.background = 'linear-gradient(90deg, rgba(255,111,165,.06), rgba(155,231,245,.04))';
        } else {
          imgEl.style.objectFit = 'cover';
        }
      }catch(e){}
    };
  }
  ensureFullImageFits(loverMain);
  ensureFullImageFits(profileImg);

  // set year in footer
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

});
