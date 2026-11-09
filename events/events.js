/**
 * Events Page Filter Logic (events/events.js)
 * Assigned Developer: Mohsin Ali
 */

document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.events-filter-btn');
  const cards = document.querySelectorAll('.events-card');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');

      cards.forEach(function (card) {
        const status = card.getAttribute('data-status');
        if (filter === 'all' || status === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
