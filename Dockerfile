FROM ruby:3.0.4-alpine

ENV BUNDLER_VERSION=2.0.2

RUN apk add --update --no-cache \
      binutils-gold \
      build-base \
      curl \
      file \
      g++ \
      gcc \
      git \
      less \
      libstdc++ \
      libffi-dev \
      libc-dev \ 
      linux-headers \
      libxml2-dev \
      libxslt-dev \
      libgcrypt-dev \
      make \
      netcat-openbsd \
      nodejs \
      npm \
      openssl \
      pkgconfig \
      postgresql-dev \
      tzdata \
      yarn \
      bash \
      openssh

RUN gem install bundler -v 2.0.2

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN bundle config build.nokogiri --use-system-libraries

RUN bundle check || bundle install 

# get uid/gid
# see https://stackoverflow.com/questions/52196518/could-not-get-uid-gid-when-building-node-docker
RUN npm config set unsafe-perm true

COPY . ./ 

# package-lock.json already exists in container 
# see https://stackoverflow.com/questions/49744843/node-error-npm-err-cb-never-called
RUN rm package-lock.json
