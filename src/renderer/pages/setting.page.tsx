import React, { useEffect, useState } from 'react'
import { useI18nContext } from '../../i18n/i18n-react'
import { getThemeSystem, themeChanger } from '../utils/theme.util'
import { CgDarkMode } from 'react-icons/cg'
import { HiMoon, HiSun } from 'react-icons/hi'
import { SettingInStore } from '../../shared/interfaces/settings.interface'
import { MdBrowserUpdated } from 'react-icons/md'
import { VscRunAbove } from 'react-icons/vsc'
import { TbWindowMinimize } from 'react-icons/tb'
import { Button } from 'react-daisyui'
import { FaFileAlt, FaLaptop } from 'react-icons/fa'

export function SettingPage() {
	const [_, setStartUp] = useState<boolean>(false)
	const { LL, locale } = useI18nContext()
	const [settingState, setSettingState] = useState<SettingInStore>(
		window.storePreload.get('settings'),
	)

	function toggleStartUp() {
		window.ipc.toggleStartUP().then((res) => setStartUp(res))
	}

	function toggleAutoUpdate() {
		setSettingState((prevState) => ({
			...prevState,
			autoUpdate: !prevState.autoUpdate,
		}))
	}

	function toggleMinimize_tray() {
		setSettingState((prevState) => ({
			...prevState,
			minimize_tray: !prevState.minimize_tray,
		}))
	}

	useEffect(() => {
		window.ipc.saveSettings(settingState).catch()
	}, [settingState])

	return (
		<div
			className="flex items-center justify-center min-h-screen p-5 bg-gray-50 dark:bg-gray-900"
			dir={locale === 'fa' ? 'rtl' : 'ltr'}
		>
			<div className="w-full max-w-2xl">
				<div className="bg-white dark:bg-[#262626] rounded-xl shadow-lg overflow-hidden">
					{/* Header */}
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{LL.pages.settings.title() || 'Settings'}
						</h2>
					</div>

					{/* Content */}
					<div className="p-6 space-y-6">
						{/* Theme Changer */}
						<ThemeChanger />

						{/* Divider */}
						<div className="border-t border-gray-200 dark:border-gray-700" />

						{/* Settings Switches */}
						<div className="space-y-4">
							{/* Start Up */}
							<SettingsSwitch
								id="startUp"
								checked={settingState.startUp}
								onChange={toggleStartUp}
								icon={<VscRunAbove className="text-blue-500" />}
								title="Start up"
								description={LL.pages.settings.autoRunningTitle()}
							/>

							{/* Auto Update */}
							<SettingsSwitch
								id="autoUP"
								checked={settingState.autoUpdate}
								onChange={toggleAutoUpdate}
								icon={<MdBrowserUpdated className="text-green-500" />}
								title="Automatic Update"
								description="Get updates automatically"
							/>

							{/* Minimize to Tray */}
							<SettingsSwitch
								id="Minimize"
								checked={settingState.minimize_tray}
								onChange={toggleMinimize_tray}
								icon={<TbWindowMinimize className="text-purple-500" />}
								title="Minimize to Tray"
								description="The app moves to tray in background"
							/>
						</div>

						{/* Divider */}
						<div className="border-t border-gray-200 dark:border-gray-700" />

						{/* Action Buttons */}
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => window.ipc.openLogFile()}
								className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								<FaFileAlt />
								Open Log
							</button>
							<button
								onClick={() => window.ipc.openDevTools()}
								className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								<FaLaptop />
								Open Dev Tools
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

// Custom Switch Component
interface SettingsSwitchProps {
	id: string
	checked: boolean
	onChange: () => void
	icon: React.ReactNode
	title: string
	description: string
}

function SettingsSwitch({ id, checked, onChange, icon, title, description }: SettingsSwitchProps) {
	const [isChecked, setIsChecked] = useState(checked)

	const handleToggle = () => {
		setIsChecked(!isChecked)
		onChange()
	}

	return (
		<div className="flex items-start gap-4 p-2 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
			<div className="flex items-center">
				<button
					role="switch"
					aria-checked={isChecked}
					onClick={handleToggle}
					className={`
						relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
						${isChecked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
					`}
				>
					<span
						className={`
							inline-block h-4 w-4 transform rounded-full bg-white transition-transform
							${isChecked ? 'translate-x-6' : 'translate-x-1'}
						`}
					/>
				</button>
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600 dark:text-gray-400">{icon}</span>
					<label
						htmlFor={id}
						className="text-sm font-medium text-gray-900 cursor-pointer dark:text-gray-100"
						onClick={handleToggle}
					>
						{title}
					</label>
				</div>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
					{description}
				</p>
			</div>
		</div>
	)
}

// Custom Select Component
interface ThemeOption {
	value: string
	label: string
	icon: React.ReactNode
}

function ThemeChanger() {
	const [currentTheme, setCurrentTheme] = useState(
		localStorage.getItem('theme') || getThemeSystem(),
	)
	const [isOpen, setIsOpen] = useState(false)
	const { LL } = useI18nContext()

	const themeOptions: ThemeOption[] = [
		{ value: 'system', label: 'System', icon: <CgDarkMode /> },
		{ value: 'dark', label: LL.themeChanger.dark(), icon: <HiMoon /> },
		{ value: 'light', label: LL.themeChanger.light(), icon: <HiSun /> },
	]

	useEffect(() => {
		themeChanger(currentTheme as any)
		localStorage.setItem('theme', currentTheme)
	}, [currentTheme])

	const selectedOption = themeOptions.find(opt => opt.value === currentTheme)

	return (
		<div className="relative w-full">
			<label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				{LL.pages.settings.themeChanger()}
			</label>
			
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full px-4 py-2.5 text-left bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
					{selectedOption?.icon}
					<span className="flex-1">{selectedOption?.label}</span>
					<svg
						className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute left-0 right-0 mt-1 z-20 bg-white dark:bg-[#262626] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
						{themeOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									setCurrentTheme(option.value)
									setIsOpen(false)
								}}
								className={`
									w-full px-4 py-2.5 flex items-center gap-2 text-sm transition-colors
									${currentTheme === option.value
										? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
										: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
									}
								`}
							>
								{option.icon}
								<span>{option.label}</span>
								{currentTheme === option.value && (
									<svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}