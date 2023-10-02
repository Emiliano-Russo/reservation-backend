# Stage 1: Build the Node.js application
FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Rebuild bcrypt inside the container if needed
RUN npm rebuild bcrypt --build-from-source

COPY . .

# Build your Node.js application (replace this with your actual build command)
RUN npm run build

# Stage 2: Create the Nginx stage
FROM nginx:latest

# Copy the built application from the previous stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port 80 (the default port for Nginx)
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]


