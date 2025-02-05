from oven/bun:1.0.30-slim

# add package.json
add package.json package.json

# add top-level modules
add core core
add games games
add web web
add server server

# install dependencies
run bun install

# run the server
cmd [ "bun", "prod" ]
