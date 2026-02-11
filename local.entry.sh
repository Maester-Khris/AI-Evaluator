#!/bin/bash

# --- CONFIGURATION: POSTGRES ---
DB_CONTAINER="aievaluator_db"
POSTGRES_USER="admin"
POSTGRES_PASSWORD="securepassword123"
DB_NAME="aievaluator"
DB_PORT=5432

# --- CONFIGURATION: REDIS ---
REDIS_CONTAINER="aievaluator_redis"
REDIS_PASSWORD="redispassword123"
REDIS_PORT=6379
REDIS_UI_PORT=8001 # Access RedisInsight UI here

echo "🚀 Initializing AI Evaluator Infrastructure..."

# 1. Cleanup existing containers
echo "1. Cleaning up existing containers..."
docker rm -f ${DB_CONTAINER} ${REDIS_CONTAINER} 2>/dev/null || true

# 2. Launch Postgres
echo "2. Launching Postgres..."
docker run --name ${DB_CONTAINER} \
  -e POSTGRES_USER=${POSTGRES_USER} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${DB_NAME} \
  -p ${DB_PORT}:5432 \
  -d postgres:15-alpine

# 3. Launch Redis (using redis-stack for stream support and GUI)
echo "3. Launching Redis Stack (Streams/Insight)..."
docker run --name ${REDIS_CONTAINER} \
  -e REDIS_ARGS="--requirepass ${REDIS_PASSWORD}" \
  -p ${REDIS_PORT}:6379 \
  -p ${REDIS_UI_PORT}:8001 \
  -d redis/redis-stack-server:latest

# 4. Wait for Health Checks
echo "4. Waiting for services to be ready..."
until docker exec ${DB_CONTAINER} pg_isready -U ${POSTGRES_USER} > /dev/null 2>&1; do
  sleep 1
done

# 5. Configure Database Privileges
echo "5. Configuring database privileges..."
docker exec -it ${DB_CONTAINER} psql -U ${POSTGRES_USER} -d ${DB_NAME} -c \
"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${POSTGRES_USER};"

# 6. Final Status Message
if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "✅ INFRASTRUCTURE IS READY"
    echo "------------------------------------------------"
    echo "POSTGRES:"
    echo "  Host: localhost:${DB_PORT}"
    echo "  URL:  postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}?schema=public"
    echo ""
    echo "REDIS:"
    echo "  Host: localhost:${REDIS_PORT}"
    echo "  Pass: ${REDIS_PASSWORD}"
    echo "  UI:   http://localhost:${REDIS_UI_PORT} (RedisInsight)"
    echo "------------------------------------------------"
else
    echo "❌ Infrastructure initialization FAILED"
    exit 1
fi