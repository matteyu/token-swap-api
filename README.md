# Token Swap API

Retrieves a quote and the unsigned transaction for frontends to sign and broadcast.  Retrieval of quotes uses Li.fi API.

## Pre-req
- Node 20+
- Docker (optional)
- Docker Compose (optional)

## Environment Variables
once cloned, create a `.env` file in the root directory of the project.  Take a look at `.env.example` to determine what environment variables are needed.

## Installation
```sh
git clone git@github.com:matteyu/token-swap-api.git
cd token-swap-api
npm install
```

## Installation with Docker (and redis)
```sh
git clone git@github.com:matteyu/token-swap-api.git
cd token-swap-api
docker-compose up -d
```