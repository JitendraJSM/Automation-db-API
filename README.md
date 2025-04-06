# YouTube Channel Management API

REST API for managing YouTube channel growth through team collaboration. The API handles member data, channel information, posts, and automated task management.

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a .env file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/youtube-channel-management
API_PREFIX=/api
LOG_LEVEL=debug
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

### Members API

#### GET /api/members
- Lists all members with pagination
- Query params: page, limit, sort
- Returns: Array of member objects (excluding password)

#### GET /api/members/:id
- Returns detailed member information
- Includes systemProfiles and associated tasks

#### POST /api/members
- Creates new member
- Required fields: gmail (unique), pwd
- Optional fields: recoveryMail, systemProfiles

#### PUT /api/members/:id
- Updates member information
- Updatable fields: pwd, recoveryMail, systemProfiles

#### DELETE /api/members/:id
- Deletes member and associated data

### Error Responses

- 400: Bad Request - Invalid input data
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 409: Conflict - Duplicate unique fields
- 500: Internal Server Error

## Project Structure

```
├── src/
│   ├── index.js          # Application entry point
│   ├── models/           # Database models
│   │   ├── member.js
│   │   └── channel.js
│   └── routes/          # API routes
│       └── members.js
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT