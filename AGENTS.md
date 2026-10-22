# Cal.com API v2 Monorepo Agents Guide

This repository is a monorepo containing multiple packages.

## Packages

### SDK (@aditzel/caldotcom-api-v2-sdk)
The TypeScript SDK for Cal.com v2 API.
- [SDK Agents Guide](packages/sdk/AGENTS.md)

### MCP Server (@aditzel/caldotcom-mcp-server)
An MCP server implementation for Cal.com.
- [MCP Server README](packages/mcp-server/README.md)

## Contributing

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), as required by the [Project Constitution](packages/sdk/CONSTITUTION.md).
- Pull request titles use the same Conventional Commits format (for example, `fix: handle empty booking lists`).
- When a coding agent authors or co-authors a commit, add a `Co-authored-by:` trailer identifying that agent, for example `Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>`.
