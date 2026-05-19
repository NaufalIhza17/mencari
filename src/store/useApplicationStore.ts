import { create } from "zustand";
import { Application, Status } from "@/types";

interface ApplicationStore {
  applications: Application[];
  isLoading: boolean;
  filter: Status | "all";
  search: string;
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  removeApplication: (id: string) => void;
  setFilter: (filter: Status | "all") => void;
  setSearch: (search: string) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  isLoading: false,
  filter: "all",
  search: "",
  setApplications: (apps) => set({ applications: apps }),
  addApplication: (app) =>
    set((state) => ({ applications: [app, ...state.applications] })),
  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app,
      ),
    })),
  removeApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
    })),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
}));
