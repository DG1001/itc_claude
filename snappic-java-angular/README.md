# SnapPic - Java/Spring Boot + Angular

A modern rewrite of the SnapPic ephemeral photo sharing application using Java Spring Boot backend and Angular frontend.

## Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Build Tool**: Maven
- **Features**: REST API, file upload, scheduled cleanup, CORS

### Frontend (Angular)
- **Framework**: Angular 17
- **TypeScript**: Full type safety
- **PWA**: Service Worker, offline support
- **Build Tool**: Angular CLI

## Features

- **Ephemeral Photos**: Images display for 5s, fade for 10s, then auto-delete
- **Mobile-First**: Responsive design optimized for smartphones
- **PWA**: Installable as a mobile app
- **Real-time**: Auto-refreshing gallery every 2 seconds
- **FIFO**: Maximum 10 images with oldest displaced first
- **Security**: File validation, size limits, XSS protection

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### Development

#### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on http://localhost:8080

#### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:4200

### Production with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t snappic .
docker run -p 8080:8080 snappic
```

## API Endpoints

- `POST /api/upload` - Upload image with comment
- `GET /api/images` - Get current images with timing info
- `GET /api/uploads/{filename}` - Serve uploaded images

## Configuration

### Application Properties
```properties
server.port=8080
spring.servlet.multipart.max-file-size=5MB
app.upload.dir=uploads
app.max.images=10
app.image.display.seconds=5
app.image.fadeout.seconds=10
```

### Environment Variables
- `SPRING_PROFILES_ACTIVE` - Set to 'prod' for production
- `SERVER_PORT` - Override default port (8080)

## Project Structure

```
snappic-java-angular/
├── backend/
│   ├── src/main/java/com/snappic/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── model/          # Data models
│   │   ├── dto/            # Data transfer objects
│   │   └── config/         # Configuration
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── src/app/
│   │   ├── components/     # Angular components
│   │   ├── services/       # HTTP services
│   │   └── models/         # TypeScript interfaces
│   ├── package.json
│   └── angular.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Key Improvements over Original

### Backend
- **Type Safety**: Full Java type system
- **Dependency Injection**: Spring IoC container
- **Scheduled Tasks**: Built-in scheduling for cleanup
- **Validation**: Bean validation annotations
- **Actuator**: Production monitoring endpoints

### Frontend
- **Type Safety**: TypeScript interfaces
- **Component Architecture**: Reusable Angular components
- **RxJS**: Reactive programming for API calls
- **PWA**: Enhanced service worker configuration
- **Build Optimization**: Tree-shaking, lazy loading

### DevOps
- **Docker**: Multi-stage builds for optimization
- **Health Checks**: Docker health monitoring
- **Production Ready**: Environment-specific configs

## Deployment

### Traditional
```bash
# Build backend
cd backend && mvn clean package

# Build frontend
cd ../frontend && npm run build

# Copy frontend dist to backend resources
cp -r dist/snappic-frontend/* ../backend/src/main/resources/static/

# Run JAR
java -jar backend/target/*.jar
```

### Docker
```bash
docker-compose up -d
```

### Cloud
The Docker image is ready for deployment on:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform