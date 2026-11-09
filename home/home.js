/**
 * Home Page Logic (home/home.js)
 * Assigned Developer: Muhammad Fasih Zeeshan
 * 
 * Fetches featured upcoming events from /data/events.json if not pre-rendered via Liquid.
 */

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('home-events-container');
  if (!container || container.children.length > 0) {
    // Already populated by server-side Jekyll Liquid
    return;
  }

  fetch('/data/events.json')
    .then(function (response) {
      if (!response.ok) throw new Error('Network error loading events');
      return response.json();
    })
    .then(function (events) {
      const featured = events.filter(function (e) {
        return e.featured && e.status === 'upcoming';
      });

      if (featured.length === 0) {
        container.innerHTML = '<p class="text-muted">No upcoming events scheduled right now. Check back soon!</p>';
        return;
      }

      container.innerHTML = featured.map(function (event) {
        return `
          <article class="event-card">
            <span class="event-badge">${event.category}</span>
            <h3>${event.title}</h3>
            <p>${event.tagline}</p>
            <div class="event-meta">
              <span>📅 ${event.date}</span>
              <span>📍 ${event.venue.name}</span>
            </div>
            ${event.registrationUrl ? `<a href="${event.registrationUrl}" class="btn-primary" target="_blank" rel="noopener noreferrer">Register</a>` : ''}
          </article>
        `;
      }).join('');
    })
    .catch(function (err) {
      console.warn('Could not fetch events client-side:', err);
    });
});
