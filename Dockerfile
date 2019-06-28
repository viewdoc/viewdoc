# For viewdoc/nodejs

FROM node:10.16.0-alpine

RUN apk update && apk upgrade
RUN npm install -g npm

WORKDIR /usr/src/app

ADD . .
RUN npm install && npm run init
