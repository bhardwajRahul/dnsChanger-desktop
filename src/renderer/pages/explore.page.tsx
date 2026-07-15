import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
	IoAddCircleOutline,
	IoReload,
	IoRemoveCircleOutline,
	IoSearch,
} from 'react-icons/io5'

import { Server } from '../../shared/interfaces/server.interface'
import { UrlsConstant } from '../../shared/constants/urls.constant'

import { FiCopy } from 'react-icons/fi'
import { CiCircleMore } from 'react-icons/ci'
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa'
import { getPingIcon } from '../utils/icons.util'
import { TextInput } from '../component/input/text-input'
import { Button } from '../component/button/button'

let STORED_SERVERS: Server[] = []

export function ExplorePage() {
	const [loading, setLoading] = useState(true)

	const [servers, setServers] = useState<Server[]>([])

	const [installedServers, setInstalledServers] = useState<Server[]>([])

	const [search, setSearch] = useState('')

	async function requestHandler(url: string): Promise<Server[]> {
		try {
			const { data } = await axios.get<Server[]>(url)
			return data
		} catch {
			return []
		}
	}

	async function updateServers() {
		let data = await requestHandler(UrlsConstant.STORE_SERVER)

		if (!data.length) {
			data = await requestHandler(UrlsConstant.STORE)
		}

		const result = await Promise.all(
			data.map(async (server) => {
				const response = await window.ipc.ping(server)

				server.ping = Number(response.data.time) || -1

				return server
			})
		)

		result.sort((a, b) => (a.ping === -1 ? 1 : b.ping === -1 ? -1 : a.ping - b.ping))

		STORED_SERVERS = result

		setServers(result)
	}

	async function fetchDnsList() {
		try {
			setLoading(true)

			setServers([])

			const response = await window.ipc.fetchDnsList()

			setInstalledServers(response.servers)

			await updateServers()
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchDnsList()
	}, [])

	const filteredServers = useMemo(() => {
		if (!search.trim()) {
			return servers
		}

		const keyword = search.toLowerCase()

		return servers.filter((server) => {
			return (
				server.name.toLowerCase().includes(keyword) ||
				server.tags.some((tag) => tag.toLowerCase().includes(keyword))
			)
		})
	}, [servers, search])

	return (
		<div className="flex flex-col h-96">
			<div className="px-5 py-2 border-b border-base-300">
				<div className="flex items-center gap-3 ">
					<div className="flex-1">
						<label className="flex items-center gap-2 input input-bordered">
							<IoSearch size={18} className="opacity-60" />

							<TextInput
								type="text"
								className="grow"
								placeholder="Search DNS..."
								value={search}
								onChange={(value) => setSearch(value)}
								disabled={loading}
							/>
						</label>
					</div>

					<Button
						size="sm"
						className="btn-ghost"
						loading={loading}
						onClick={fetchDnsList}
					>
						<IoReload size={18} />
					</Button>
				</div>

				<div className="flex items-center justify-between mt-3 text-sm text-base-content/60">
					<span>{filteredServers.length} DNS Servers</span>

					{search && <span>Filtered from {STORED_SERVERS.length}</span>}
				</div>
			</div>

			<div className="flex-1 px-5 py-2 overflow-auto">
				<div className="flex flex-col gap-1">
					{loading &&
						Array.from({
							length: 5,
						}).map((_, index) => (
							<div key={index} className="h-14 skeleton rounded-2xl " />
						))}

					{!loading && filteredServers.length === 0 && (
						<div className="py-10 text-center border rounded-2xl border-base-300 bg-base-200">
							<h2 className="font-medium">No DNS Servers</h2>

							<p className="mt-1 text-sm text-base-content/60">
								No server matches your search.
							</p>
						</div>
					)}

					{!loading &&
						filteredServers.map((server) => (
							<ServerCard
								key={server.key}
								server={server}
								storeServers={installedServers}
								setStoreServers={setInstalledServers}
							/>
						))}
				</div>
			</div>
		</div>
	)
}

// ===== Continue in Part 2 =====
interface ServerCardProps {
	server: Server
	storeServers: Server[]
	setStoreServers: React.Dispatch<React.SetStateAction<Server[]>>
}

export function ServerCard({ server, storeServers, setStoreServers }: ServerCardProps) {
	const { avatar, name, key, tags, servers, rate, ping } = server

	const [menuOpen, setMenuOpen] = useState(false)

	const isInstalled = storeServers.some((item) => item.key === key)

	async function addHandler() {
		const response = await window.ipc.addDns(server)
		if (response.success) {
			setStoreServers(response.servers)
		}
	}

	async function deleteHandler() {
		const response = await window.ipc.deleteDns(server)
		if (response.success) {
			setStoreServers(response.servers)
		}
	}

	function renderRating(value: number) {
		const rating = value / 2
		const full = Math.floor(rating)
		const half = rating - full >= 0.5
		const stars = []

		for (let i = 0; i < 5; i++) {
			if (i < full) {
				stars.push(<FaStar key={i} className="text-yellow-400" size={12} />)
			} else if (i === full && half) {
				stars.push(
					<FaStarHalfAlt key={i} className="text-yellow-400" size={12} />
				)
			} else {
				stars.push(
					<FaRegStar
						key={i}
						className="text-gray-300 dark:text-gray-600"
						size={12}
					/>
				)
			}
		}
		return stars
	}

	return (
		<div className="relative transition-all duration-200 border group rounded-xl bg-base-200 border-base-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5">
			<div className="p-3">
				<div className="flex items-center gap-3">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 overflow-hidden bg-gray-100 rounded-lg ">
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
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
								{name}
							</h3>

							<div className="flex flex-wrap flex-shrink-0 gap-1">
								{tags.slice(0, 3).map((tag) => (
									<span
										key={tag}
										className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap"
									>
										{tag}
									</span>
								))}
								{tags.length > 3 && (
									<span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
										+{tags.length - 3}
									</span>
								)}
							</div>

							{/* Ping - عقب تر */}
							<div className="flex items-center flex-shrink-0 gap-1 ml-auto">
								<span className="flex-shrink-0">{getPingIcon(ping)}</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									{ping === -1 ? 'N/A' : `${ping}ms`}
								</span>
							</div>

							{/* Menu Button */}
							<button
								onClick={() => setMenuOpen(!menuOpen)}
								className="flex-shrink-0 p-1 text-gray-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
							>
								<CiCircleMore size={18} />
							</button>
						</div>

						{/* Footer - ریتینگ و دکمه Add/Remove */}
						<div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700/50">
							<div className="flex items-center gap-1">
								{renderRating(rate)}
							</div>

							<button
								onClick={isInstalled ? deleteHandler : addHandler}
								className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-lg transition-all ${
									isInstalled
										? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
										: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
								}`}
							>
								{isInstalled ? (
									<IoRemoveCircleOutline size={14} />
								) : (
									<IoAddCircleOutline size={14} />
								)}
								{isInstalled ? 'Remove' : 'Add'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Dropdown Menu */}
			{menuOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setMenuOpen(false)}
					/>
					<div className="absolute right-2 top-11 z-20 w-64 p-2 bg-white dark:bg-[#272727] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
						{/* Copy DNS */}
						<button
							onClick={() => {
								navigator.clipboard.writeText(servers.join(', '))
								setMenuOpen(false)
							}}
							className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<FiCopy size={15} className="flex-shrink-0" />
							<span>Copy DNS Addresses</span>
						</button>

						{/* DNS Servers List */}
						<div className="px-3 py-2 mt-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<div className="text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">
								DNS Servers
							</div>
							<div className="mt-1 space-y-0.5">
								{servers.map((address) => (
									<div
										key={address}
										className="font-mono text-xs text-gray-600 truncate dark:text-gray-300"
									>
										{address}
									</div>
								))}
							</div>
						</div>

						{/* Rating */}
						<div className="flex items-center justify-between px-3 py-2 mt-2">
							<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
								Rating
							</span>
							<div className="flex items-center gap-1.5">
								<div className="flex items-center gap-0.5">
									{renderRating(rate)}
								</div>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									{(rate / 2).toFixed(1)}
								</span>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
