FROM ruby:2.6.3-alpine

RUN apk update && apk upgrade && apk add --update perl make gcc g++ libc-dev py-pip
RUN pip install docutils

WORKDIR /usr/src/app

ADD . .
RUN bundle install

EXPOSE 4100
ENTRYPOINT ["bundle", "exec", "rackup", "-o", "0.0.0.0", "-p", "4100"]
