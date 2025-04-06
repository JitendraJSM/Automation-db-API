# API Endpoints Documentation

## Members API

### GET /api/members
- Lists all members with pagination
- Optional query params: page, limit, sort
- Returns: Array of member objects (excluding password)

### GET /api/members/:id
- Returns detailed member information
- Includes systemProfiles and associated tasks
- Returns 404 if member not found

### POST /api/members
- Creates new member
- Required fields: gmail (unique), pwd
- Optional fields: recoveryMail, systemProfiles
- Validates:
  - Gmail uniqueness
  - SystemProfile format (systemName, profileNumber)
- Returns: Created member object

### PUT /api/members/:id
- Updates member information
- Updatable fields: pwd, recoveryMail, systemProfiles
- Validates systemProfile format
- Returns: Updated member object

### DELETE /api/members/:id
- Deletes member and associated data
- Cascading deletion of tasks
- Returns: Success message

### GET /api/members/:id/tasks
- Lists all tasks assigned to member
- Optional query params: status, type
- Returns: Array of task objects

### GET /api/members/:id/channel
- Returns member's YouTube channel details
- Includes engagement stats
- Returns 404 if no channel found

## Channels API

### GET /api/channels
- Lists all channels with pagination
- Optional query params: category, type
- Returns: Array of channel objects

### GET /api/channels/:id
- Returns detailed channel information
- Includes metadata and engagement stats
- Returns 404 if channel not found

### POST /api/channels
- Creates new channel
- Required fields: channelName (unique), ownerId
- Validates:
  - Channel name uniqueness
  - Category enum values
  - Type enum values
- Returns: Created channel object

### PUT /api/channels/:id
- Updates channel information
- Updatable fields: metadata, category, type
- Validates enum values
- Returns: Updated channel object

### DELETE /api/channels/:id
- Deletes channel and associated data
- Cascading deletion of posts
- Returns: Success message

### GET /api/channels/:id/posts
- Lists channel's posts with pagination
- Optional query params: type, uploadDate
- Returns: Array of post objects

### GET /api/channels/:id/stats
- Returns channel's engagement statistics
- Includes both automated and organic metrics
- Optional query params: timeframe

## Posts API

### GET /api/posts
- Lists all posts with pagination
- Optional query params: type, channelId
- Returns: Array of post objects

### GET /api/posts/:id
- Returns detailed post information
- Includes engagement metrics
- Returns 404 if post not found

### POST /api/posts
- Creates new post
- Required fields: channelId, url, type
- Validates post type enum
- Returns: Created post object

### PUT /api/posts/:id
- Updates post information
- Updatable fields: description, engagement
- Returns: Updated post object

### DELETE /api/posts/:id
- Deletes post and associated tasks
- Returns: Success message

### GET /api/posts/:id/tasks
- Lists tasks performed on post
- Optional query params: status, type
- Returns: Array of task objects

### GET /api/posts/unengaged
- Lists posts without recent engagement
- Optional query params: timeframe
- Returns: Array of post objects

## Tasks API

### GET /api/tasks
- Lists all tasks with pagination
- Optional query params: status, type
- Returns: Array of task objects

### GET /api/tasks/:id
- Returns detailed task information
- Returns 404 if task not found

### POST /api/tasks
- Creates new task
- Required fields: assignedTo, targetPost, type
- Validates task type enum
- Returns: Created task object

### PUT /api/tasks/:id
- Updates task status
- Validates status enum
- Updates completedAt timestamp
- Returns: Updated task object

### DELETE /api/tasks/:id
- Deletes task
- Updates related post metrics
- Returns: Success message

### POST /api/tasks/auto-assign
- Auto-assigns tasks based on rules
- Optional body params: memberIds, postTypes
- Returns: Array of created tasks

## Analytics API

### GET /api/analytics/member/:id/performance
- Returns member's engagement metrics
- Optional query params: timeframe
- Returns: Performance statistics

### GET /api/analytics/channel/:id/growth
- Returns channel growth metrics
- Optional query params: timeframe
- Returns: Growth statistics

### GET /api/analytics/posts/engagement
- Returns post engagement analysis
- Optional query params: channelId, timeframe
- Returns: Engagement statistics

### GET /api/analytics/tasks/distribution
- Returns task distribution metrics
- Optional query params: timeframe
- Returns: Distribution statistics

## Error Responses

### 400 Bad Request
- Invalid input data
- Missing required fields
- Invalid enum values

### 401 Unauthorized
- Authentication required
- Invalid credentials

### 403 Forbidden
- Insufficient permissions

### 404 Not Found
- Resource not found

### 409 Conflict
- Duplicate unique fields (gmail, channelName)

### 500 Internal Server Error
- Server-side errors
- Database connection issues