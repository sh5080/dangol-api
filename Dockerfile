FROM public.ecr.aws/docker/library/node:22-bullseye-slim AS build
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn db:gen
RUN yarn build

EXPOSE 8082
CMD ["node", "dist/src/main.js"]