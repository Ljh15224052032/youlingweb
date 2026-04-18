import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabaseClient';

const useUserStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userInfo: {
        id: null,
        username: '',
        email: '',
        avatar: '👤',
        joinDate: '',
        level: '普通用户',
        points: 0,
        parentInviteCode: '',
        myInviteCode: '',
        binanceUID: '',
        bitgetUID: '',
        wechat: '',
        okxUID: '',
        is_verified: false,
        user_type: '普通用户',
        premium_days: 0,
      },

      logout: () => {
        set({
          isLoggedIn: false,
          userInfo: {
            id: null, username: '', email: '', avatar: '👤',
            joinDate: '', level: '普通用户', points: 0,
            parentInviteCode: '', myInviteCode: '',
            binanceUID: '', bitgetUID: '', wechat: '', okxUID: '',
            is_verified: false, user_type: '普通用户', premium_days: 0,
          }
        });
      },

      updateUserInfo: (newInfo) => {
        set((state) => ({
          userInfo: {
            ...state.userInfo,
            ...newInfo,
            username: newInfo.nickname || state.userInfo.username,
          }
        }));
      },

      fetchUserByUsername: async (username) => {
        if (!username) return null;
        const { data, error } = await supabase
          .from('users')
          .select('id, username, nickname, points, invite_code, parent_invite_code, binance_uid, bg_uid, wechat, okx_uid, created_at, is_verified, user_type, premium_days')
          .eq('username', username)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('获取用户失败:', error);
          return null;
        }
        if (!data) return null;

        const mapped = {
          id: data.id,
          username: data.nickname || data.username || '',
          email: data.username || '',
          avatar: '👤',
          joinDate: (data.created_at || '').split('T')[0] || '',
          level: '普通用户',
          points: typeof data.points === 'number' ? data.points : 0,
          parentInviteCode: data.parent_invite_code || '',
          myInviteCode: data.invite_code || '',
          binanceUID: data.binance_uid || '',
          bitgetUID: data.bg_uid || '',
          wechat: data.wechat || '',
          okxUID: data.okx_uid || '',
          is_verified: data.is_verified === 'true' || data.is_verified === true,
          user_type: data.user_type || '普通用户',
          premium_days: typeof data.premium_days === 'number' ? data.premium_days : 0,
        };

        set({ isLoggedIn: true, userInfo: mapped });
        return mapped;
      },

      updatePoints: (points) => {
        set((state) => ({
          userInfo: { ...state.userInfo, points: state.userInfo.points + points }
        }));
      },

      getUserInfo: () => get().userInfo,
      getLoginStatus: () => get().isLoggedIn,
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userInfo: state.userInfo,
      }),
      migrate: (persistedState, version) => {
        if (persistedState && persistedState.userInfo) {
          return {
            ...persistedState,
            userInfo: {
              ...persistedState.userInfo,
              is_verified: persistedState.userInfo.is_verified !== undefined
                ? persistedState.userInfo.is_verified : false,
              user_type: persistedState.userInfo.user_type || '普通用户',
            }
          };
        }
        return persistedState;
      },
      version: 1,
    }
  )
);

export default useUserStore;
