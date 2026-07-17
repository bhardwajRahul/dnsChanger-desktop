import { useMemo, useState } from 'react'
import { IoPlay } from 'react-icons/io5'

import type { setState } from '../../interfaces/react.interface'
import type { Server } from '../../../shared/interfaces/server.interface'
import type { DnsBenchmarkResult } from '../../../shared/interfaces/dns-benchmark.interface'
import {
	CUSTOM_BENCHMARK_TARGET_KEY,
	benchmarkTargets,
} from '../../../shared/constants/benchmark-targets.constant'

import { getPingIcon } from '../../utils/icons.util'
import { appNotif } from '../../notifications/appNotif'

import Modal from './modal'
import { Button } from '../button/button'
import { TextInput } from '../input/text-input'

interface Props {
	isOpen: boolean
	setIsOpen: setState<boolean>
	servers: Server[]
}

const statusStyles: Record<DnsBenchmarkResult['status'], string> = {
	ok: 'bg-success/15 text-success',
	blocked: 'bg-error/15 text-error',
	error: 'bg-error/15 text-error',
	failed: 'bg-base-300 text-base-content/50',
}

const statusLabels: Record<DnsBenchmarkResult['status'], string> = {
	ok: 'Reachable',
	blocked: 'Blocked (403)',
	error: 'Error',
	failed: 'Failed',
}

export function DnsBenchmarkModalComponent(props: Props) {
	const [targetKey, setTargetKey] = useState<string>(benchmarkTargets[0].key)
	const [customUrl, setCustomUrl] = useState<string>('')
	const [isTesting, setIsTesting] = useState<boolean>(false)
	const [results, setResults] = useState<DnsBenchmarkResult[] | null>(null)
	const [connectingKey, setConnectingKey] = useState<string | null>(null)

	const selectedTarget = useMemo(
		() => benchmarkTargets.find((target) => target.key === targetKey),
		[targetKey]
	)

	const isCustomTarget = targetKey === CUSTOM_BENCHMARK_TARGET_KEY
	const targetUrl = isCustomTarget ? customUrl.trim() : selectedTarget?.url || ''

	function handleClose() {
		if (isTesting) return
		props.setIsOpen(false)
	}

	async function startTest() {
		if (!props.servers.length) {
			appNotif('Error', 'No DNS servers to test', 'ERROR')
			return
		}

		if (!targetUrl) {
			appNotif('Error', 'Please enter a target website', 'ERROR')
			return
		}

		setIsTesting(true)
		setResults(null)

		try {
			const response = await window.ipc.benchmarkDns(targetUrl, props.servers)

			if (response.success) {
				setResults(response.results)
			} else {
				appNotif('Error', response.message || 'Test failed', 'ERROR')
			}
		} catch {
			appNotif('Error', 'Unknown error while testing DNS servers', 'ERROR')
		} finally {
			setIsTesting(false)
		}
	}

	async function connectServer(result: DnsBenchmarkResult) {
		const server = props.servers.find((item) => item.key === result.key)
		if (!server) return

		setConnectingKey(result.key)

		try {
			const response = await window.ipc.setDns(server)
			appNotif(
				response.success ? 'Success' : 'Error',
				response.message,
				response.success ? 'SUCCESS' : 'ERROR'
			)
		} finally {
			setConnectingKey(null)
		}
	}

	if (!props.isOpen) return null

	return (
		<Modal
			isOpen={props.isOpen}
			onClose={handleClose}
			title="DNS Speed Test"
			size="lg"
		>
			<div className="flex flex-col justify-between gap-3 py-1">
				<p className="text-xs text-base-content/60">
					Checks [ {props.servers.length} ] DNS server
					{props.servers.length === 1 ? '' : 's'} against a real website and
					reports the best ping. Servers blocked with a 403 error are flagged.
				</p>

				<div className="flex flex-col gap-1.5 px-2">
					<span className="text-xs font-medium text-base-content/60">
						Target website
					</span>

					<select
						value={targetKey}
						disabled={isTesting}
						onChange={(e) => setTargetKey(e.target.value)}
						className="border cursor-pointer select select-sm rounded-xl bg-base-200 border-base-300 outline-primary/30"
					>
						<option value={CUSTOM_BENCHMARK_TARGET_KEY}>Custom URL...</option>
						{benchmarkTargets.map((target) => (
							<option key={target.key} value={target.key}>
								{target.label}
							</option>
						))}
					</select>

					{isCustomTarget && (
						<TextInput
							value={customUrl}
							onChange={setCustomUrl}
							placeholder="https://example.com"
							disabled={isTesting}
						/>
					)}
				</div>

				<Button
					size="sm"
					isPrimary
					loading={isTesting}
					disabled={isTesting}
					onClick={startTest}
					className="rounded-xl"
				>
					<div className="flex items-center gap-2">
						<IoPlay size={14} />
						Start Test
					</div>
				</Button>

				<div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-0.5">
					{isTesting &&
						Array.from({
							length: 4,
						}).map((_, index) => (
							<div key={index} className="h-12 rounded-xl skeleton" />
						))}

					{!isTesting && results?.length === 0 && (
						<div className="py-6 text-sm text-center rounded-xl bg-base-200 text-base-content/50">
							No results
						</div>
					)}

					{!isTesting &&
						results?.map((result) => (
							<div
								key={result.key}
								className="flex items-center justify-between gap-2 px-3 py-1 border rounded-xl bg-base-200 border-base-300"
							>
								<div className="flex flex-col min-w-0">
									<span className="text-xs font-medium truncate text-base-content">
										{result.name}
									</span>
									<span
										className={`w-fit mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[result.status]}`}
									>
										{statusLabels[result.status]}
									</span>
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<div className="flex items-center gap-1 select-none">
										{getPingIcon(result.ping)}
										<span className="text-xs text-base-content/60">
											{result.ping === -1
												? 'N/A'
												: `${result.ping}ms`}
										</span>
									</div>

									{result.status === 'ok' && (
										<Button
											size="xs"
											className="rounded-lg btn-ghost text-primary"
											loading={connectingKey === result.key}
											onClick={() => connectServer(result)}
										>
											Connect
										</Button>
									)}
								</div>
							</div>
						))}
				</div>
			</div>
		</Modal>
	)
}
