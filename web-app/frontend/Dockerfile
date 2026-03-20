FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# In production the frontend talks to the backend via nginx reverse proxy
# so the API is at the same origin under /api
ENV VITE_API_URL=/api

RUN npm run build

# --- Serve with nginx ---
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
