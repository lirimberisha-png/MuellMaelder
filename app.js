const TYPE_INFO = {
  kehricht: { label: "Kehricht", icon: "🗑️" },
  karton: { label: "Karton", icon: "📦" }
};

function parseLocalDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDate(date) {
  return new Intl.DateTimeFormat("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(date);
}

function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / MS);
}

function countdownText(days) {
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  return `${days} Tage`;
}

function eventInfo(event) {
  return TYPE_INFO[event.type] ?? { label: event.type, icon: "♻️" };
}

async function loadData() {
  const response = await fetch("abfuhrdaten.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Abfuhrdaten konnten nicht geladen werden.");
  }
  return response.json();
}

function renderNext(event, today) {
  const info = eventInfo(event);
  const date = parseLocalDate(event.date);
  const days = daysBetween(today, date);

  document.getElementById("next-icon").textContent = info.icon;
  document.getElementById("next-title").textContent = info.label;
  document.getElementById("next-date").textContent = formatDate(date);
  document.getElementById("next-countdown").textContent = countdownText(days);
}

function renderUpcoming(events, today) {
  const list = document.getElementById("upcoming-list");
  list.innerHTML = "";

  events.forEach(event => {
    const info = eventInfo(event);
    const date = parseLocalDate(event.date);
    const days = daysBetween(today, date);

    const item = document.createElement("article");
    item.className = "after-item";
    item.innerHTML = `
      <div class="after-icon">${info.icon}</div>
      <div class="after-copy">
        <p class="after-type">${info.label}</p>
        <p class="after-date">${formatDate(date)}</p>
      </div>
      <div class="after-days">${countdownText(days)}</div>
    `;
    list.appendChild(item);
  });
}

function renderCalendar(events) {
  const list = document.getElementById("calendar-list");
  list.innerHTML = "";

  events.forEach(event => {
    const info = eventInfo(event);
    const date = parseLocalDate(event.date);

    const item = document.createElement("article");
    item.className = "calendar-item";
    item.innerHTML = `
      <div class="calendar-icon">${info.icon}</div>
      <div class="calendar-copy">
        <p class="calendar-type">${info.label}</p>
        <p class="calendar-date">${formatDate(date)}</p>
      </div>
    `;
    list.appendChild(item);
  });
}

function setupNavigation() {
  const buttons = [...document.querySelectorAll(".nav-item")];
  const pages = [...document.querySelectorAll(".page")];

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.page;

      pages.forEach(page => {
        page.classList.toggle("active", page.id === `page-${target}`);
      });

      buttons.forEach(btn => {
        const active = btn === button;
        btn.classList.toggle("active", active);
        if (active) {
          btn.setAttribute("aria-current", "page");
        } else {
          btn.removeAttribute("aria-current");
        }
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function init() {
  try {
    const data = await loadData();
    const today = startOfToday();

    const sortedEvents = data.events
      .map(event => ({ ...event, parsedDate: parseLocalDate(event.date) }))
      .sort((a, b) => a.parsedDate - b.parsedDate);

    const futureEvents = sortedEvents.filter(event => event.parsedDate >= today);

    if (futureEvents.length > 0) {
      renderNext(futureEvents[0], today);
      renderUpcoming(futureEvents.slice(1, 4), today);
    } else {
      document.getElementById("next-title").textContent = "Keine Termine";
      document.getElementById("next-date").textContent = "Für 2026 sind keine weiteren Abfuhren vorhanden.";
      document.getElementById("next-countdown").textContent = "Fertig";
      document.getElementById("next-icon").textContent = "✓";
    }

    renderCalendar(sortedEvents);
  } catch (error) {
    console.error(error);
    document.getElementById("next-title").textContent = "Fehler";
    document.getElementById("next-date").textContent = error.message;
    document.getElementById("next-countdown").textContent = "!";
    document.getElementById("next-icon").textContent = "!";
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(err => console.error("Service Worker konnte nicht registriert werden:", err));
  });
}

setupNavigation();
init();
