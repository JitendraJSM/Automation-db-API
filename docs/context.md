# YouTube Channel Management API

## Overview
REST API for managing YouTube channel growth through team collaboration. The API handles member data, channel information, posts, and automated task management without authentication (to be implemented later).

## Data Models

### 1. Member
```javascript
{
  id: ObjectId,
  gmail: { type: String, unique: true, required: true },
  pwd: String, // Note: Should be encrypted in future
  recoveryMail: String,
  recoveryMailVerified: Boolean,
  gmailCreationDate: Date,
  youtubeChannelId: ObjectId, // Reference to Channel
  systemProfiles: [{
    systemName: String,
    profileNumber: String
  }],
  tasks: [ObjectId], // References to assigned Tasks
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Channel
```javascript
{
  id: ObjectId,
  ownerId: ObjectId, // Reference to Member
  channelName: { type: String, unique: true, required: true },
  category: {
    type: String,
    enum: [
      "cricket", "song", "movie", "failCompilation", "model", "cartoon",
      "devotional", "serial", "meme", "knowledge", "diy", "gaming",
      "education", "fitness", "technology", "cooking", "travel",
      "lifestyle", "news", "comedy"
    ]
  },
  type: {
    type: String,
    enum: ["aiGenerated", "copyrightEdited", "directCopied"]
  }
  
  metadata: {
    creationDate: Date,
    dpImageLink: String,
    bannerImageLink: String,
    keywords: [String],
    handle: String,
    description: String,
    socialMediaLinks: [{
      platform: String,
      url: String
    }],
    videoWaterMark: String
  },
  posts: [ObjectId], // References to all posts
  engagementStats: {
    automated: {
      likes: Number,
      comments: Number,
      shares: Number,
      views: Number,
      subscribers: Number
    },
    organic: {
      likes: Number,
      comments: Number,
      shares: Number,
      views: Number,
      subscribers: Number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Post
```javascript
{
  id: ObjectId,
  channelId: ObjectId, // Reference to Channel
  url: String,
  type: String, // ["photo", "shorts", "video", "article"]
  description: String,
  engagement: {
    automated: {
      likes: [ObjectId], // References to Tasks
      comments: [ObjectId],
      shares: [ObjectId],
      views: [ObjectId]
    },
    organic: {
      likes: Number,
      comments: Number,
      shares: Number,
      views: Number
    }
  },
  uploadDate: Date,
  lastScrapedDate: Date,
  tasksPerformed: [ObjectId], // References to Tasks
  lastTaskPerformedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Task
```javascript
{
  id: ObjectId,
  assignedTo: ObjectId, // Reference to Member
  targetPost: ObjectId, // Reference to Post
  type: String, // ["like", "comment", "share", "view"]
  status: String, // ["pending", "completed", "failed"]
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Members
- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/:id/tasks` - Get member's tasks
- `GET /api/members/:id/channel` - Get member's channel

### Channels
- `GET /api/channels` - List all channels
- `GET /api/channels/:id` - Get channel details
- `POST /api/channels` - Create new channel
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel
- `GET /api/channels/:id/posts` - Get channel's posts
- `GET /api/channels/:id/stats` - Get channel's engagement stats

### Posts
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/:id/tasks` - Get tasks performed on post
- `GET /api/posts/unengaged` - Get posts without recent engagement

### Tasks
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/auto-assign` - Auto-assign tasks based on rules

### Analytics
- `GET /api/analytics/member/:id/performance` - Get member's engagement performance
- `GET /api/analytics/channel/:id/growth` - Get channel's growth metrics
- `GET /api/analytics/posts/engagement` - Get posts engagement analysis
- `GET /api/analytics/tasks/distribution` - Get task distribution analysis

## Implementation Steps

1. **Project Setup**
   - Initialize Node.js project
   - Install dependencies (Express, Mongoose, etc.)
   - Setup MongoDB connection
   - Create basic Express server structure

2. **Database Schema Implementation**
   - Create Mongoose schemas for all models
   - Implement model relationships
   - Add timestamps and indexes

3. **Core API Implementation**
   - Implement CRUD routes for all models
   - Add input validation
   - Implement error handling
   - Add response formatting

4. **Task Automation System**
   - Implement task assignment algorithm
   - Add member selection logic
   - Implement engagement distribution logic
   - Add task status tracking

5. **Analytics Implementation**
   - Add engagement tracking
   - Implement statistics calculation
   - Add performance metrics
   - Create analysis endpoints

6. **Testing & Documentation**
   - Write API tests
   - Create API documentation
   - Add usage examples
   - Document error codes

## Optimization Suggestions

1. **Data Structure Improvements**
   - Use a single posts array in Channel model instead of separate arrays for each type
   - Use aggregated engagement counts instead of arrays of references where possible
   - Add indexes for frequently queried fields

2. **Performance Optimizations**
   - Implement caching for frequently accessed data
   - Use pagination for list endpoints
   - Add field projection to reduce response size
   - Implement batch operations for task management

3. **Future Enhancements**
   - Add authentication and authorization
   - Implement rate limiting
   - Add webhook support for task updates
   - Implement real-time notifications
   - Add monitoring and logging