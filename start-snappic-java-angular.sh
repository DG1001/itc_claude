#!/bin/bash
echo "Starting Java/Angular Snappic implementation..."
cd /workspace/snappic-java-angular

# Start backend (Spring Boot)
echo "Starting Spring Boot backend on port 8080..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 10

# Start frontend (Angular)
echo "Starting Angular frontend on port 3000..."
cd ../frontend
npm install
npm start -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

echo "Services started:"
echo "- Backend: http://[projectid]-8080.localhost"
echo "- Frontend: http://[projectid]-3000.localhost"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID