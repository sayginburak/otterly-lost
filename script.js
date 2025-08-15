document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');
  const downloadBtn = lightbox.querySelector('.lightbox-download');
  const lightboxContent = lightbox.querySelector('.lightbox-content');
  const galleryItems = document.querySelectorAll('.gallery-item, .gallery-item-company');
  let currentIndex = 0;
  const FADE_MS = 180;

  // Open lightbox
  function setImage(index) {
    const anchorEl = galleryItems[index];
    const pngHref = anchorEl.href; // keep PNG for download
    const imgAlt = (anchorEl.querySelector('img') && anchorEl.querySelector('img').alt) || '';

    // Prepare the node to display in lightbox (clone <picture> if present, otherwise clone <img>)
    const pictureEl = anchorEl.querySelector('picture');
    let nodeToInsert;
    let imgInside;

    if (pictureEl) {
      nodeToInsert = pictureEl.cloneNode(true);
      imgInside = nodeToInsert.querySelector('img');
      // Ensure the lightbox uses large responsive selection
      nodeToInsert.style.display = 'block';
      nodeToInsert.style.width = '100%';
      nodeToInsert.querySelectorAll('source').forEach(src => {
        if (src.hasAttribute('srcset')) {
          src.setAttribute('sizes', '90vw');
        }
      });
    } else {
      imgInside = anchorEl.querySelector('img').cloneNode(true);
      nodeToInsert = imgInside;
    }

    if (imgInside) {
      imgInside.classList.add('lightbox-image');
      imgInside.alt = imgAlt;
      imgInside.style.width = '100%';
      imgInside.style.height = 'auto';
      imgInside.style.opacity = '0';
      imgInside.onload = () => {
        requestAnimationFrame(() => {
          imgInside.style.opacity = '1';
        });
      };
    }

    // Update download to PNG
    if (downloadBtn) {
      downloadBtn.href = pngHref;
      downloadBtn.setAttribute('download', '');
    }

    // Swap content with a short fade if already visible
    const previousImg = lightboxContent.querySelector('.lightbox-image');
    const doSwap = () => {
      lightboxContent.innerHTML = '';
      lightboxContent.appendChild(nodeToInsert);
      // Fallback to ensure visibility even if onload doesn't fire (cached)
      requestAnimationFrame(() => {
        if (imgInside) imgInside.style.opacity = '1';
      });
    };

    if (lightbox.classList.contains('active') && previousImg) {
      previousImg.style.opacity = '0';
      setTimeout(doSwap, Math.min(FADE_MS, 120));
    } else {
      doSwap();
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
    // Clear any inserted content
    if (lightboxContent) {
      lightboxContent.innerHTML = '';
    }
    if (lightboxImg) {
      lightboxImg.src = '';
      lightboxImg.alt = '';
    }
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
      if (e.target.closest('.asset-download')) {
        return;
      }
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

    switch (e.key) {
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

    // Use a non-anchor element to avoid <a> inside <a>
    const dl = document.createElement('span');
    dl.className = 'asset-download';
    dl.setAttribute('role', 'button');
    dl.setAttribute('tabindex', '0');
    dl.setAttribute('aria-label', 'Download image');
    dl.innerHTML = '<i class="fa-solid fa-download"></i>';

    dl.addEventListener('click', (ev) => {
      // Prevent both lightbox open and default navigation
      ev.stopPropagation();
      ev.preventDefault();

      const url = anchor.href;
      const filename = anchor.getAttribute('download') || url.split('/').pop() || 'asset';

      // Programmatically trigger a download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Keyboard accessibility
    dl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') dl.click();
    });

    anchor.appendChild(dl);
  });

  // ----------------------------
  // Carousel (on-page slider)
  // ----------------------------
  const carouselFrame = document.querySelector('.carousel-frame');
  const carouselPrev = document.querySelector('.carousel-nav.prev');
  const carouselNext = document.querySelector('.carousel-nav.next');

  if (carouselFrame && carouselPrev && carouselNext && galleryItems.length) {
    let slideIndex = 0;
    const CAROUSEL_FADE_MS = 180;
    let isTransitioning = false;
    let pendingIndex = null;
    let transitionToken = 0;

    function startTransitionTo(idx) {
      isTransitioning = true;
      transitionToken += 1;
      const localToken = transitionToken;
      slideIndex = (idx + galleryItems.length) % galleryItems.length;
      const anchorEl = galleryItems[slideIndex];
      const pictureEl = anchorEl.querySelector('picture');
      let nodeToInsert;
      if (pictureEl) {
        nodeToInsert = pictureEl.cloneNode(true);
        // Prefer large variant in carousel
        nodeToInsert.querySelectorAll('source').forEach(src => src.setAttribute('sizes', '100vw'));
      } else {
        nodeToInsert = anchorEl.querySelector('img').cloneNode(true);
      }
      // Ensure accessibility
      const imgEl = nodeToInsert.querySelector ? (nodeToInsert.querySelector('img') || nodeToInsert) : nodeToInsert;
      if (imgEl && anchorEl.querySelector('img')) {
        imgEl.alt = anchorEl.querySelector('img').alt || '';
      }
      const previousChild = carouselFrame.firstElementChild;

      // Prepare new node styles for fade; position in normal flow
      nodeToInsert.style.opacity = '0';
      nodeToInsert.style.transition = `opacity ${CAROUSEL_FADE_MS}ms ease`;

      // No spacer needed due to fixed aspect ratio on the frame

      carouselFrame.appendChild(nodeToInsert);

      let transitioned = false;
      const startTransition = () => {
        if (transitioned) return;
        transitioned = true;
        // If a newer transition started, abort this one and clean up
        if (localToken !== transitionToken) {
          if (nodeToInsert.parentNode === carouselFrame) {
            carouselFrame.removeChild(nodeToInsert);
          }
          return;
        }
        requestAnimationFrame(() => {
          nodeToInsert.style.opacity = '1';
          if (previousChild) {
            // Absolutely position the outgoing child so it sits on top and can fade away
            previousChild.style.position = 'absolute';
            previousChild.style.inset = '0';
            previousChild.style.width = '100%';
            previousChild.style.height = '100%';
            previousChild.style.transition = `opacity ${CAROUSEL_FADE_MS}ms ease`;
            previousChild.style.opacity = '0';
            setTimeout(() => {
              if (previousChild.parentNode === carouselFrame) {
                carouselFrame.removeChild(previousChild);
              }
              // End of transition
              if (localToken === transitionToken) {
                isTransitioning = false;
                if (pendingIndex !== null) {
                  const toGo = pendingIndex;
                  pendingIndex = null;
                  startTransitionTo(toGo);
                }
              }
            }, CAROUSEL_FADE_MS);
          } else {
            // End of transition
            if (localToken === transitionToken) {
              isTransitioning = false;
              if (pendingIndex !== null) {
                const toGo = pendingIndex;
                pendingIndex = null;
                startTransitionTo(toGo);
              }
            }
          }
        });
      };

      // Prefer decode() for reliable readiness
      const targetImg = nodeToInsert.querySelector ? (nodeToInsert.querySelector('img') || null) : null;
      if (targetImg && typeof targetImg.decode === 'function') {
        targetImg.decode().then(startTransition).catch(startTransition);
        // Minimal safety timeout
        setTimeout(startTransition, 600);
      } else if (targetImg) {
        if (targetImg.complete && targetImg.naturalWidth > 0) {
          startTransition();
        } else {
          targetImg.onload = () => startTransition();
          setTimeout(startTransition, 600);
        }
      } else {
        startTransition();
      }
    }

    function requestSlide(targetIdx) {
      if (isTransitioning) {
        pendingIndex = targetIdx;
        return;
      }
      startTransitionTo(targetIdx);
    }

    carouselPrev.addEventListener('click', () => requestSlide(slideIndex - 1));
    carouselNext.addEventListener('click', () => requestSlide(slideIndex + 1));

    // Clicking carousel opens lightbox
    carouselFrame.addEventListener('click', () => openLightbox(slideIndex));
    carouselFrame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(slideIndex);
    });

    // Initialize
    requestSlide(0);
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

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const video = document.querySelector('.video-bg video');

    // Scale slightly larger than 1 and move up
    video.style.transform = `scale(1.5) translateY(-${scrollY * 0.03}px)`;
  });

  const goTopBtn = document.getElementById('goTopBtn');

  // Show button when scrolling down
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) { // show after 300px scroll
      goTopBtn.style.display = 'flex';
    } else {
      goTopBtn.style.display = 'none';
    }
  });

  // Smooth scroll to top on click
  goTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


});