#0-Get Node 10.22.1 buster image - debug image
FROM node:10.22.1-buster-slim

#1-Set Labels
LABEL package="Cucumber"
LABEL owner=
LABEL description="Runs cucumber tests by Environment, Coin, and Tags environment variables at runtime"

#2-Set workdir
WORKDIR /usr/src/cucumber/testcode

#3-Copy package.json and entrypoint into workdir - test code not being copied in debug image
COPY docker_debug/entrypoint-cucumber.sh .
COPY package*.json .

#4 Update of the OS and installation of some dependencies
RUN apt update && apt install -y git python build-essential pkg-config libsecret-1-0 && apt clean
RUN npm install && mv node_modules /usr/src/cucumber/ && mv entrypoint-cucumber.sh /usr/src/cucumber/

#5-Execute entrypoint
ENTRYPOINT ["/bin/bash", "/usr/src/cucumber/entrypoint-cucumber.sh"]
