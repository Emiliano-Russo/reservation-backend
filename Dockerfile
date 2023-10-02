FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Reconstruir bcrypt dentro del contenedor
RUN npm rebuild bcrypt --build-from-source

COPY --from=0

EXPOSE 3000

CMD ["npm", "run", "start:prod"]


