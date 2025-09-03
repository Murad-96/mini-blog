# API Test Suite

This directory contains comprehensive tests for all API endpoints in the mini-blog backend.

## Test Coverage

The test suite covers the following endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/login` - User login

### Posts Endpoints
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (requires authentication)
- `DELETE /api/posts/:id` - Delete a post

### Comments Endpoints
- `POST /api/posts/:id/comments` - Add comment to a post

## Running Tests

### Prerequisites
Make sure all dependencies are installed:
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Features

### In-Memory Database
- Uses MongoDB Memory Server for isolated testing
- Each test starts with a clean database
- No need for external MongoDB connection during testing

### Authentication Testing
- Tests both cookie-based and header-based authentication
- Validates JWT token generation and verification
- Tests password hashing and verification

### Comprehensive Coverage
- Happy path scenarios
- Error cases (invalid data, missing authentication, etc.)
- Edge cases (non-existent resources, invalid IDs)
- Integration tests covering complete user workflows

### Test Structure
- **Setup/Teardown**: Automatic database setup and cleanup
- **Isolation**: Each test runs independently
- **Realistic**: Tests use the same middleware and logic as production

## Test Categories

1. **Unit Tests**: Individual endpoint functionality
2. **Integration Tests**: Complete user workflows
3. **Authentication Tests**: Security and token handling
4. **Error Handling Tests**: Invalid inputs and edge cases

## Dependencies

- **Jest**: Test framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **bcrypt**: Password hashing (same as production)
- **jsonwebtoken**: JWT token handling (same as production)

## Test Environment

Tests run with:
- `NODE_ENV=test`
- Isolated in-memory database
- Test-specific JWT secret
- No external dependencies required
