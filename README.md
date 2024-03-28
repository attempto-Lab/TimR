# TimR

TimR is a time-tracking web app designed for freelancers. It's built with Node.js and Express for the server-side, MongoDB for the database, and Bootstrap along with Vanilla JavaScript for the frontend. It enables users to easily track time spent on various tasks without the hassle of complex setup.

## Overview

The application leverages Node.js and Express for robust server-side functionality, MongoDB for efficient data storage, and Bootstrap for responsive UI design. User sessions are managed through express-session for secure authentication. The app's architecture includes a separation of concerns with specific directories for models, routes (including API endpoints), and views, ensuring maintainability and scalability.

## Features

- **User Registration and Login**: Simple and secure access using a username and password.
- **Time Tracking**: Users can start and stop timers, entering descriptions for tasks, with no overlapping entries allowed.
- **Data Visibility**: The homepage displays the 10 most recent entries, with a detailed report page for viewing entries within a selected date range.
- **Reports and Downloads**: Users can download their time entries in CSV format and view a bar chart of time spent per day within the report's date range.
- **CRUD Operations**: Users have the ability to edit and delete time entries directly from the main page.

## Getting Started

### Requirements

- Node.js
- MongoDB
- npm

### Quickstart

1. Clone the repository.
2. Copy `.env.example` to `.env` and configure the MongoDB connection string and session secret.
3. Install dependencies with `npm install`.
4. Start the server using `npm start`. Access the app through the port defined in your `.env` file.

### License

Copyright (c) 2024.