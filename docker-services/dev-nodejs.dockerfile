# This is a universal Docker image to run all nodejs applications of this project in development.

FROM node:10.16.0-alpine

RUN apk update && apk upgrade
RUN npm install -g npm

# Install calibre https://github.com/kovidgoyal/calibre, used for exporter app
# This section is inspired from https://github.com/ljnelson/docker-calibre-alpine

ENV GLIBC_VERSION 2.26-r0
ENV LD_LIBRARY_PATH $LD_LIBRARY_PATH:/opt/calibre/lib
ENV PATH $PATH:/opt/calibre/bin
ENV CALIBRE_INSTALLER_SOURCE_CODE_URL https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py

RUN apk add --update bash ca-certificates gcc mesa-gl python qt5-qtbase-x11 wget xdg-utils xz libxcomposite-dev

RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
  wget -q -O glibc.apk "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk" && \
  wget -q -O glibc-bin.apk "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-bin-${GLIBC_VERSION}.apk"
RUN apk add glibc-bin.apk glibc.apk
RUN /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc-compat/lib && \
  echo "hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4" >> /etc/nsswitch.conf && \
  rm -rf glibc.apk glibc-bin.apk /var/cache/apk/*

RUN wget -O- ${CALIBRE_INSTALLER_SOURCE_CODE_URL} | python -c "import sys; main=lambda:sys.stderr.write('Download failed\n'); exec(sys.stdin.read()); main(install_dir='/opt', isolated=True)" && \
  rm -rf /tmp/calibre-installer-cache

# Install dependencies

WORKDIR /usr/src/app

ADD . .
RUN npm install && npm run init
