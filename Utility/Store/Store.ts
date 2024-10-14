import { create } from 'zustand';

interface StoreState {
  isUserLoggedIn: boolean;
  userId: string;
  userMediaData: any[]; // Consider replacing 'any' with a more specific type if possible
  updateUserLoggedInStatus: () => void;
  updateUserMediaData: (userdata: any[]) => void; // Consider replacing 'any' with a more specific type if possible
  updateUserId: (userId: string) => void;
}

const useStore = create<StoreState>((set) => ({
  isUserLoggedIn: false,
  userId: '',
  userMediaData: [],
  updateUserLoggedInStatus: () =>
    set((state) => ({ isUserLoggedIn: !state.isUserLoggedIn })),
  updateUserMediaData: (userdata) =>
    set(() => ({
      userMediaData: [...userdata],
    })),
  updateUserId: (userId) =>
    set(() => ({ userId })),
}));

export default useStore;