/* LOCKED FILE - Lead AND co-lead approval required.
   1) Injects the shared header and footer into <div id="site-header"> and <div id="site-footer">.
   2) Exposes small helpers on window.MSA for section scripts.
   To change nav links or social links, ask the lead. */
(function () {
  "use strict";

  var SITE_NAME = "MSA FAST Peshawar";
  var NAV = [
    ["Home", "/"],
    ["About", "/about/"],
    ["Events", "/events/"],
    ["Team", "/team/"],
    ["Blog", "/blog/"],
    ["Contact", "/contact/"]
  ];
  // Lead fills real URLs later. Entries with an empty url are not shown.
  var SOCIALS = [
    ["LinkedIn", ""],
    ["Instagram", ""],
    ["GitHub", ""]
  ];

  function isCurrent(href) {
    var p = location.pathname.replace(/index\.html$/, "");
    return href === "/" ? p === "/" : p.indexOf(href) === 0;
  }

  function headerHTML() {
    var links = NAV.map(function (n) {
      return '<li><a href="' + n[1] + '"' + (isCurrent(n[1]) ? ' aria-current="page"' : "") + ">" + n[0] + "</a></li>";
    }).join("");
    return (
      '<header class="site-header"><div class="container nav">' +
      '<a class="brand" href="/"><img src="/images/shared/logo.png" alt="" width="40" height="40"><span>' + SITE_NAME + "</span></a>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>' +
      '<ul class="nav-links" id="nav-links">' + links +
      '<li><a class="btn btn-primary" href="/join/"' + (isCurrent("/join/") ? ' aria-current="page"' : "") + ">Join</a></li></ul>" +
      "</div></header>"
    );
  }

  function footerHTML() {
    var links = NAV.map(function (n) { return '<li><a href="' + n[1] + '">' + n[0] + "</a></li>"; }).join("");
    var socials = SOCIALS.filter(function (s) { return s[1]; }).map(function (s) {
      return '<li><a href="' + s[1] + '" rel="noopener" target="_blank">' + s[0] + "</a></li>";
    }).join("");
    return (
      '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
      "<div><h2>" + SITE_NAME + "</h2><p>Microsoft Student Ambassadors at FAST-NUCES Peshawar.</p></div>" +
      "<div><h2>Pages</h2><ul>" + links + '<li><a href="/join/">Join</a></li></ul></div>' +
      (socials ? "<div><h2>Follow us</h2><ul>" + socials + "</ul></div>" : "") +
      '</div><p class="footer-bottom">&copy; ' + new Date().getFullYear() + " " + SITE_NAME + "</p></div></footer>"
    );
  }

  function mount() {
    var h = document.getElementById("site-header");
    var f = document.getElementById("site-footer");
    if (h) h.outerHTML = headerHTML();
    if (f) f.outerHTML = footerHTML();
    var btn = document.querySelector(".nav-toggle");
    var list = document.getElementById("nav-links");
    if (btn && list) {
      btn.addEventListener("click", function () {
        var open = list.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  window.MSA = {
    // MSA.getJSON("/data/events.json").then(function (events) { ... })
    getJSON: function (path) {
      return fetch(path).then(function (r) {
        if (!r.ok) throw new Error(path + " returned " + r.status);
        return r.json();
      });
    },
    // Dates in data files are "YYYY-MM-DD". Returns e.g. "15 Jan 2027".
    formatDate: function (iso) {
      return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    },
    // Today as "YYYY-MM-DD" (for upcoming/past comparisons: string compare works).
    today: function () {
      var d = new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    },
    // ALWAYS wrap data in MSA.esc() before putting it in innerHTML.
    esc: function (s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
  };
})();
