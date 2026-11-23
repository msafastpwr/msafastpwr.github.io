/**
 * Home Page Logic (home/home.js)
 * Assigned Developer: Muhammad Fasih Zeeshan
 *
 * Fetches upcoming events from /data/events.json if not pre-rendered via Liquid.
 * Shows soonest first, maximum 3, with friendly date format.
 */

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('home-events-container');
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
      var upcoming = events
        .filter(function (e) {
          return e.status === 'upcoming';
        })
        .sort(function (a, b) {
          return new Date(a.date) - new Date(b.date);
        })
        .slice(0, 3);

      if (upcoming.length === 0) {
        container.innerHTML = '<p class="home-no-events">No upcoming events scheduled right now. Check back soon!</p>';
        return;
      }

      container.innerHTML = upcoming.map(function (event) {
        var friendlyDate = new Date(event.date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        return [
          '<article class="event-card">',
          '  <span class="event-badge">' + event.category + '</span>',
          '  <h3>' + event.title + '</h3>',
          '  <p>' + event.tagline + '</p>',
          '  <div class="event-meta">',
          '    <span>📅 ' + friendlyDate + '</span>',
          '    <span>📍 ' + event.venue.name + '</span>',
          '  </div>',
          event.registrationUrl
            ? '  <a href="' + event.registrationUrl + '" class="btn-primary" target="_blank" rel="noopener noreferrer">Register Now</a>'
            : '',
          '</article>'
        ].join('\n');
      }).join('');
    })
    .catch(function (err) {
      console.warn('Could not fetch events client-side:', err);
    });
});
