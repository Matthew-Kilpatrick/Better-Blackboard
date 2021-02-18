import browser from 'webextension-polyfill';
(async () => {
  if (window.location.pathname === "/webapps/portal/execute/tabs/tabAction") {
    // On Blackboard homepage, so need to apply changes
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day
    // Load deadlines to where welcome image was originally
    const xhr = new XMLHttpRequest();
    const eventsUrl = `https://online.manchester.ac.uk/webapps/calendar/calendarData/selectedCalendarEvents?start=${Math.round((new Date()).getTime() / 1000)}`;
    xhr.open('GET', eventsUrl, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      // Parse JSON for events
      const events = [];
      for (let i = 0; i < xhr.response.length; i++) {
        const event = xhr.response[i];
        if (event.id.indexOf('GradableItem') === -1) {
          // Not a deadline, so ignore calendar event
          continue;
        }
        let courseName = event.calendarName.split(' ');
        courseName = courseName.splice(0, courseName.length - 3).join(' ');
        events.push({
          uid: event.id,
          title: event.title,
          course: courseName,
          date: new Date(event.startDate),
          url: event.attemptable ? `https://online.manchester.ac.uk/webapps/calendar/launch/attempt/${event.id}` : null
        })
      }
      events.sort((a, b) => a.date - b.date);
      // Define date 1 hour in future, used to indicate very close deadlines
      const now = new Date();
      now.setHours(now.getHours() + 1);
      // Append future deadlines to page
      let items = [];
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const dayDiff = Math.round((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (event.date < today) continue;
        if (event.date.toDateString() === today.toDateString()) {
          // Due today
          items.push(`<li><a href="${event.url}" style="color: ${now >= event.date ? 'red' : 'orange'}">
          ${event.summary}<br>
          <b>Today</b>, ${event.date.toLocaleString().substr(12, event.date.toLocaleString().length - 15) /* Exclude minutes from date */}
        </a></li>`);
        } else {
          // Not due today
          // TODO: support 'tomorrow'
          items.push(`<li>${event.url ? `<a href="${event.url}">`: ``}
          <b>${event.course}</b><br>
          ${event.title}<br>
          ${event.date.toLocaleString().substr(0, event.date.toLocaleString().length - 3) /* Exclude minutes from date */} (${dayDiff} days)
        ${event.url ? `</a>` : ``}</li>`);
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
            document.getElementById('FormerCourses').querySelector('ul').appendChild(courses[i]);
          }
        }
        clearInterval(interval);
      }, 250);
    }
  }
})();
// Add a better profile picture!
document.getElementById('global-avatar').src = 'https://cdn.discordapp.com/attachments/783674315756666904/809813098155212810/809e8e529a280eb268abe815395ed2c1.png';