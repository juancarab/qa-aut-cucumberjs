#0-Get Node 14.18.2 buster image
FROM node:14.18.2-buster-slim

#1-Set Labels
LABEL package="Cucumber"
LABEL owner="BitGo"
LABEL description="Runs cucumber tests by Environment, and Tags environment variables at runtime"

#2-Set workdir
WORKDIR /usr/src/cucumber

#3-Copy package.json and entrypoint into workdir
COPY package.json .
COPY package-lock.json .

#4 Update of the OS and installation of some dependencies
RUN apt update && apt install -y git python build-essential pkg-config libsecret-1-0 && apt clean
RUN npm install

#5 Copy test code
COPY  . .

#5-Execute entrypoint
ENTRYPOINT ["/bin/bash", "/usr/src/cucumber/entrypoint-cucumber.sh"]
