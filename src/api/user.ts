import { http } from '@/utils/request'
import type { GetInfo } from '@/types/api/user'

// 获取用户信息
export const getInfo = () => {
	return http.get<GetInfo.Body>('/system/user/getProduceInfo')
}