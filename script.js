document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;

  // Open lightbox
  function openLightbox(index) {
    currentIndex = index;
    const imgSrc = galleryItems[index].href;
    const imgAlt = galleryItems[index].querySelector('img').alt;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt;
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

    // Initialize
    showSlide(0);
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