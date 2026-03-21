import { http } from '@/utils/request'

export const getMyProfile = () => {
	return http.get<any>('/me/profile')
}

export const updateMyAvatar = (avatarUrl: string) => {
	return http.put<{ avatarUrl: string }>('/me/avatar', { avatarUrl })
}

export const getMySkills = (params?: { page?: number; pageSize?: number; status?: number }) => {
	return http.get<any>('/me/skills', params)
}

export const getMyFavorites = (params?: { page?: number; pageSize?: number }) => {
	return http.get<any>('/me/favorites', params)
}

export const getMyCopies = (params?: { page?: number; pageSize?: number }) => {
	return http.get<any>('/me/copies', params)
}

export const getMyLikes = (params?: { page?: number; pageSize?: number }) => {
	return http.get<any>('/me/likes', params)
}
