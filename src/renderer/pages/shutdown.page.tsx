import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { BsClock, BsPower } from 'react-icons/bs'
import { MdClear } from 'react-icons/md'

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

			// Reset to +1 hour
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
		<div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<div className="p-3 bg-red-100 rounded-full dark:bg-red-900/30">
						<BsPower className="text-2xl text-red-500 dark:text-red-400" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold text-gray-800 dark:text-white font-[balooTamma]">
							Shutdown Control
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400 font-[Inter]">
							Schedule or clear shutdown operations
						</p>
					</div>
				</div>

				{/* Cards Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* Schedule Section */}
					<div className="bg-white dark:bg-[#262626] rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
						<div className="flex items-center gap-2 mb-4">
							<BsClock className="text-red-500 dark:text-red-400" />
							<h2 className="text-lg font-semibold text-gray-800 dark:text-white font-[balooTamma]">
								Schedule Shutdown
							</h2>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
									Date
								</label>
								<input
									type="date"
									value={scheduledDate}
									onChange={(e) => setScheduledDate(e.target.value)}
									className="w-full px-3 py-2 text-gray-900 transition-all bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
									min={new Date().toISOString().split('T')[0]}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
									Time
								</label>
								<input
									type="time"
									value={scheduledTime}
									onChange={(e) => setScheduledTime(e.target.value)}
									className="w-full px-3 py-2 text-gray-900 transition-all bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
								/>
							</div>

							<button
								onClick={handleScheduleShutdown}
								disabled={loading}
								className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 dark:disabled:bg-red-800 text-white rounded-lg font-[Inter] text-sm font-medium transition-all duration-200 flex items-center justify-center"
							>
								{loading ? (
									<>
										<div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
										Scheduling...
									</>
								) : (
									<>
										<BsClock className="mr-2" size={16} />
										Schedule Shutdown
									</>
								)}
							</button>
						</div>
					</div>

					{/* Clear All Section */}
					<div className="bg-white dark:bg-[#262626] rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
						<div className="flex items-center gap-2 mb-4">
							<MdClear className="text-gray-500 dark:text-gray-400" />
							<h2 className="text-lg font-semibold text-gray-800 dark:text-white font-[balooTamma]">
								Clear All Shutdowns
							</h2>
						</div>

						<div className="flex flex-col h-full">
							<p className="text-sm text-gray-600 dark:text-gray-400 font-[Inter] mb-6">
								Cancel all scheduled shutdown operations. This will remove any
								pending shutdown tasks from the system.
							</p>

							<div className="flex items-end flex-1">
								<button
									onClick={handleClearAllShutdowns}
									disabled={clearingAll}
									className="w-full py-2.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg font-[Inter] text-sm font-medium transition-all duration-200 flex items-center justify-center"
								>
									{clearingAll ? (
										<>
											<div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
											Clearing...
										</>
									) : (
										<>
											<MdClear className="mr-2" size={16} />
											Clear All Shutdowns
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Info Section */}
				<div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
					<div className="flex items-start gap-3">
						<svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
						</svg>
						<div>
							<p className="text-sm font-medium text-blue-700 dark:text-blue-300">
								Important Note
							</p>
							<p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
								Scheduled shutdown will execute at the specified date and time. 
								Make sure to save your work before the shutdown time.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}