document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');
  const downloadBtn = lightbox.querySelector('.lightbox-download');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;
  const FADE_MS = 180;

  // Open lightbox
  function setImage(index) {
    const imgSrc = galleryItems[index].href;
    const imgAlt = galleryItems[index].querySelector('img').alt;

    const applySrc = () => {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = imgAlt;
      if (downloadBtn) {
        downloadBtn.href = imgSrc;
        downloadBtn.setAttribute('download', '');
      }
    };

    // Ensure previous load handlers do not stack
    lightboxImg.onload = () => {
      requestAnimationFrame(() => {
        lightboxImg.style.opacity = '1';
      });
    };

    // If already visible, do a short fade-out before swapping
    if (lightbox.classList.contains('active')) {
      lightboxImg.style.opacity = '0';
      setTimeout(applySrc, Math.min(FADE_MS, 120));
    } else {
      // First open: start from 0 and fade in when loaded
      lightboxImg.style.opacity = '0';
      applySrc();
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    setImage(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
    lightboxImg.alt = '';
    document.body.style.overflow = '';
  }

  // Navigate to previous image
  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  // Navigate to next image
  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  }

  // Event Listeners
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  });

  // --------------------------------------
  // Add per-thumbnail download buttons (presskit assets)
  // --------------------------------------
  const presskitThumbs = document.querySelectorAll('.presskit-assets .asset-grid a');
  presskitThumbs.forEach(anchor => {
    if (anchor.querySelector('.asset-download')) return; // avoid duplicates
    const dl = document.createElement('a');
    dl.className = 'asset-download';
    dl.href = anchor.href;
    dl.setAttribute('download', '');
    dl.setAttribute('aria-label', 'Download image');
    dl.innerHTML = '<i class="fa-solid fa-download"></i>';
    dl.addEventListener('click', (ev) => {
      // prevent opening lightbox
      ev.stopPropagation();
    });
    anchor.appendChild(dl);
  });

  // ----------------------------
  // Carousel (on-page slider)
  // ----------------------------
  const carouselImg = document.querySelector('.carousel-image');
  const carouselPrev = document.querySelector('.carousel-nav.prev');
  const carouselNext = document.querySelector('.carousel-nav.next');

  if (carouselImg && carouselPrev && carouselNext && galleryItems.length) {
    let slideIndex = 0;

    function showSlide(idx) {
      slideIndex = (idx + galleryItems.length) % galleryItems.length;
      const imgSrc = galleryItems[slideIndex].href;
      const imgAlt = galleryItems[slideIndex].querySelector('img').alt;
      carouselImg.src = imgSrc;
      carouselImg.alt = imgAlt;
    }

    carouselPrev.addEventListener('click', () => showSlide(slideIndex - 1));
    carouselNext.addEventListener('click', () => showSlide(slideIndex + 1));

    // Clicking carousel opens lightbox
    carouselImg.addEventListener('click', () => {
      openLightbox(slideIndex);
    });

    // Initialize
    showSlide(0);
  }

  // ----------------------------
  // Transparent navbar fade-in on scroll
  // ----------------------------
  const headerEl = document.querySelector('.site-header');
  const SCROLL_THRESHOLD = 50;
  function handleHeaderScroll() {
    if (!headerEl) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      headerEl.classList.add('scrolled');
    } else {
      headerEl.classList.remove('scrolled');
    }
  }
  if (headerEl) {
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll();
  }

  // Smooth scrolling for nav links with header offset
  const headerOffset = 80;
  document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: 'smooth'
      });
    });
  });
});