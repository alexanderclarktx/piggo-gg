from oven/bun:1.2.15-slim

# openssl for postgres
run apt-get update -y && apt-get install -y openssl

# add package.json
add package.json package.json

# add top-level modules
add core core
add web web
add server server

# install dependencies
run bun install --production

# run the server
cmd [ "bun", "prod" ]
