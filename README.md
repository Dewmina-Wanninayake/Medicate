# Smart Healthcare Platform

This is a polyrepo-style monorepo for a smart healthcare platform.

## Services

- user-identity-service: Authentication, roles, admin
- clinical-medical-service: Doctors, records, AI
- appointment-video-service: Booking, video calls
- transaction-notify-service: Payments, notifications

## Web Client

React-based dashboard.

## Setup

1. Clone the repo
2. Run docker-compose up for local development
3. Deploy using Kubernetes manifests in k8s/

## Deployment

See DOCKER_KUBERNETES_SETUP.md for detailed deployment steps.