import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Server } from '../../shared/interfaces/server.interface'
import { UrlsConstant } from '../../shared/constants/urls.constant'
import { Badge, Button } from 'react-daisyui'
import { getPingIcon } from '../utils/icons.util'
import { CiCircleMore } from 'react-icons/ci'
import {
	IoRemoveCircleOutline,
	IoAddCircleOutline,
	IoReload,
} from 'react-icons/io5'
import { FiCopy } from 'react-icons/fi'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

let STORED_SERVERS: Server[] = []

export function ExplorePage() {
	const TABLE_HEAD = ['Name', 'Tags', 'Ping', 'Options']
	const [loading, setLoading] = useState<boolean>(true)
	const [TABLE_ROWS, SetTableRow] = useState<Server[]>([])
	const [storeServers, setStoreServers] = useState<Server[]>([])
	const [searchTerm, setSearchTerm] = useState<string>('')

	const requestHandler = async (url: string): Promise<Server[]> => {
		try {
			const res = await axios.get<Server[]>(url)
			return res.data
		} catch (err) {
			return []
		}
	}

	const updateHandler = async () => {
		let data = await requestHandler(UrlsConstant.STORE_SERVER)
		if (data.length === 0) {
			data = await requestHandler(UrlsConstant.STORE)
		}

		const servers: Server[] = await Promise.all(
			data.map(async (server) => {
				const res = await window.ipc.ping(server)
				server.ping = Number(res.data.time) || -1
				return server
			}),
		)

		servers.sort((a, b) =>
			a.ping === -1 ? 1 : b.ping === -1 ? -1 : a.ping - b.ping,
		)
		SetTableRow(servers)
		STORED_SERVERS = servers
	}

	const fetchDnsList = async () => {
		try {
			SetTableRow([])
			setLoading(true)
			const response = await window.ipc.fetchDnsList()
			setStoreServers(response.servers)
			await updateHandler()
		} catch (error) {
			console.error('Failed to fetch DNS list:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchDnsList()
	}, [])

	const onSearchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setSearchTerm(value)
		
		if (value === '') {
			SetTableRow(STORED_SERVERS)
			return
		}
		
		const filtered = STORED_SERVERS.filter((server) => {
			const regex = new RegExp(value, 'i')
			return server.name.toLowerCase().match(regex) || 
				   server.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
		})

		SetTableRow(filtered)
	}

	const clearSearch = () => {
		setSearchTerm('')
		SetTableRow(STORED_SERVERS)
	}

	return (
		<div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white dark:bg-[#262626] rounded-xl shadow-lg overflow-hidden">
					{/* Header with Search and Controls */}
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
							<div className="relative flex-1 w-full">
								<input
									type="text"
									placeholder="Search DNS servers..."
									className="w-full px-4 py-2 pl-10 pr-10 transition-all bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
									value={searchTerm}
									onChange={onSearchHandler}
									disabled={loading}
								/>
								<svg
									className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								{searchTerm && (
									<button
										onClick={clearSearch}
										className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								)}
							</div>
							<div className="flex items-center gap-2">
								{loading && (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
										<span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
									</div>
								)}
								<button
									onClick={() => fetchDnsList()}
									disabled={loading}
									className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
								>
									<IoReload
										size={20}
										className={`dark:text-gray-400 text-gray-600 ${loading ? 'animate-spin' : ''}`}
									/>
								</button>
							</div>
						</div>
					</div>

					{/* Table */}
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-800/50">
								<tr>
									{TABLE_HEAD.map((head) => (
										<th key={head} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
											{head}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{TABLE_ROWS.length === 0 && !loading ? (
									<tr>
										<td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
											{searchTerm ? 'No DNS servers found matching your search' : 'No DNS servers available'}
										</td>
									</tr>
								) : (
									TABLE_ROWS.map((server) => (
										<ServerTrComponent
											key={server.key}
											server={server}
											storeServers={storeServers}
											setStoreServer={setStoreServers}
										/>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Footer with count */}
					<div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
						<div className="text-sm text-gray-500 dark:text-gray-400">
							Showing {TABLE_ROWS.length} DNS servers
							{searchTerm && ` (filtered from ${STORED_SERVERS.length} total)`}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

interface Prop {
	server: Server
	storeServers: Server[]
	setStoreServer: any
}

function ServerTrComponent(prop: Prop) {
	const { avatar, name, key, servers, tags, rate } = prop.server
	const ping = prop.server.ping
	const storeServers = prop.storeServers
	const ratingValue = Number((rate / 2).toFixed())
	const [isPopoverOpen, setIsPopoverOpen] = useState(false)

	async function DeleteHandler() {
		const response = await window.ipc.deleteDns(prop.server)
		if (response.success) {
			prop.setStoreServer(response.servers)
		}
	}

	async function AddToListHandler() {
		const response = await window.ipc.addDns(prop.server)
		if (response.success) {
			prop.setStoreServer(response.servers)
		}
	}

	const isInStore = storeServers.some((ser) => ser.key === key)

	// Rating stars renderer
	const renderRating = (value: number) => {
		const stars = []
		const fullStars = Math.floor(value)
		const hasHalfStar = value % 1 >= 0.5

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(<FaStar key={i} className="text-yellow-400" />)
			} else if (i === fullStars && hasHalfStar) {
				stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
			} else {
				stars.push(<FaRegStar key={i} className="text-yellow-400" />)
			}
		}
		return stars
	}

	return (
		<tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
			<td className="px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
						<img
							src={`./servers-icon/${avatar}`}
							alt={name}
							className="object-cover w-full h-full"
							onError={({ currentTarget }) => {
								currentTarget.onerror = null
								currentTarget.src = './servers-icon/def.png'
							}}
						/>
					</div>
					<div className="min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
							{name}
						</p>
					</div>
				</div>
			</td>

			<td className="px-6 py-4">
				<div className="flex flex-wrap gap-1 overflow-y-auto max-h-12">
					{tags.map((tag, index) => (
						<Badge
							key={index}
							size="xs"
							className="text-xs text-gray-600 bg-gray-100 border border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700"
							variant="outline"
						>
							{tag}
						</Badge>
					))}
				</div>
			</td>

			<td className="px-6 py-4">
				<div className="flex items-center gap-2">
					<span className="flex-shrink-0">{getPingIcon(ping)}</span>
					<span className="text-sm text-gray-700 dark:text-gray-300">
						{!Number(ping) ? -1 : ping}
					</span>
				</div>
			</td>

			<td className="px-6 py-4">
				<div className="flex items-center gap-2">
					<button
						onClick={isInStore ? DeleteHandler : AddToListHandler}
						className={`p-1.5 rounded-full transition-all ${
							isInStore
								? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
								: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
						}`}
						title={isInStore ? 'Remove from list' : 'Add to list'}
					>
						{isInStore ? (
							<IoRemoveCircleOutline size={18} />
						) : (
							<IoAddCircleOutline size={18} />
						)}
					</button>

					{/* Custom Popover */}
					<div className="relative">
						<button
							onClick={() => setIsPopoverOpen(!isPopoverOpen)}
							className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
						>
							<CiCircleMore size={18} />
						</button>

						{isPopoverOpen && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setIsPopoverOpen(false)}
								/>
								<div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#272727] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-2">
									{/* Copy servers */}
									<button
										onClick={() => {
											navigator.clipboard.writeText(servers.join(','))
											setIsPopoverOpen(false)
										}}
										className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
									>
										<FiCopy className="flex-shrink-0" />
										<span className="truncate">{servers.join(' , ')}</span>
									</button>

									{/* Rating */}
									<div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
										<span className="text-xs font-medium">Rating</span>
										<div className="flex gap-0.5">
											{renderRating(ratingValue)}
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</td>
		</tr>
	)
}