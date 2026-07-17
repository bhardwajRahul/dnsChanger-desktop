import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { UrlsConstant } from '../../shared/constants/urls.constant'
import type { Server } from '../../shared/interfaces/server.interface'

export function useGetDnsList() {
	return useQuery({
		queryKey: ['fetch-dns-list'],
		queryFn: async () => {
			const response = await axios.get<Server[]>(UrlsConstant.STORE, {
				timeout: 10_000,
			})

			return response.data
		},
		gcTime: 1000 * 60 * 5, // 5 minutes
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
		refetchOnWindowFocus: false,
		placeholderData: (previousData) => previousData,
	})
}
