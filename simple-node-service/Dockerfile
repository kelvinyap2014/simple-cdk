FROM node:14

WORKDIR /app
COPY package.json package-lock.json index.ts tsconfig.json ./

RUN npm install
RUN npm run build

EXPOSE 8080

CMD [ "node", "index.js" ]