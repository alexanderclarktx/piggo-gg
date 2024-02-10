FROM oven/bun

ADD package.json package.json
ADD web web
ADD server server
ADD modules modules

RUN bun install

CMD [ "bun", "start" ]
