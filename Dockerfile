FROM node:25.0.0-alpine

WORKDIR /app

COPY . .

# Install packages
COPY package*.json ./
RUN npm install

# Build
RUN npm run build

# Run the app
CMD [ "npm", "run", "start" ]