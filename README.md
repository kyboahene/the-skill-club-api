# NestJS Starter Kit

A robust and production-ready NestJS starter kit with authentication, Prisma ORM, PostgreSQL, Docker, Swagger documentation, email/SMS notifications, pagination, and a reusable serializer interceptor.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with Passport.js
- **Database**: PostgreSQL with Prisma ORM
- **Email System**: Mailer module with template support
- **SMS Notifications**: SMS service integration (Hubtel)
- **Pagination**: Reusable pagination service
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Global validation pipes with class-validator
- **Serialization**: Custom serializer interceptor for response transformation
- **Docker**: Docker Compose for local development
- **TypeScript**: Full TypeScript support
- **Testing**: Jest testing framework setup
- **CORS**: Enabled for cross-origin requests
- **Environment Configuration**: Environment-based configuration

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd nestjs-starter-kit
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/starter_db?schema=public"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASS=your_email_password

# SMS Configuration (Hubtel)
CLIENT_ID=your_hubtel_client_id
CLIENT_SECRET=your_hubtel_client_secret
FROM=your_sender_id
```

### 4. Start the Database
Using Docker (recommended):
```bash
npm run db:dev:up
```

### 5. Setup Database
Run Prisma migrations and seed the database:
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 6. Start the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at:
- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 📚 API Documentation

The API documentation is automatically generated using Swagger and is available at `/docs` endpoint when the application is running.

### Default Users

After running the seed script, you'll have these test users:

- **Admin User**: 
  - Email: `admin@example.com`
  - Password: `admin123`
  - Role: `ADMIN`

- **Regular User**: 
  - Email: `user@example.com`
  - Password: `user123`
  - Role: `USER`

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guard/           # Auth guards
│   ├── strategy/        # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # Users module
├── posts/               # Posts module (example CRUD)
├── pagination/          # Pagination service
│   ├── pagination.entity.ts
│   ├── pagination.service.ts
│   └── pagination.module.ts
├── sms/                 # SMS service (Hubtel integration)
│   ├── sms.controller.ts
│   ├── sms.service.ts
│   └── sms.module.ts
├── send-emails/         # Email service with templates
│   ├── entities/
│   ├── send-emails.controller.ts
│   ├── send-emails.service.ts
│   └── send-emails.module.ts
├── prisma/              # Prisma service
├── interceptors/        # Custom interceptors
├── app.controller.ts    # Main app controller
├── app.service.ts       # Main app service
├── app.module.ts        # Main app module
└── main.ts              # Application entry point

mail-templates/          # Email templates (Handlebars)
├── password_reset_new.hbs
└── general-information.hbs

prisma/
├── schema.prisma        # Database schema
├── seed.ts              # Database seeding
└── migrations/          # Database migrations
```

## 📧 Email System

The starter kit includes a complete email system with template support:

### Sending Emails
```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

// In your service
constructor(private eventEmitter: EventEmitter2) {}

// Send password reset email
this.eventEmitter.emit('password.reset', {
  to: 'user@example.com',
  name: 'John Doe',
  subject: 'Password Reset',
  template: 'password_reset_new',
  resetLink: 'https://yourapp.com/reset?token=...'
});

// Send general notification
this.eventEmitter.emit('general.email.notice', {
  to: 'user@example.com',
  name: 'John Doe',
  subject: 'Welcome!',
  message: 'Welcome to our platform!',
  template: 'general-information'
});
```

### Email Templates
Email templates are stored in the `mail-templates/` directory and use Handlebars syntax.

## 📱 SMS System

Send SMS messages using the Hubtel API:

```bash
POST /sms/send
{
  "recipient": "+233123456789",
  "message": "Your verification code is 123456"
}
```

### Programmatic SMS
```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

// Send SMS via event
this.eventEmitter.emit('send.text.message', {
  recipient: '+233123456789',
  message: 'Your message here'
});
```

## 📄 Pagination

Use the pagination service for consistent paginated responses:

```typescript
import { PaginationService } from './pagination/pagination.service';

@Injectable()
export class YourService {
  constructor(private paginationService: PaginationService) {}

  async findAll(page: number, pageSize: number) {
    return this.paginationService.paginate('user', {
      page,
      pageSize,
      where: { active: true },
      include: { posts: true }
    });
  }
}
```

Response format:
```json
{
  "data": [...],
  "page": 1,
  "totalPages": 5,
  "total": 50,
  "pageSize": 10
}
```

## 🔧 Available Scripts

### Development
- `npm run start:dev` - Start in watch mode
- `npm run start:debug` - Start in debug mode

### Database
- `npm run db:dev:up` - Start PostgreSQL with Docker
- `npm run db:dev:down` - Stop Docker containers
- `npm run db:dev:restart` - Restart database containers
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:seed` - Seed the database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:reset` - Reset database and migrations

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

### Build & Production
- `npm run build` - Build the application
- `npm run start:prod` - Start in production mode

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔐 Authentication

The starter kit includes a complete authentication system:

### Register a new user
```bash
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Routes
Use the `@UseGuards(JwtGuard)` decorator and `@ApiBearerAuth()` for Swagger documentation:

```typescript
@Get('profile')
@UseGuards(JwtGuard)
@ApiBearerAuth()
async getProfile(@Request() req) {
  return req.user;
}
```

## 🎨 Serializer Interceptor

Use the `@Serialize()` decorator to transform responses:

```typescript
import { Serialize } from './interceptors/serializer.interceptor';

@Serialize(UserResponseDto)
@Get('me')
getProfile() {
  // Response will be transformed according to UserResponseDto
}
```

## 🐳 Docker

The project includes Docker configuration for easy development:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Database Management

### Prisma Studio
Access your database with a visual editor:
```bash
npm run prisma:studio
```

### Migrations
Create and apply database migrations:
```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy
```

### Custom Seed Data
Modify `prisma/seed.ts` to add your own seed data:

```typescript
// Add your custom seed logic
await prisma.yourModel.create({
  data: {
    // your data
  },
});
```

## 🔧 Configuration

The application uses environment variables for configuration. All variables are defined in `.env.example`.

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `JWT_REFRESH_SECRET` - Secret for refresh token signing

### Optional Environment Variables

- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_EXPIRES_IN` - Access token expiration (default: 1h)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all required environment variables are set in your production environment.

### Database Migrations
Run migrations in production:
```bash
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help with setup, please open an issue in the repository.

---

**Happy coding! 🎉**
