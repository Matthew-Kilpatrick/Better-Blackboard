# Ideas
Below is a list of changes which could be made to the extension to improve it:
- Display a course code alongside the deadline submission name (the iCal feed includes this, but ajax requests on calendar page do [eg. https://online.manchester.ac.uk/webapps/calendar/calendarData/selectedCalendarEvents?start=1612137600000&end=1615766400000&course_id=&mode=personal], so perhaps change deadline source?)
- Detection & indication of whether a submission has been made for a deadline (again, not sure how easy)
- Better deadline dates (eg. Tomorrow, this Thursday) where possible rather than (or in addition to) the date
- Include overdue (past due date but nothing submitted yet) deadlines on the upcoming deadlines list
- Don't have links for assignments where submission page not available (eg. submission through GitLab) - ajax calendar feed mentioned above indicates whether this is the case (`attemptable`)
- Attempt to strip dates out of assessment title if it includes it (eg. COMP28112 ending with " - Deadline: DD/MM/YYYY-HH:MM")
- Days until due counter
If you think any of these features would be useful and have time, please feel free to implement it and submit a pull request.
