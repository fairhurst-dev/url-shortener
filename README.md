# URL Shortener

A serverless URL shortener service built with AWS Lambda, API Gateway, DynamoDB, and Cognito for user authentication. This service provides a secure, scalable way to shorten URLs with user management, analytics, and safe browsing protection.

## Try it in Postman:

https://www.postman.com/fairhurst-dev/fairhurst-dev/collection/y7t9tpc/url-shortener?action=share&creator=39373856

## Features

- **URL Shortening**: Generate short, unique codes for long URLs
- **User Authentication**: Secure user registration, login, and JWT-based authorization
- **Safe Browsing**: Integration with Google Safe Browsing API to protect against malicious URLs
- **Analytics**: Track URL total clicks and timestamp last accessed
- **Admin URL Management**: Users can manage their own shortened URLs
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Frontend-friendly API with proper CORS configuration

## Architecture

This is a serverless application built on AWS using:

- **AWS Lambda**: Serverless compute for handling requests
- **API Gateway**: HTTP API for routing and authorization
- **DynamoDB**: NoSQL database for storing URLs and analytics
- **Cognito**: User authentication and authorization
- **CloudFormation**: Infrastructure as code via Serverless Framework

## API Endpoints

## Public Redirect Endpoints

- `GET /{shortCode}` - Redirect to original URL

### Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/confirm` - Confirm user registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT tokens

### URL Management Endpoints (Protected)

- `POST /api/v1/shorten` - Create a shortened URL
- `PATCH /api/v1/{shortCode}` - Update a shortened URL
- `DELETE /api/v1/{shortCode}` - Delete a shortened URL
- `GET /api/v1/user/{userId}` - List user's URLs

### Analytics Endpoints (Protected)

- `GET /api/v1/analytics` - Get analytics data

## Project Structure

```
url-shortener/
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   ├── cognito/         # Cognito authentication services
│   │   │   ├── dynamo/          # DynamoDB operations
│   │   │   └── safe_browsing/   # Google Safe Browsing integration
│   │   ├── authorizer.js        # JWT authorization logic
│   │   ├── middleware.js        # Middy middleware configuration
│   │   ├── schemas.js           # Data schemas
│   │   ├── shortener.js         # URL shortening logic
│   │   └── validators.js        # Input validation
│   └── routes/
│       ├── analytics/           # Analytics endpoints
│       ├── urls/                # URL management endpoints
│       ├── users/               # User authentication endpoints
│       └── utils.js             # Common utilities
├── serverless.yml               # Serverless configuration
├── resources.yml                # AWS resource definitions
└── package.json
```

## Technology Stack

- **Runtime**: Node.js 20.x
- **Framework**: Serverless Framework v4
- **Authentication**: AWS Cognito
- **Database**: DynamoDB
- **Testing**: Vitest
- **Validation**: Joi
- **Middleware**: Middy
- **Functional Programming**: Ramda
- **Linting**: ESLint

## Prerequisites

- Node.js 20.x or higher
- AWS CLI configured with appropriate credentials
- Serverless Framework CLI (`npm install -g serverless`)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/fairhurst-dev/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure AWS credentials:
   ```bash
   aws configure
   ```

## Configuration

### Environment Variables

The service uses the following environment variables (automatically set by Serverless):

- `STAGE`: Deployment stage (dev, staging, prod)
- `USER_POOL_CLIENT_ID`: Cognito User Pool Client ID
- `USER_POOL_ID`: Cognito User Pool ID
- `URLS_TABLE`: DynamoDB table name for URLs
- `ANALYTICS_TABLE`: DynamoDB table name for analytics

### Google Safe Browsing API

To use the Safe Browsing feature, you'll need to:

1. Enable the Safe Browsing API in Google Cloud Console
2. Create API credentials
3. Configure the credentials in your environment

## Deployment

### Deploy to Development

```bash
serverless deploy
```

### Deploy to Production

```bash
serverless deploy --stage prod
```

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run watch
```

## Usage Examples

### Register a New User

```bash
curl -X POST https://your-api-gateway-url/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Login

```bash
curl -X POST https://your-api-gateway-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Shorten a URL

```bash
curl -X POST https://your-api-gateway-url/api/v1/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fullURL": "https://example.com/very/long/url/that/needs/shortening"
  }'
```

### Access Shortened URL

```bash
curl -X GET https://your-api-gateway-url/api/v1/abc123
```

## Database Schema

### URLs Table

- **PK**: `{shortCode}` - Primary key
- **GSI1PK**: `{fullURL}` - Global Secondary Index for URL lookup
- **GSI2PK**: `{userId}` - Global Secondary Index for user URL listing
- **ttl**: Time-to-live for automatic cleanup

### Analytics Table

- **PK**: `{shortCode}` or `{userId}` - Primary key
- **GSI1PK**: `{userId}` - Global Secondary Index for user analytics
- **ttl**: Time-to-live for automatic cleanup

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **Safe Browsing**: Automatic malicious URL detection
- **CORS**: Proper cross-origin resource sharing configuration
- **Input Validation**: Comprehensive request validation using Joi

## Monitoring and Logging

- **CloudWatch**: Automatic logging for all Lambda functions
- **Log Retention**: 30-day log retention policy
- **Metrics**: API Gateway metrics enabled
- **Error Handling**: Comprehensive error handling and logging

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the [GitHub repository](https://github.com/fairhurst-dev/url-shortener/issues).

## Author

**fairhurst.dev**

- GitHub: [@fairhurst-dev](https://github.com/fairhurst-dev)
- Website: [fairhurst.dev](https://fairhurst.dev)
