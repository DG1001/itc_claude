# Multi-stage build for Java Spring Boot + Angular

# Stage 1: Build Angular frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build Spring Boot backend
FROM maven:3.9-openjdk-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist/snappic-frontend ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
RUN mkdir -p uploads data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]