FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Reconstruir bycrypt dentro del contenedor
RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 80

CMD ["npm","run","start:prod"]