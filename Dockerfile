FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Reconstruir bcrypt dentro del contenedor
RUN npm rebuild bcrypt --build-from-source

COPY . .

CMD ["npm", "run", "start:prod"]


