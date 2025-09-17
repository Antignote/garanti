# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `pnpm run dev`
- **Build for production**: `pnpm run build` (runs TypeScript compilation then Vite build)
- **Lint and format code**: `pnpm run lint` (Biome check)
- **Preview production build**: `pnpm run preview`
- **Package manager**: This project uses pnpm (version 10.15.0)

## Architecture Overview

This is a Swedish lottery guarantee calculator ("Garantiräknaren") that helps users calculate and create guarantee tables for betting systems.

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS v4
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **Code Quality**: Biome (formatting + linting)

### Application Structure

**UI Layout**: Two-column responsive layout
- Left column: System form with input controls for hedges and key rows
- Right column: Table controls and results display

**State Management**: Redux store with three main slices:
- `general`: UI state (hedges, keys, table display options)
- `systems`: Predefined betting systems collection
- `task`: Async task coordination for worker computations

**Worker Architecture**: Heavy computations are offloaded to Web Workers in a three-stage pipeline:
1. **Expounded Keys Worker**: Processes user input key rows
2. **Garanti Worker**: Calculates guarantee rows based on hedges and keys
3. **Table Worker**: Generates formatted HTML table for display

### Key Files
- `src/store.ts`: Redux store configuration and main state reducer
- `src/systems.ts`: Large collection of predefined betting systems (R and U types)
- `src/workers/worker-manager.tsx`: Coordinates the worker pipeline and manages task flow
- `src/types.ts`: TypeScript type definitions for the entire application
- `src/App.tsx`: Main application layout and component composition

### Code Style
- Uses Biome configuration with tab indentation and double quotes
- Non-null assertions are disabled in linter rules
- Organize imports automatically enabled