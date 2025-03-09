# Use the official Node.js image from the Docker Hub
FROM node:16.20.0

# Create and change to the app directory
WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/data && chmod -R 777 /usr/src/app/data

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the app source code
COPY . .

# Expose the port the app runs on
EXPOSE 7580

# Start the app
CMD ["node", "server.js"]
