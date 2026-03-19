import { http } from '@/utils/request'

export const getDraftList = (params?: { page?: number; pageSize?: number; status?: number }) => {
	return http.get<any>('/drafts', params)
}

export const getDraftDetail = (id: string | number) => {
	return http.get<any>(`/drafts/${id}`)
}

export const saveDraft = (data: any) => {
	return http.post<any>('/drafts/save', data)
}

export const deleteDraft = (id: string | number) => {
	return http.delete<any>(`/drafts/${id}`)
}
