FROM node:18-alpine

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# serve via a lightweight server
RUN yarn global add serve
CMD ["serve", "-s", "build", "-l", "3000"]
