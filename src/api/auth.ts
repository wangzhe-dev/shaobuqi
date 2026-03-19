import { http } from '@/utils/request'

export const passwordLogin = (data: { identifier: string; password: string }) => {
	return http.post<{ token: string; user: any }>('/auth/login/password', data)
}
