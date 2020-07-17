FROM node AS webpack
WORKDIR /webpack/
COPY package.json yarn.lock
RUN yarn install --pure-lockfile
COPY . ./
RUN yarn prod

FROM wordpress:php7.1-apache
COPY . /var/www/html/wp-content/plugins/hs-widget/

COPY --from=webpack /webpack/assets/js /var/www/html/wp-content/plugins/hs-widget/assets/js

