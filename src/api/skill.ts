import { http } from '@/utils/request'

export type SkillListQuery = {
	page?: number
	pageSize?: number
	sort?: 'recommend' | 'newest' | 'mostCopy' | 'lowestToken' | 'bestValue' | 'highRate'
	scene?: string
	categoryId?: number
	creatorId?: number
	keyword?: string
	tag?: string
	minSuccessRate?: number
	maxAvgTotalTokens?: number
}

export type CreateSkillPayload = {
	title: string
	brief?: string | null
	categoryId?: number | null
	scene?: string | null
	status?: 0 | 1 | 2
	tags?: string[]

	prompt?: string | null
	systemPrompt?: string | null
	userTemplate?: string | null
	fullPrompt?: string | null
	fullPromptHtml?: string | null
	variableNotes?: string | null
	variables?: Array<{ name: string; desc?: string | null }>
	steps?: string[]
	useScenes?: string[]

	coverImages?: string[]
	contentImages?: string[]

	recommendedModelName?: string | null
	commonModelName?: string | null
}

export const getSkillList = (params: SkillListQuery) => {
	return http.get<any>('/skills', params)
}

export const getSkillDetail = (id: string | number) => {
	return http.get<any>(`/skills/${id}`)
}

export const createSkill = (data: CreateSkillPayload) => {
	return http.post<{ id: number }>('/skills', data)
}

export const updateSkill = (id: string | number, data: Partial<CreateSkillPayload>) => {
	return http.put<{ id: number }>(`/skills/${id}`, data)
}

export const favoriteSkill = (id: string | number) => {
	return http.post<any>(`/skills/${id}/favorite`)
}

export const unfavoriteSkill = (id: string | number) => {
	return http.delete<any>(`/skills/${id}/favorite`)
}

export const copySkill = (
	id: string | number,
	data?: {
		sourceChannel?: string
		copiedTextHash?: string
		usage?: {
			modelName: string
			inputTokens?: number | null
			outputTokens?: number | null
			totalTokens?: number | null
			costAmount?: number | null
			currency?: string
			reaction?: 'worth' | 'ok' | 'regret' | 'addicted' | null
			noteText?: string | null
			images?: string[]
		}
	}
) => {
	return http.post<any>(`/skills/${id}/copies`, data || {})
}

export const createSkillFeedback = (
	id: string | number,
	data: {
		status: 'success' | 'normal' | 'fail'
		comment: string
		usageRecordId?: number | null
		modelName?: string | null
		inputTokens?: number | null
		outputTokens?: number | null
		totalTokens?: number | null
		costAmount?: number | null
		isPublic?: boolean
	}
) => {
	return http.post<any>(`/skills/${id}/feedbacks`, data)
}

export const getSkillFeedbacks = (id: string | number, params?: { page?: number; pageSize?: number }) => {
	return http.get<any>(`/skills/${id}/feedbacks`, params)
}

export const getSkillCategories = () => {
	return http.get<Array<{ id: number; name: string; sortNo: number }>>('/skills/meta/categories')
}

export const getSkillTags = (params?: { keyword?: string; pageSize?: number }) => {
	return http.get<Array<{ id: number; name: string; useCount: number }>>('/skills/meta/tags', params)
}

export const getTrends = (params?: { days?: number }) => {
	return http.get<any>('/stats/trends', params)
}
