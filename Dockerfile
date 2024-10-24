FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000 

CMD ["npm", "start"]
