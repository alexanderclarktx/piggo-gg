from oven/bun:1.2.11-slim

# add package.json
add package.json package.json

# add top-level modules
add core core
add games games
add web web
add server server

# install dependencies
run bun install --production

# run the server
cmd [ "bun", "prod" ]
