# piggo-gg/games Development Guidelines

## Build Commands
- `bun dev` - Start development server

## Code Style
- **TypeScript**: Use strict typing with interfaces or type aliases
- **Imports**: Group imports by source (core first, then local files)
- **Naming**: PascalCase for types, classes, interfaces; camelCase for variables, functions
- **Type Definitions**: Define game state types with explicit fields
- **Component Pattern**: Follow entity-component system architecture
- **System Builder**: Use SystemBuilder for game logic
- **Error Handling**: Null checks with early returns (`if (!x) return`)
- **Game Structure**: Export a GameBuilder object with id, init, systems, and entities

## Architecture
- Games export a GameBuilder with initialization logic
- Systems handle gameplay mechanics and entity management
- Entities define game objects with components
- Use @piggo-gg/core for common components and systems

## Best Practices
- Use Position type for spatial information
- Follow netcode conventions ("rollback" or "delay")
- Keep game initialization clean and declarative
