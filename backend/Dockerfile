FROM node:24-alpine
WORKDIR /var/task
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
