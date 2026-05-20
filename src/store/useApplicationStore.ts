import { create } from "zustand";
import { Application, Status } from "@/types";

export type SortOption = "date" | "priority" | "salary" | "name";

interface ApplicationStore {
  applications: Application[];
  isLoading: boolean;
  filter: Status | "all";
  search: string;
  sort: SortOption;
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  removeApplication: (id: string) => void;
  setFilter: (filter: Status | "all") => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortOption) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  isLoading: false,
  filter: "all",
  search: "",
  sort: "date",
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
  setSort: (sort) => set({ sort }),
}));
