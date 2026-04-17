# Reset local MongoDB and Redis containers, then start the appointment service.
# Usage: .\scripts\reset-infra.ps1

# 1. Kill existing infra containers to clear stale DNS and networking state
docker rm -f mongodb redis 2>$null

# 2. Create the network if it does not already exist
if (-not (docker network ls --format '{{.Name}}' | Select-String -Pattern '^medicate-net$')) {
  docker network create medicate-net | Out-Null
}

# 3. Build the appointment service image
docker build -t appointment-service ./services/appointment-video-service

# 4. Start the infrastructure
docker run -d --name mongodb --network medicate-net mongo:latest
docker run -d --name redis --network medicate-net redis:alpine

# 5. Wait for the network and services to become available
Start-Sleep -Seconds 10

# 6. Run the appointment service
docker run --rm -p 5004:5003 --network medicate-net `
  -e PORT=5003 `
  -e REDIS_HOST=redis `
  -e REDIS_PORT=6379 `
  -e MONGO_URI="mongodb://mongodb:27017/medicate_appointments" `
  appointment-service
