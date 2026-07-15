import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { BsClock, BsPower } from 'react-icons/bs'
import { MdClear } from 'react-icons/md'
import { FiInfo } from 'react-icons/fi'
import { Button } from '../component/button/button'

export function ShutdownPage() {
	const [scheduledTime, setScheduledTime] = useState('')
	const [scheduledDate, setScheduledDate] = useState('')
	const [loading, setLoading] = useState(false)
	const [clearingAll, setClearingAll] = useState(false)

	useEffect(() => {
		const now = new Date()
		const currentDate = now.toISOString().split('T')[0]
		const currentTime = now.toTimeString().slice(0, 5)
		setScheduledDate(currentDate)
		setScheduledTime(currentTime)
	}, [])

	const handleScheduleShutdown = async () => {
		if (!scheduledDate || !scheduledTime) {
			toast.error('Please select date and time')
			return
		}

		const scheduleDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
		const now = new Date()

		if (scheduleDateTime <= now) {
			toast.error('Please select a future time')
			return
		}

		setLoading(true)
		try {
			const delay = scheduleDateTime.getTime() - now.getTime()
			await window.ipc.scheduleShutdown({
				delay,
				scheduledTime: scheduleDateTime,
				description: `Shutdown at ${scheduleDateTime.toLocaleString()}`,
			})

			toast.success('Shutdown scheduled successfully!')

			const futureTime = new Date(now.getTime() + 60 * 60 * 1000)
			setScheduledDate(futureTime.toISOString().split('T')[0])
			setScheduledTime(futureTime.toTimeString().slice(0, 5))
		} catch (error) {
			toast.error('Failed to schedule shutdown')
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const handleClearAllShutdowns = async () => {
		setClearingAll(true)
		try {
			await window.ipc.clearAllShutdowns()
			toast.success('All scheduled shutdowns cleared')
		} catch (error) {
			toast.error('Failed to clear all shutdowns')
			console.error(error)
		} finally {
			setClearingAll(false)
		}
	}

	return (
		<div className="p-2 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center gap-3 mb-5">
				<div className="p-2 rounded-lg bg-error/20">
					<BsPower className="text-xl text-error" />
				</div>
				<div>
					<h1 className="text-xl font-semibold text-base-content font-[balooTamma]">
						Shutdown Control
					</h1>
					<p className="text-xs text-base-content/70 font-[Inter]">
						Schedule or clear system shutdown operations
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="p-3 transition-all border bg-base-100 rounded-xl border-base-300">
					<div className="flex items-center gap-2 mb-3">
						<BsClock className="text-error" size={16} />
						<h2 className="text-sm font-semibold text-base-content font-[balooTamma]">
							Schedule Shutdown
						</h2>
					</div>

					<div className="space-y-3">
						<div>
							<label className="block mb-1 text-xs font-medium text-base-content/70">
								Date
							</label>
							<input
								type="date"
								value={scheduledDate}
								onChange={(e) => setScheduledDate(e.target.value)}
								className="w-full px-3 py-1.5 text-sm text-base-content transition-all bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:border-error"
								min={new Date().toISOString().split('T')[0]}
							/>
						</div>

						<div>
							<label className="block mb-1 text-xs font-medium text-base-content/70">
								Time
							</label>
							<input
								type="time"
								value={scheduledTime}
								onChange={(e) => setScheduledTime(e.target.value)}
								className="w-full px-3 py-1.5 text-sm text-base-content transition-all bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:border-error"
							/>
						</div>

						<Button
							size="sm"
							onClick={handleScheduleShutdown}
							disabled={loading}
							className="flex items-center justify-center w-full py-2 text-xs font-medium transition-all duration-200 rounded-lg btn-error hover:bg-error/90 disabled:bg-error/50"
						>
							{loading ? (
								<>
									<div className="w-3.5 h-3.5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
									Scheduling...
								</>
							) : (
								<>
									<BsClock className="mr-1.5" size={14} />
									Schedule Shutdown
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Clear All Card */}
				<div className="flex flex-col p-3 transition-all border bg-base-100 rounded-xl border-base-300">
					<div className="flex items-center gap-2 mb-3">
						<MdClear className="text-base-content/60" size={16} />
						<h2 className="text-sm font-semibold text-base-content font-[balooTamma]">
							Clear All
						</h2>
					</div>

					<p className="text-xs text-base-content/70 font-[Inter] flex-1">
						Cancel all scheduled shutdown operations. This will remove any
						pending shutdown tasks from the system.
					</p>

					<Button
						size="sm"
						onClick={handleClearAllShutdowns}
						disabled={clearingAll}
						className="flex items-center justify-center w-full py-2 mt-3 text-xs font-medium transition-all duration-200 rounded-lg bg-base-400 hover:bg-base-500 disabled:bg-base-300"
					>
						{clearingAll ? (
							<>
								<div className="w-3.5 h-3.5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
								Clearing...
							</>
						) : (
							<>
								<MdClear className="mr-1.5" size={14} />
								Clear All Shutdowns
							</>
						)}
					</Button>
				</div>
			</div>
			{/* Info Section
			<div className="flex items-start gap-2.5 p-3 mt-1 rounded-lg bg-info/20 text-info-content border border-info/30">
				<FiInfo className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
				<div>
					<p className="text-xs font-medium text-info-content">
						Important Note
					</p>
					<p className="text-[11px] text-info-content/80 mt-0.5">
						Scheduled shutdown will execute at the specified date and time.
						Make sure to save your work before the shutdown time.
					</p>
				</div>
			</div> */}
		</div>
	)
}
