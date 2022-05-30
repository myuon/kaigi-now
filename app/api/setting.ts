export interface UserSetting {
  calendarIds?: string[];
  refreshToken?: string;
}

export const userSettingApi = {
  get: async (userId: string): Promise<UserSetting | undefined> => {
    const value = await SETTINGS.get(userId);
    return value ? JSON.parse(value) : undefined;
  },
  set: async (userId: string, value: UserSetting): Promise<void> => {
    return await SETTINGS.put(userId, JSON.stringify(value));
  },
};
