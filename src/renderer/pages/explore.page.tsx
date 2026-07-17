import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	IoAddCircleOutline,
	IoAlertCircleOutline,
	IoCheckmarkCircleOutline,
	IoCloseCircle,
	IoReload,
	IoRemoveCircleOutline,
	IoSearch,
} from 'react-icons/io5'

import type { Server } from '../../shared/interfaces/server.interface'

import { FiCopy } from 'react-icons/fi'
import { CiCircleMore } from 'react-icons/ci'
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa'
import { getPingIcon } from '../utils/icons.util'
import { TextInput } from '../component/input/text-input'
import { Button } from '../component/button/button'
import { BenchmarkDnsButtonComponent } from '../component/buttons/benchmark-dns-btn.component'
import { useGetDnsList } from '../hook/fetch-dns'

const PING_CACHE_TTL = 60 * 1000

type PingCacheEntry = { ping: number; timestamp: number }

export function ExplorePage() {
	const [servers, setServers] = useState<Server[]>([])
	const [installedServers, setInstalledServers] = useState<Server[]>([])
	const [search, setSearch] = useState('')
	const [isPinging, setIsPinging] = useState(false)
	const [loadError, setLoadError] = useState<string | null>(null)

	const {
		data: fetchedDnsList,
		refetch,
		isLoading: isListLoading,
		isFetching: isListFetching,
		isError: isListError,
	} = useGetDnsList()

	const pingCache = useRef<Map<string, PingCacheEntry>>(new Map())

	const requestIdRef = useRef(0)

	const pingServer = useCallback(async (server: Server): Promise<Server> => {
		const cached = pingCache.current.get(server.key)
		const now = Date.now()

		if (cached && now - cached.timestamp < PING_CACHE_TTL) {
			return { ...server, ping: cached.ping }
		}

		try {
			const response = await window.ipc.ping(server)
			const ping = Number(response?.data?.time) || -1

			pingCache.current.set(server.key, { ping, timestamp: now })

			return { ...server, ping }
		} catch {
			pingCache.current.set(server.key, { ping: -1, timestamp: now })

			return { ...server, ping: -1 }
		}
	}, [])

	const updateServers = useCallback(
		async (list: Server[], requestId: number) => {
			setIsPinging(true)

			try {
				const result = await Promise.all(list.map((server) => pingServer(server)))

				if (requestId !== requestIdRef.current) return

				result.sort((a, b) =>
					a.ping === -1 ? 1 : b.ping === -1 ? -1 : a.ping - b.ping
				)

				setServers(result)
			} finally {
				if (requestId === requestIdRef.current) setIsPinging(false)
			}
		},
		[pingServer]
	)

	const fetchCurrentDnsList = useCallback(
		async (list: Server[]) => {
			const requestId = ++requestIdRef.current
			setLoadError(null)

			try {
				const response = await window.ipc.fetchDnsList()

				if (requestId !== requestIdRef.current) return

				setInstalledServers(response.servers)
				await updateServers(list, requestId)
			} catch {
				if (requestId === requestIdRef.current) {
					setLoadError('Failed to retrieve the list of installed servers.')
				}
			}
		},
		[updateServers]
	)

	useEffect(() => {
		if (!fetchedDnsList) return

		if (fetchedDnsList.length > 0) {
			fetchCurrentDnsList(fetchedDnsList)
		} else {
			setServers([])
		}
	}, [fetchedDnsList, fetchCurrentDnsList])

	const isInitialLoading = isListLoading && servers.length === 0
	const isBackgroundRefreshing = (isListFetching || isPinging) && !isInitialLoading

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
				<div className="flex items-center justify-between gap-3">
					<div className="relative flex-1">
						<IoSearch
							size={15}
							className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-base-content/40"
						/>
						<TextInput
							type="text"
							className="pl-8 pr-8"
							placeholder="Search DNS..."
							value={search}
							onChange={(value) => setSearch(value)}
							disabled={isInitialLoading}
						/>
						{search && (
							<button
								onClick={() => setSearch('')}
								className="absolute -translate-y-1/2 right-2 top-1/2 text-base-content/40 hover:text-base-content"
								aria-label="Clear search"
							>
								<IoCloseCircle size={16} />
							</button>
						)}
					</div>

					<Button
						size="sm"
						className="btn-ghost rounded-xl"
						loading={isInitialLoading || isBackgroundRefreshing}
						onClick={() => refetch()}
					>
						<IoReload size={18} />
					</Button>

					<BenchmarkDnsButtonComponent servers={filteredServers} />
				</div>

				<div className="flex items-center justify-between mt-3 text-sm text-base-content/60">
					<span>
						{filteredServers.length} DNS Servers
						{isBackgroundRefreshing && (
							<span className="ml-2 text-xs animate-pulse text-base-content/40">
								Updating...
							</span>
						)}
					</span>

					{search && <span>Filtered from {servers.length}</span>}
				</div>
			</div>

			<div className="flex-1 px-5 py-2 overflow-auto">
				<div className="flex flex-col gap-1 pb-10">
					{loadError && !isInitialLoading && (
						<div className="flex items-center justify-between gap-3 p-3 mb-1 text-sm border rounded-2xl border-error/30 bg-error/10 text-error">
							<div className="flex items-center gap-2">
								<IoAlertCircleOutline size={18} className="shrink-0" />
								<span>{loadError}</span>
							</div>
							<button
								onClick={() =>
									fetchedDnsList && fetchCurrentDnsList(fetchedDnsList)
								}
								className="font-medium underline whitespace-nowrap"
							>
								Retry
							</button>
						</div>
					)}

					{isListError && (
						<div className="flex items-center justify-between gap-3 p-3 mb-1 text-sm border rounded-2xl border-error/30 bg-error/10 text-error">
							<div className="flex items-center gap-2">
								<IoAlertCircleOutline size={18} className="shrink-0" />
								<span>Failed to fetch the DNS list from the server.</span>
							</div>
							<button
								onClick={() => refetch()}
								className="font-medium underline whitespace-nowrap"
							>
								Retry
							</button>
						</div>
					)}

					{isInitialLoading &&
						Array.from({
							length: 5,
						}).map((_, index) => (
							<div key={index} className="h-14 skeleton rounded-2xl" />
						))}

					{!isInitialLoading &&
						!isListError &&
						filteredServers.length === 0 && (
							<div className="py-10 text-center border rounded-2xl border-base-300 bg-base-200">
								<h2 className="font-medium">No DNS Servers</h2>

								<p className="mt-1 text-sm text-base-content/60">
									{search
										? 'No server matches your search.'
										: 'No DNS servers available right now.'}
								</p>

								{search && (
									<button
										onClick={() => setSearch('')}
										className="mt-2 text-sm font-medium text-primary hover:underline"
									>
										Clear search
									</button>
								)}
							</div>
						)}

					{!isInitialLoading &&
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

interface ServerCardProps {
	server: Server
	storeServers: Server[]
	setStoreServers: React.Dispatch<React.SetStateAction<Server[]>>
}

export function ServerCard({ server, storeServers, setStoreServers }: ServerCardProps) {
	const { avatar, name, key, tags, servers, rate, ping } = server

	const [menuOpen, setMenuOpen] = useState(false)
	const [actionLoading, setActionLoading] = useState(false)
	const [actionError, setActionError] = useState(false)
	const [copied, setCopied] = useState(false)

	const isInstalled = storeServers.some((item) => item.key === key)

	useEffect(() => {
		if (!menuOpen) return

		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setMenuOpen(false)
		}

		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [menuOpen])

	async function addHandler() {
		setActionLoading(true)
		setActionError(false)

		try {
			const response = await window.ipc.addDns(server)
			if (response.success) {
				setStoreServers(response.servers)
			} else {
				setActionError(true)
			}
		} catch {
			setActionError(true)
		} finally {
			setActionLoading(false)
		}
	}

	async function deleteHandler() {
		setActionLoading(true)
		setActionError(false)

		try {
			const response = await window.ipc.deleteDns(server)
			if (response.success) {
				setStoreServers(response.servers)
			} else {
				setActionError(true)
			}
		} catch {
			setActionError(true)
		} finally {
			setActionLoading(false)
		}
	}

	function copyHandler() {
		navigator.clipboard.writeText(servers.join(', '))
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	function renderRating(value: number) {
		const rating = value / 2
		const full = Math.floor(rating)
		const half = rating - full >= 0.5
		const stars = []

		for (let i = 0; i < 5; i++) {
			if (i < full) {
				stars.push(<FaStar key={i} className="text-warning" size={12} />)
			} else if (i === full && half) {
				stars.push(<FaStarHalfAlt key={i} className="text-warning" size={12} />)
			} else {
				stars.push(<FaRegStar key={i} className="text-base-300" size={12} />)
			}
		}
		return stars
	}

	return (
		<div className="relative transition-all duration-200 border group rounded-xl bg-base-200 border-base-300 hover:border-primary hover:shadow-md hover:shadow-primary/5">
			<div className="p-3">
				<div className="flex items-center gap-3">
					<div className="shrink-0">
						<div className="w-10 h-10 overflow-hidden rounded-lg bg-base-300">
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

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-semibold truncate text-base-content">
								{name}
							</h3>

							<div className="flex flex-wrap gap-1 shrink-0">
								{tags.slice(0, 3).map((tag) => (
									<span
										key={tag}
										className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-base-300 text-base-content/70 whitespace-nowrap"
									>
										{tag}
									</span>
								))}
								{tags.length > 3 && (
									<span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-base-300 text-base-content/50">
										+{tags.length - 3}
									</span>
								)}
							</div>

							<div className="flex items-center gap-1 ml-auto shrink-0">
								<span className="shrink-0">{getPingIcon(ping)}</span>
								<span className="text-xs text-base-content/50">
									{ping === -1 ? 'N/A' : `${ping}ms`}
								</span>
							</div>

							<button
								onClick={() => setMenuOpen(!menuOpen)}
								className="p-1 transition-colors rounded-md shrink-0 text-base-content/40 hover:bg-base-300 hover:text-base-content"
								aria-label="More options"
							>
								<CiCircleMore size={18} />
							</button>
						</div>

						<div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-base-300">
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									{renderRating(rate)}
								</div>
								{actionError && (
									<span className="text-[10px] text-error">
										Failed to complete the operation.
									</span>
								)}
							</div>

							<button
								onClick={isInstalled ? deleteHandler : addHandler}
								disabled={actionLoading}
								className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ${
									isInstalled
										? 'text-error hover:bg-error/10'
										: 'text-primary hover:bg-primary/10'
								}`}
							>
								{actionLoading ? (
									<span className="loading loading-spinner loading-xs" />
								) : isInstalled ? (
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
					<div className="absolute z-20 w-64 p-2 border shadow-lg right-2 top-11 rounded-xl bg-base-100 border-base-300">
						{/* Copy DNS */}
						<button
							onClick={copyHandler}
							className="flex items-center w-full gap-2 px-3 py-2 text-sm transition-colors rounded-lg text-base-content hover:bg-base-200"
						>
							{copied ? (
								<IoCheckmarkCircleOutline
									size={15}
									className="shrink-0 text-success"
								/>
							) : (
								<FiCopy size={15} className="shrink-0" />
							)}
							<span>{copied ? 'Copied!' : 'Copy DNS Addresses'}</span>
						</button>

						{/* DNS Servers List */}
						<div className="px-3 py-2 mt-2 rounded-lg bg-base-200">
							<div className="text-[10px] font-medium uppercase text-base-content/50">
								DNS Servers
							</div>
							<div className="mt-1 space-y-0.5">
								{servers.map((address) => (
									<div
										key={address}
										className="font-mono text-xs truncate text-base-content/70"
									>
										{address}
									</div>
								))}
							</div>
						</div>

						{/* Rating */}
						<div className="flex items-center justify-between px-3 py-2 mt-2">
							<span className="text-xs font-medium text-base-content/50">
								Rating
							</span>
							<div className="flex items-center gap-1.5">
								<div className="flex items-center gap-0.5">
									{renderRating(rate)}
								</div>
								<span className="text-xs text-base-content/50">
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
