FROM node:14

WORKDIR /app
COPY package.json package-lock.json index.ts tsconfig.json ./

RUN npm install
RUN npm run build
RUN rm *.json *.ts

EXPOSE 8080

CMD [ "node", "index.js" ]