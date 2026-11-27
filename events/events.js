document.addEventListener("DOMContentLoaded", () => {
  const dataElement = document.getElementById("events-data");
  const timelineElement = document.getElementById("events-timeline");
  const upcomingContainer = document.getElementById("events-upcoming");
  const pastContainer = document.getElementById("events-past");
  const presentElement = document.getElementById("events-present");
  const todayElement = document.getElementById("events-today-date");
  const emptyElement = document.getElementById("events-empty");

  const countAllEl = document.getElementById("count-all");
  const countUpcomingEl = document.getElementById("count-upcoming");
  const countPastEl = document.getElementById("count-past");
  const filterButtons = document.querySelectorAll(".events-filter-btn");
  const jumpTodayButton = document.getElementById("events-jump-today");

  const modal = document.getElementById("events-modal");
  const modalBody = document.getElementById("events-modal-body");
  const closeButton = document.getElementById("events-modal-close");

  if (
    !dataElement ||
    !upcomingContainer ||
    !pastContainer ||
    !presentElement ||
    !modal ||
    !modalBody
  ) {
    return;
  }

  function showEmpty(message) {
    if (!emptyElement) return;
    emptyElement.textContent = message;
    emptyElement.hidden = false;
  }

  let events;

  try {
    events = JSON.parse(dataElement.textContent);
  } catch (error) {
    console.error("Could not read events data:", error);
    showEmpty("Unable to load events.");
    return;
  }

  if (!Array.isArray(events)) {
    console.error("Events data must be an array.");
    showEmpty("Unable to load events.");
    return;
  }

  // Normalize YYYY-M-D or YYYY-MM-DD to a zero-padded YYYY-MM-DD string.
  function normalizeDateString(dateValue) {
    if (typeof dateValue !== "string") return null;
    const match = dateValue.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const checkDate = new Date(year, month - 1, day);

    if (
      checkDate.getFullYear() !== year ||
      checkDate.getMonth() !== month - 1 ||
      checkDate.getDate() !== day
    ) {
      return null;
    }

    return (
      `${String(year).padStart(4, "0")}-` +
      `${String(month).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`
    );
  }

  // Skip only synthetic dummy entries from earlier timeline tests.
  function isPlaceholderTestEvent(event) {
    const id = String(event?.id || "").trim().toLowerCase();
    const tagline = String(event?.tagline || "").trim().toLowerCase();

    return (
      id.startsWith("test-timeline-") ||
      id.startsWith("testing_") ||
      tagline === "temporary event for timeline testing."
    );
  }

  const realEvents = events
    .filter(event => !isPlaceholderTestEvent(event))
    .map(event => {
      const normalizedDate = normalizeDateString(event?.date);
      return normalizedDate ? { ...event, date: normalizedDate } : null;
    })
    .filter(Boolean);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Today's date using local calendar time.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (todayElement) {
    todayElement.textContent = today.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Parse YYYY-MM-DD as a local date (no timezone shifting).
  function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(dateString, options = {}) {
    return parseLocalDate(dateString).toLocaleDateString("en-GB", options);
  }

  function getDateParts(dateString) {
    const date = parseLocalDate(dateString);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: String(date.getDate()).padStart(2, "0"),
      year: String(date.getFullYear())
    };
  }

  const LONG_DATE = { day: "numeric", month: "long", year: "numeric" };

  // Escape text before inserting it into HTML.
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  // Allow only HTTP and HTTPS links. Returns the raw URL string or "".
  function safeURLRaw(value) {
    if (!value) return "";

    try {
      const url = new URL(value, window.location.origin);

      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.href;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  // Same check, escaped for use inside an HTML attribute.
  function safeURL(value) {
    return escapeHTML(safeURLRaw(value));
  }

  function getInitials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "MS";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Short label like "Today", "Tomorrow", "In 5 days" for near events.
  function getCountdown(eventDate) {
    const days = Math.round((eventDate - today) / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days > 1 && days <= 30) return `In ${days} days`;
    return "";
  }

  let lastTriggerButton = null;

  // Create one clickable timeline pass card.
  function createEventElement(event, isUpcoming) {
    const button = document.createElement("button");
    const dateParts = getDateParts(event.date);
    const countdown = isUpcoming
      ? getCountdown(parseLocalDate(event.date))
      : "";
    const venueLabel = event.venue?.isVirtual
      ? "Online Session"
      : [event.venue?.room, event.venue?.name].filter(Boolean).join(" • ");

    const speakers = Array.isArray(event.speakers) ? event.speakers : [];
    const tags = Array.isArray(event.tags) ? event.tags.slice(0, 2) : [];

    const speakerChipHTML =
      speakers.length > 0
        ? `
          <span class="events-item-speaker-chip">
            <span class="events-item-speaker-avatar" aria-hidden="true">
              ${escapeHTML(getInitials(speakers[0].name))}
            </span>
            <span>
              ${escapeHTML(speakers[0].name)}${
                speakers.length > 1 ? ` +${speakers.length - 1}` : ""
              }
            </span>
          </span>
        `
        : "";

    const tagChipsHTML = tags
      .map(tag => `<span class="events-item-tag-chip">${escapeHTML(tag)}</span>`)
      .join("");

    button.type = "button";
    button.className =
      "events-item " +
      (isUpcoming ? "events-item-is-upcoming" : "events-item-is-past");
    button.setAttribute("aria-label", `View details: ${event.title}`);

    button.innerHTML = `
      <div class="events-item-card">
        <div class="events-item-body">
          <div class="events-date-tile" aria-hidden="true">
            <span class="events-date-month">${escapeHTML(dateParts.month)}</span>
            <span class="events-date-day">${escapeHTML(dateParts.day)}</span>
            <span class="events-date-year">${escapeHTML(dateParts.year)}</span>
          </div>

          <div class="events-item-info">
            <div class="events-item-meta-top">
              ${
                event.category
                  ? `<span class="events-item-category">${escapeHTML(event.category)}</span>`
                  : ""
              }
              ${
                isUpcoming
                  ? countdown
                    ? `<span class="events-item-countdown">${escapeHTML(countdown)}</span>`
                    : ""
                  : `<span class="events-item-status-past">Completed</span>`
              }
            </div>

            <h2 class="events-item-title">${escapeHTML(event.title)}</h2>

            ${
              event.tagline
                ? `<p class="events-item-tagline">${escapeHTML(event.tagline)}</p>`
                : ""
            }

            ${
              speakerChipHTML || tagChipsHTML
                ? `<div class="events-item-extras">${speakerChipHTML}${tagChipsHTML}</div>`
                : ""
            }

            <div class="events-item-footer">
              ${
                venueLabel
                  ? `<span class="events-item-venue">${escapeHTML(venueLabel)}</span>`
                  : ""
              }
              <span class="events-item-hint">View details →</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Prefer thumbnailUrl for timeline cards; fall back to posterUrl.
    const cardImageURL = safeURLRaw(
      event.image?.thumbnailUrl || event.image?.posterUrl
    );

    if (cardImageURL) {
      const card = button.querySelector(".events-item-card");
      const banner = document.createElement("div");
      const bannerImg = document.createElement("img");

      banner.className = "events-item-banner";
      banner.setAttribute("aria-hidden", "true");
      bannerImg.src = cardImageURL;
      bannerImg.alt = "";
      bannerImg.loading = "lazy";
      bannerImg.decoding = "async";

      banner.appendChild(bannerImg);
      card.insertBefore(banner, card.firstChild);

      bannerImg.addEventListener("error", () => banner.remove(), {
        once: true
      });
    }

    button.addEventListener("click", () => {
      lastTriggerButton = button;
      openEventModal(event, isUpcoming);
    });

    return button;
  }

  // Build event details inside the popup.
  function openEventModal(event, isUpcoming) {
    const venue = event.venue || {};
    const time = event.time || {};
    const recap = event.recap || {};

    const poster = safeURL(event.image?.posterUrl || event.image?.thumbnailUrl);

    const speakerHTML = (event.speakers || [])
      .map((speaker, index) => {
        const linkedin = safeURL(speaker.linkedinUrl);
        const photo = safeURL(speaker.photoUrl);
        const initials = escapeHTML(getInitials(speaker.name));

        return `
          <div class="events-modal-speaker" data-speaker-index="${index}">
            <span class="events-modal-speaker-badge" aria-hidden="true">
              ${
                photo
                  ? `<img class="events-modal-speaker-photo" src="${photo}" alt="">`
                  : initials
              }
            </span>
            <div class="events-modal-speaker-info">
              <strong>${escapeHTML(speaker.name)}</strong>
              <span>${escapeHTML(speaker.role)}</span>
              <span>${escapeHTML(speaker.organization)}</span>
              ${
                linkedin
                  ? `<a href="${linkedin}" target="_blank" rel="noopener noreferrer">View LinkedIn Profile →</a>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");

    const tagHTML = (event.tags || [])
      .map(tag => `<span class="events-modal-tag">${escapeHTML(tag)}</span>`)
      .join("");

    const registrationURL = safeURL(event.registrationUrl);
    const reportURL = safeURL(recap.reportUrl);
    const albumURL = safeURL(recap.photoAlbumUrl);
    const virtualURL = safeURL(venue.virtualLink);

    const timeText = [
      [time.start, time.end].filter(Boolean).join(" – "),
      time.timezone
    ]
      .filter(Boolean)
      .join(" ");

    const venueText = [venue.name, venue.campus].filter(Boolean).join(", ");

    const deadline = event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : null;
    const deadlineValid = deadline && !Number.isNaN(deadline.getTime());
    const registrationOpen =
      isUpcoming && (!deadlineValid || deadline > new Date());

    modalBody.innerHTML = `
      ${
        poster
          ? `<img
              class="events-modal-poster"
              src="${poster}"
              alt="${escapeHTML(event.image?.altText || event.title)}"
            >`
          : ""
      }

      ${
        event.category
          ? `<span class="events-modal-category">${escapeHTML(event.category)}</span>`
          : ""
      }

      <h2 class="events-modal-title">${escapeHTML(event.title)}</h2>

      ${
        event.tagline
          ? `<p class="events-modal-tagline">${escapeHTML(event.tagline)}</p>`
          : ""
      }

      ${
        event.description
          ? `<p class="events-modal-description">${escapeHTML(event.description)}</p>`
          : ""
      }

      <div class="events-modal-meta">
        <p>
          <strong>Date</strong>
          ${escapeHTML(formatDate(event.date, LONG_DATE))}
        </p>

        ${
          timeText
            ? `<p><strong>Time</strong>${escapeHTML(timeText)}</p>`
            : ""
        }

        ${
          venueText
            ? `<p><strong>Venue</strong>${escapeHTML(venueText)}</p>`
            : ""
        }

        ${
          venue.room
            ? `<p><strong>Room</strong>${escapeHTML(venue.room)}</p>`
            : ""
        }
      </div>

      ${
        tagHTML
          ? `
            <section class="events-modal-section">
              <h3>Topics</h3>
              <div class="events-modal-tags">${tagHTML}</div>
            </section>
          `
          : ""
      }

      ${
        speakerHTML
          ? `
            <section class="events-modal-section">
              <h3>Speakers</h3>
              ${speakerHTML}
            </section>
          `
          : ""
      }

      ${
        (registrationURL && registrationOpen) || virtualURL
          ? `
            <div class="events-modal-actions">
              ${
                registrationURL && registrationOpen
                  ? `<a class="events-modal-link" href="${registrationURL}" target="_blank" rel="noopener noreferrer">Register for event</a>`
                  : ""
              }
              ${
                virtualURL
                  ? `<a class="events-modal-link" href="${virtualURL}" target="_blank" rel="noopener noreferrer">Join online</a>`
                  : ""
              }
            </div>
          `
          : ""
      }

      ${
        deadlineValid && registrationOpen
          ? `
            <p class="events-modal-recap">
              Registration deadline:
              ${escapeHTML(
                deadline.toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              )}
            </p>
          `
          : ""
      }

      ${
        recap.attendeeCount || reportURL || albumURL
          ? `
            <section class="events-modal-section">
              <h3>Event recap</h3>
              ${
                recap.attendeeCount
                  ? `<p class="events-modal-recap">${escapeHTML(recap.attendeeCount)} attendees joined this session.</p>`
                  : ""
              }
              <div class="events-modal-actions">
                ${
                  albumURL
                    ? `<a class="events-modal-link" href="${albumURL}" target="_blank" rel="noopener noreferrer">View photo album</a>`
                    : ""
                }
                ${
                  reportURL
                    ? `<a class="events-modal-link" href="${reportURL}" target="_blank" rel="noopener noreferrer">Read event report</a>`
                    : ""
                }
              </div>
            </section>
          `
          : ""
      }
    `;

    const modalPosterImg = modalBody.querySelector(".events-modal-poster");
    if (modalPosterImg) {
      modalPosterImg.addEventListener(
        "error",
        () => modalPosterImg.remove(),
        { once: true }
      );
    }

    // If a speaker photo fails to load, swap back to their initials cleanly.
    modalBody.querySelectorAll(".events-modal-speaker").forEach(speakerEl => {
      const idx = Number(speakerEl.dataset.speakerIndex);
      const speakerObj = (event.speakers || [])[idx];
      const badgeEl = speakerEl.querySelector(".events-modal-speaker-badge");
      const photoImg = badgeEl?.querySelector(".events-modal-speaker-photo");

      if (photoImg && badgeEl) {
        photoImg.addEventListener(
          "error",
          () => {
            badgeEl.textContent = getInitials(speakerObj?.name);
          },
          { once: true }
        );
      }
    });

    modal.scrollTop = 0;
    document.documentElement.classList.add("events-modal-open");
    modal.showModal();
  }

  // Separate upcoming and past events by their real dates.
  const upcomingEvents = [];
  const pastEvents = [];

  realEvents.forEach(event => {
    const eventDate = parseLocalDate(event.date);

    if (eventDate >= today) {
      upcomingEvents.push(event);
    } else {
      pastEvents.push(event);
    }
  });

  // Upcoming: farthest first, so the nearest event sits right above TODAY.
  upcomingEvents.sort((a, b) => b.date.localeCompare(a.date));

  // Past: most recent first, so it sits right below TODAY.
  pastEvents.sort((a, b) => b.date.localeCompare(a.date));

  if (countAllEl) {
    countAllEl.textContent = String(upcomingEvents.length + pastEvents.length);
  }
  if (countUpcomingEl) {
    countUpcomingEl.textContent = String(upcomingEvents.length);
  }
  if (countPastEl) {
    countPastEl.textContent = String(pastEvents.length);
  }

  upcomingEvents.forEach(event => {
    upcomingContainer.appendChild(createEventElement(event, true));
  });

  pastEvents.forEach(event => {
    pastContainer.appendChild(createEventElement(event, false));
  });

  if (emptyElement) {
    emptyElement.hidden = upcomingEvents.length + pastEvents.length > 0;
  }

  // Timeline filter controls (All / Upcoming / Past).
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter || "all";
      if (timelineElement) {
        timelineElement.dataset.filterState = filter;
      }

      filterButtons.forEach(b => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      document.querySelectorAll(".events-item.is-hidden").forEach(item => {
        item.classList.add("is-visible");
      });
    });
  });

  // Jump to TODAY button.
  jumpTodayButton?.addEventListener("click", () => {
    if (timelineElement && timelineElement.dataset.filterState !== "all") {
      timelineElement.dataset.filterState = "all";
      filterButtons.forEach(b => {
        const isAll = b.dataset.filter === "all";
        b.classList.toggle("is-active", isAll);
        b.setAttribute("aria-pressed", String(isAll));
      });
    }

    const rect = presentElement.getBoundingClientRect();
    const target =
      window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
    window.scrollTo({
      top: Math.max(0, target),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });
  });

  // Modal closing and focus restoration.
  closeButton?.addEventListener("click", () => {
    modal.close();
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.close();
    }
  });

  modal.addEventListener("close", () => {
    document.documentElement.classList.remove("events-modal-open");
    if (lastTriggerButton && lastTriggerButton.isConnected) {
      lastTriggerButton.focus({ preventScroll: true });
    }
    lastTriggerButton = null;
  });

  // Staggered reveal as cards scroll into view.
  const items = document.querySelectorAll(".events-item");

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      entries => {
        let order = 0;

        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.style.transitionDelay = `${Math.min(order, 4) * 60}ms`;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          order += 1;
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(item => {
      item.classList.add("is-hidden");
      observer.observe(item);
    });
  }

  // Scroll so TODAY sits centered vertically in the viewport on initial load.
  let userHasScrolled = false;

  ["wheel", "touchstart", "keydown", "mousedown"].forEach(type => {
    window.addEventListener(
      type,
      () => {
        userHasScrolled = true;
      },
      { once: true, passive: true }
    );
  });

  function centerToday() {
    const rect = presentElement.getBoundingClientRect();
    const target =
      window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
    const top = Math.max(0, target);

    if (Math.abs(top - window.scrollY) < 8) return;

    window.scrollTo({ top, behavior: "auto" });
  }

  const navigation = performance.getEntriesByType?.("navigation")[0];
  const isBackForward = navigation && navigation.type === "back_forward";
  const hasHash = Boolean(window.location.hash);

  if (!isBackForward && !hasHash && items.length > 0) {
    requestAnimationFrame(() => {
      requestAnimationFrame(centerToday);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!userHasScrolled) centerToday();
      });
    }
  }
});