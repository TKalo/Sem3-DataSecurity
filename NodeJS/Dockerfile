FROM node:latest

WORKDIR /usr/src/app

COPY ./app .

RUN npm install

RUN npm install crypto

RUN npm install --save validate.js

CMD [ "node", "app.js" ]
