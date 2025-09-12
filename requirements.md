1. Login Page

Single login page with role-based access (Admin / Faculty).

Authentication using email + password.

Reset password option: sends a reset link to the registered email.

After login, the system redirects to the correct dashboard based on the role.

Logout option is available for both admin and faculty.

2. Admin User Interface
2.1 Students List with Weekly Reports

A search bar to find students by registration number.

An option to filter by faculty to view students under a specific faculty.

Display list of students in a table format with fields:

S.No.

Name

Reg. No.

Assignment Title

Assigned Faculty

Button → Display Weekly Report

Weekly Report Display:

Opens in the same page.

Report is displayed as week-wise entries (Week 1, Week 2, Week 3, …).

Each week’s report is appended as new submissions are added.

2.2 Student Management

Edit student details (name, reg.no., assigned faculty, assignment title).

Delete student option with confirmation.

2.3 Faculty Management

Edit faculty details (name, email, assigned students).

Delete faculty option with confirmation.

3. Faculty User Interface
3.1 Add Students

Faculty can add new students by entering student name and reg.no.

The system will block duplicate reg.no. entries (validation check).

3.2 Create Groups

Faculty can create a new group by entering an assignment title.

A list of available students is displayed.

Faculty must select exactly two students (validation ensures only 2).

After group creation:

The selected students disappear from the available list.

The new group is saved under “Groups List”.

3.3 Groups List

Display the list of created groups with fields:

Assignment Title

Names of the Students in the group

Embedded Google Form Link (pre-configured):

https://docs.google.com/forms/d/e/1FAIpQLScbBUjXVj2N5X4R102bULi01cOy9fslasJTHbQgAkTomxAK9w/viewform?usp=header


Faculty can edit group details (assignment title, student assignment).

Faculty can delete groups if needed.

4. Google Sheets Integration

The project must support integration with Google Sheets to manage weekly report data.

Two approaches should be available:

4.1 API Integration (Recommended)

Use the Google Sheets API to fetch and update report data.

Backend (Node.js/Express) should include googleapis package.

API access configured via a Google Service Account key file with scope:

https://www.googleapis.com/auth/spreadsheets


Provide a configurable spreadsheetId and range (e.g., Sheet1!A1:D10).

The system should be able to:

Read reports from Google Sheets.

Append new week entries (Week 1, Week 2, Week 3, …).

Update existing week entries if edited.

4.2 Embedding (Optional)

Option to embed a public Google Sheet (read-only) using iframe:

<iframe 
  src="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/pubhtml?widget=true&headers=false" 
  width="100%" 
  height="500">
</iframe>


Useful for view-only dashboards when API integration is not needed.

5. General Features

Role-based navigation:

Admin sees only Admin features.

Faculty sees only Faculty features.

Responsive UI (mobile-friendly, works on desktop and mobile).

Tech Stack: MERN

Frontend: React (with responsive design).

Backend: Node.js + Express.

Database: MongoDB.

Security: Basic authentication with email/password and JWT sessions.

Logout option for both Admin and Faculty is mandatory.