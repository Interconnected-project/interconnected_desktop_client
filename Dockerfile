FROM node:18-slim
WORKDIR /interconnected_desktop_client
COPY package.json .
COPY package-lock.json .
RUN	npm ci --silent
COPY tsconfig.json .
COPY src src
RUN npm run build
CMD npm run start:production