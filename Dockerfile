FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./

EXPOSE 9292
CMD ["npm", "run", "dev"]

