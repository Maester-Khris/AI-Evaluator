#!/bin/bash

# Configuration
CONTAINER_NAME="aievaluator_db"
POSTGRES_USER="admin"
POSTGRES_PASSWORD="securepassword123"
DB_NAME="aievaluator"
PORT=5432

echo "1.Initializing AI Evaluator Database..."

# 1. Check if container already exists and remove it
if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo "🔄 Cleaning up existing container..."
    docker rm -f ${CONTAINER_NAME}
fi

# 2. Launch Postgres Container
# We use the standard postgres image which includes GIN/GIST support by default
docker run --name ${CONTAINER_NAME} \
  -e POSTGRES_USER=${POSTGRES_USER} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${DB_NAME} \
  -p ${PORT}:5432 \
  -d postgres:15-alpine

echo "2.Waiting for Postgres to start..."
until docker exec ${CONTAINER_NAME} pg_isready -U ${POSTGRES_USER} > /dev/null 2>&1; do
  sleep 1
done

# 3. Grant Administrator Privileges
# While the POSTGRES_USER is already a superuser, we ensure full privileges
# on the specific database for safety.
echo "3.Configuring database user and privileges..."
docker exec -it ${CONTAINER_NAME} psql -U ${POSTGRES_USER} -d ${DB_NAME} -c \
"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${POSTGRES_USER};"

# 4. Status Message
if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "STATUS: Database is READY"
    echo "Host: localhost"
    echo "Port: ${PORT}"
    echo "User: ${POSTGRES_USER}"
    echo "DB Name: ${DB_NAME}"
    echo "------------------------------------------------"
    echo "To connect via Prisma, use:"
    echo "DATABASE_URL=\"postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PORT}/${DB_NAME}?schema=public\""
else
    echo "STATUS: Database initialization FAILED"
    exit 1
fi