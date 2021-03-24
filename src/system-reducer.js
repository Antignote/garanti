import { createReducer } from '@reduxjs/toolkit';
import { systems } from './systems.js';

export const systemsReducer = createReducer(systems, () => {});
