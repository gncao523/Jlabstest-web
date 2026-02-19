# Jlabstest Web

React frontend for Jlabstest IP Geolocation application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure the API is running at `http://localhost:8000` (or set `VITE_API_URL` in `.env`).

3. Start the dev server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- **Login**: Email/password authentication via API
- **Home**: View IP and geolocation of logged-in user (ipinfo.io)
- **Search**: Enter IP address to fetch its geolocation
- **Validation**: Error shown for invalid IP addresses
- **Clear**: Revert display to user's own geolocation
- **History**: List of past searches; click to view again
- **Bulk delete**: Select multiple history items and delete
- **Map**: Map with pin showing exact location

## Seeded Users

Use these to log in (after running `npm run seed` in the API):

- Email: `admin@example.com`, Password: `password123`
- Email: `user@example.com`, Password: `user123456`
