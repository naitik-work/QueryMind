import { createSlice } from "@reduxjs/toolkit";

const memorySlice = createSlice({
    name: "memory",
    initialState: {
        memories: [],
        loading: false,
        error: null,
        panelOpen: false,
    },
    reducers: {
        setMemories: (state, action) => {
            state.memories = action.payload;
        },
        removeMemory: (state, action) => {
            state.memories = state.memories.filter(m => m._id !== action.payload);
        },
        clearMemories: (state) => {
            state.memories = [];
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setPanelOpen: (state, action) => {
            state.panelOpen = action.payload;
        },
    },
});

export const {
    setMemories, removeMemory, clearMemories,
    setLoading, setError, setPanelOpen,
} = memorySlice.actions;

export default memorySlice.reducer;
