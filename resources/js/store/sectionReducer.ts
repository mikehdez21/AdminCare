// store/sectionReducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SectionState {
  selectedSection: string;
}

// Estado inicial con una sección por defecto
const initialState: SectionState = {
  selectedSection: '', // Default section
};

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    setSelectedSection(state, action: PayloadAction<string>) {
      state.selectedSection = action.payload;
    },

  },
});

export const { setSelectedSection, } = sectionSlice.actions;
export default sectionSlice.reducer;
