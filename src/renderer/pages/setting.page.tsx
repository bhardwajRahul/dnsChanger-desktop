import React, { useEffect, useState } from 'react'
import { useI18nContext } from '../../i18n/i18n-react'
import { getThemeSystem, themeChanger } from '../utils/theme.util'
import { CgDarkMode } from 'react-icons/cg'
import { HiMoon, HiSun } from 'react-icons/hi'
import type { SettingInStore } from '../../shared/interfaces/settings.interface'
import { MdBrowserUpdated } from 'react-icons/md'
import { VscRunAbove } from 'react-icons/vsc'
import { TbWindowMinimize } from 'react-icons/tb'
import { FaFileAlt, FaLaptop } from 'react-icons/fa'
import { ToggleSwitch } from '../component/toggle/toggle-switch.component'
import { ItemSelector } from '../component/item-selector/item-selector'

export function SettingPage() {
	const [_, setStartUp] = useState<boolean>(false)
	const { LL, locale } = useI18nContext()
	const [settingState, setSettingState] = useState<SettingInStore>(
		window.storePreload.get('settings')
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
		<div className="p-2 overflow-y-auto" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
			<div className="max-w-2xl mx-auto">
				<div className="border shadow-lg bg-base-100 rounded-xl border-base-300">
					<div className="p-4 space-y-4">
						<ThemeChanger />

						<div className="border-t border-base-300" />

						<div className="space-y-3">
							{/* Start Up */}
							<SettingsSwitch
								id="startUp"
								checked={settingState.startUp}
								onChange={toggleStartUp}
								icon={<VscRunAbove className="text-primary" />}
								title="Start up"
								description={LL.pages.settings.autoRunningTitle()}
							/>

							{/* Auto Update */}
							<SettingsSwitch
								id="autoUP"
								checked={settingState.autoUpdate}
								onChange={toggleAutoUpdate}
								icon={<MdBrowserUpdated className="text-success" />}
								title="Automatic Update"
								description="Get updates automatically"
							/>

							{/* Minimize to Tray */}
							<SettingsSwitch
								id="Minimize"
								checked={settingState.minimize_tray}
								onChange={toggleMinimize_tray}
								icon={<TbWindowMinimize className="text-secondary" />}
								title="Minimize to Tray"
								description="The app moves to tray in background"
							/>
						</div>

						<div className="border-t border-base-300" />

						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => window.ipc.openLogFile()}
								className="btn btn-ghost btn-sm"
							>
								<FaFileAlt size={14} />
								Open Log
							</button>
							<button
								onClick={() => window.ipc.openDevTools()}
								className="btn btn-ghost btn-sm"
							>
								<FaLaptop size={14} />
								Open Dev Tools
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

interface SettingsSwitchProps {
	id: string
	checked: boolean
	onChange: () => void
	icon: React.ReactNode
	title: string
	description: string
}

function SettingsSwitch({
	id,
	checked,
	onChange,
	icon,
	title,
	description,
}: SettingsSwitchProps) {
	const [isChecked, setIsChecked] = useState(checked)

	const handleToggle = () => {
		setIsChecked(!isChecked)
		onChange()
	}

	return (
		<div className="flex items-start gap-3 p-1 transition-colors rounded-lg hover:bg-base-200">
			<div className="flex items-center flex-1 min-w-0 gap-2">
				<span className="text-base-content/70">{icon}</span>
				<div className="flex-1 min-w-0">
					<label
						htmlFor={id}
						className="text-sm font-medium cursor-pointer text-base-content"
						onClick={handleToggle}
					>
						{title}
					</label>
					<p className="text-xs text-base-content/60 mt-0.5">{description}</p>
				</div>
				<ToggleSwitch enabled={isChecked} onToggle={handleToggle} />
			</div>
		</div>
	)
}

function ThemeChanger() {
	const [currentTheme, setCurrentTheme] = useState(
		localStorage.getItem('theme') || getThemeSystem()
	)
	const { LL } = useI18nContext()

	const themeOptions = [
		{ value: 'system', label: 'System', icon: <CgDarkMode size={16} /> },
		{ value: 'dark', label: LL.themeChanger.dark(), icon: <HiMoon size={16} /> },
		{ value: 'light', label: LL.themeChanger.light(), icon: <HiSun size={16} /> },
	]

	useEffect(() => {
		themeChanger(currentTheme as any)
		localStorage.setItem('theme', currentTheme)
	}, [currentTheme])

	return (
		<div className="flex items-center justify-between">
			<label className="text-sm font-medium text-base-content">
				{LL.pages.settings.themeChanger()}
			</label>
			<div className="flex gap-2">
				{themeOptions.map((f) => (
					<ItemSelector
						isActive={currentTheme === f.value}
						label={f.label}
						onClick={() => setCurrentTheme(f.value)}
						key={f.value}
					/>
				))}
			</div>
		</div>
	)
}
