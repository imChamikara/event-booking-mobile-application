# EventHub - Event Booking Mobile Application

EventHub is a comprehensive mobile application built with React Native and Expo, designed to bridge the gap between event organizers and attendees. It provides a seamless platform for discovering, booking, and managing events.

## 🚀 Key Features

### For Attendees
- **Event Discovery**: Explore a wide range of events across categories like Music, Sports, Tech, and more.
- **Easy Booking**: Quick and secure ticket booking process with real-time seat availability.
- **Digital Tickets**: Access QR-coded tickets directly within the app.
- **Booking Management**: View upcoming and past bookings, with the ability to cancel if plans change.
- **Search & Filter**: Find exactly what you're looking for with powerful search and category filters.

### For Organizers
- **Event Management**: Create, edit, and publish events with ease.
- **Dashboard**: Track event performance, tickets sold, and total revenue at a glance.
- **Attendee Tracking**: View list of attendees for every event you organize.
- **Flexible Forms**: Rich event creation form with native date/time pickers and location mapping.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, Expo Router (File-based routing)
- **State Management**: TanStack Query (React Query) for server state, React Context for local state.
- **Forms**: React Hook Form with Zod validation.
- **Backend**: Node.js, Express.js
- **Database**: SQLite (Better-SQLite3) for persistent, reliable storage.
- **Styling**: Custom theme system with responsive spacing and typography.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your physical device (iOS/Android)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/imChamikara/event-booking-mobile-application.git
   cd event-booking-mobile-application
   ```

2. **Install Dependencies**:
   Install for both the root (app) and the server.
   ```bash
   # Root directory
   npm install

   # Server directory
   cd server
   npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the **root** folder:
   ```env
   EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:3000/api
   ```
   *Replace `<YOUR_COMPUTER_IP>` with your actual local IP (run `ipconfig` on Windows or `ifconfig` on Mac to find it).*

   Create a `.env` file in the **server** folder:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. **Initialize the Database**:
   ```bash
   cd server
   npm run seed
   cd ..
   ```

### Running the Application

You need to run both the backend server and the frontend app simultaneously in two different terminals.

**Terminal 1: Start the Backend Server**
```bash
cd server
npm run dev
```

**Terminal 2: Start the Mobile App**
```bash
# From the root directory
npx expo start -c
```

Scan the QR code with your **Expo Go** app to view the application on your device.

## 👤 Test Credentials
You can use these accounts to explore the app immediately after seeding:
- **Organizer**: `org1@test.com` / `password123`
- **Attendee**: `att1@test.com` / `password123`

---
Developed as part of the 2nd Year 2nd Semester Mobile Application project.
