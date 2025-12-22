# Admin Frontend - React + Vite

This is the Admin Panel frontend for the WayTree application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
# For local development
VITE_API_BASE_URL=http://localhost:5000/api

# For production, change to your production API URL:
# VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Development

Run the development server:
```bash
npm run dev
```

## Building for Production

When building for production, make sure to set the correct `VITE_API_BASE_URL` in your `.env` file:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

- `VITE_API_BASE_URL`: The base URL for the backend API (default: `http://localhost:5000/api`)

## Deployment

When deploying to production:
1. Update `.env` with your production API URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting service

The frontend will automatically use the API URL from the environment variable, so you only need to change it in `.env` when deploying.
