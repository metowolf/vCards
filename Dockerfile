FROM node as builder

COPY . /app
WORKDIR /app
RUN yarn && yarn radicale


FROM alpine

RUN apk add --no-cache \
    radicale \
  && rm -rf /var/cache/apk/* \
  \
  && { \
    echo '[root]'; \
    echo 'user: .+'; \
    echo 'collection:'; \
    echo 'permissions: R'; \
    echo; \
    echo '[principal]'; \
    echo 'user: .+'; \
    echo 'collection: {user}'; \
    echo 'permissions: R'; \
    echo; \
    echo '[collections]'; \
    echo 'user: .+'; \
    echo 'collection: {user}/[^/]+'; \
    echo 'permissions: rR'; \
  } > /etc/radicale/rights \
  \
  && { \
    echo '[server]'; \
    echo 'hosts = 0.0.0.0:5232, [::]:5232'; \
    echo; \
    echo '[web]'; \
    echo 'type = none'; \
    echo; \
    echo '[storage]'; \
    echo 'type = multifilesystem'; \
    echo 'filesystem_folder = /app/vcards'; \
    echo; \
    echo '[rights]'; \
    echo 'type = from_file'; \
    echo 'file = /etc/radicale/rights'; \
  } > /etc/radicale/config

COPY --from=builder /app/radicale/ /app/vcards/collection-root/cn/

EXPOSE 5232

CMD ["radicale"]