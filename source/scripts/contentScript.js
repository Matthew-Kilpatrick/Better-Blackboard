import browser from 'webextension-polyfill';
(async () => {
  if (window.location.pathname === "/webapps/portal/execute/tabs/tabAction") {
    // On Blackboard homepage, so need to apply changes
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day
    // Load deadlines to where welcome image was originally
    const url = await getCalendarUrl();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      // Scrape ical file for relevant details
      const events = [];
      const lines = xhr.response.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line !== "BEGIN:VEVENT") continue;
        const date = lines[i + 2].trim().substr(27);
        events.push({
          uid: lines[i + 5].trim().substr(4),
          summary: lines[i + 4].trim().substr(8),
          date: new Date(`${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}T${date.substr(9, 2)}:${date.substr(11, 2)}:${date.substr(13, 2)}Z`),
          url: `https://online.manchester.ac.uk/webapps/calendar/launch/attempt/${lines[i + 5].trim().substr(21).split('@')[0]}`
        });
        events.sort((a, b) => a.date - b.date);
      }
      // Append future deadlines to page
      let items = [];
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.date < today) continue;
        if (event.date.toDateString() === today.toDateString()) {
          // Due today
          items.push(`<li><a href="${event.url}">
          ${event.summary}<br>
          <b>Today</b>, ${event.date.toLocaleString().substr(12, event.date.toLocaleString().length - 15) /* Exclude minutes from date */}
        </a></li>`);
        } else {
          // Not due today
          // TODO: support 'tomorrow'
          items.push(`<li><a href="${event.url}">
          ${event.summary}<br>
          ${event.date.toLocaleString().substr(0, event.date.toLocaleString().length - 3) /* Exclude minutes from date */}
        </a></li>`);
        }
      }
      document.getElementById('$fixedId').innerHTML = `<h3>Upcoming Deadlines</h3><ul class="listElement">${items.join('')}</ul>`;
    };
    xhr.send();

    // Hide sem1 courses when in sem2
    // This assumes sem1 exams are done by end of January so may cause issues if this is an invalid assumption
    const feb = new Date();
    feb.setMonth(1);
    feb.setDate(1);
    feb.setHours(0, 0, 0, 0);
    const sep = new Date();
    sep.setMonth(9);
    sep.setDate(1);
    sep.setHours(0, 0, 0, 0);
    if (feb <= today <= sep) {
      const interval = setInterval(() => {
        const courses = document.getElementById('CurrentCourses').querySelectorAll('li');
        if (courses.length === 0) return;
        for (let i = 0; i < courses.length; i++) {
          if (courses[i].querySelector('a').innerText.substr(8, 1) === '1') {
            courses[i].hidden = true;
          }
        }
        clearInterval(interval);
      }, 250);
    }
  }
})();
// Add a better profile picture!
document.getElementById('global-avatar').src = 'https://cdn.discordapp.com/attachments/783674315756666904/809813098155212810/809e8e529a280eb268abe815395ed2c1.png';

/**
 * Get URL to iCalendar feed for logged in user
 * @returns {Promise<unknown>}
 */
async function getCalendarUrl() {
  // Fetch from browser extension storage if available
  const url = await browser.storage.local.get('deadlines-ical-feed-url');
  if (url.url !== undefined) {
    return url.url;
  }
  // Fall back to requesting from Blackboard server
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://online.manchester.ac.uk/webapps/calendar/calendarFeed/url');
  return new Promise(resolve => {
    xhr.onload = () => {
      browser.storage.local.set({'deadlines-ical-feed-url': xhr.response}); // Cache feed URL
      resolve(xhr.response);
    };
    xhr.send();
  });
}