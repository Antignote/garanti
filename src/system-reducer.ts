import { createReducer } from "@reduxjs/toolkit";
import { systems } from "./systems.js";
import type { Systems } from "./types.js";

export const systemsReducer = createReducer<Systems>(systems, () => {});
