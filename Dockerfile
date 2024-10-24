# Use the official Node.js image.
FROM node:18

# Set the working directory in the container.
WORKDIR /app

# Install netcat (use netcat-openbsd instead of netcat).
RUN apt-get update && apt-get install -y netcat-openbsd

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of your application code.
COPY . .

# Build the TypeScript code.
RUN npm run build

# Expose the application port.
EXPOSE 3000 

# Run the application (change from npm test to npm start to run the app).
CMD ["npm", "start"]
