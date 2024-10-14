import { create } from 'zustand';

const useStore = create((set) => ({
  isUserLoggedIn: false,
  userId: '', 
  userMediaData: [],
  updateUserLoggedInStatus: () =>
    set((state: any) => ({ isUserLoggedIn: !state.isUserLoggedIn })),
  updateUserMediaData: (userdata: any[]) =>
    set((state: any) => ({
      userMediaData: [...userdata],
    })),
  updateUserId: (useridd: string) => 
    set((state: any) => ({ userId: useridd })), 
}));

export default useStore;
