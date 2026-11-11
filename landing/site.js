// Header: turn the frosted pill on once the page is scrolled.
const header = document.querySelector('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
