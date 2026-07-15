import React, { useState, useEffect, type JSX } from 'react'

import { Toaster } from 'react-hot-toast'
import type { IconType } from 'react-icons'
import { BsPower } from 'react-icons/bs'
import { MdOutlineExplore } from 'react-icons/md'
import { TbSettings, TbSmartHome } from 'react-icons/tb'
import TypesafeI18n from '../i18n/i18n-react'
import { loadLocaleAsync } from '../i18n/i18n-util.async'
import type { SettingInStore, Settings } from '../shared/interfaces/settings.interface'
import { PageWrapper } from './Wrappers/pages.wrapper'
import { ExplorePage } from './pages/explore.page'
import { HomePage } from './pages/home.page'
import { SettingPage } from './pages/setting.page'
import { ShutdownPage } from './pages/shutdown.page'
import { getThemeSystem, themeChanger } from './utils/theme.util'
export let settingStore: SettingInStore = window.storePreload.get('settings')
import ReactGA from 'react-ga4'
import { NavbarComponent } from './component/head/navbar.component'
import { AnimatePresence, motion } from 'framer-motion'

interface Page {
	key: string
	element: JSX.Element
	icon: IconType
	name: string
}

const pages: Page[] = [
	{ key: '/', element: <HomePage />, icon: TbSmartHome, name: 'Home' },
	{
		key: '/explore',
		element: <ExplorePage />,
		icon: MdOutlineExplore,
		name: 'Explore',
	},
	{ key: '/shutdown', element: <ShutdownPage />, icon: BsPower, name: 'Shutdown' },
	{ key: '/setting', element: <SettingPage />, icon: TbSettings, name: 'Setting' },
]

export function App() {
	const [wasLoaded, setWasLoaded] = useState(false)

	const [currentPage, setCurrentPage] = useState<Page>(pages[0])
	const [currentPath, setCurrentPath] = useState<string>('/')

	useEffect(() => {
		let page = pages.find((p) => p.key === currentPath)
		if (!page) page = pages[0]

		setCurrentPage(page)
	}, [currentPath])

	useEffect(() => {
		ReactGA.initialize('G-XJBQXCR24P')
		async function getSetting() {
			settingStore = (await window.ipc.getSettings()) as Settings
		}

		getSetting().then(() => {
			loadLocaleAsync(settingStore.lng).then(() => setWasLoaded(true))
		})

		let theme = localStorage.getItem('theme') || 'dark'
		if (theme === 'system') theme = getThemeSystem()

		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', ({ matches }) => {
				if (theme === 'system') {
					if (matches) {
						themeChanger('dark')
					} else {
						themeChanger('light')
					}
				}
			})

		themeChanger(theme as any)
		return () => {
			window
				.matchMedia('(prefers-color-scheme: dark)')
				.removeEventListener('change', () => {})
		}
	}, [])

	if (!wasLoaded) return null
	function InPath(target: string): boolean {
		return currentPath === target
	}

	return (
		<div className="h-96">
			<TypesafeI18n locale={settingStore.lng}>
				<NavbarComponent />
				<PageWrapper>{currentPage.element}</PageWrapper>
				<div
					className="fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 px-4 bg-base-100"
					dir={settingStore.lng === 'fa' ? 'rtl' : 'ltr'}
				>
					{pages.map((page) => {
						return (
							<div
								key={page.key}
								onClick={() => setCurrentPath(page.key)}
								className="flex cursor-pointer"
							>
								<div
									className={`rounded-xl gap-1 p-2 transition-colors duration-200 flex items-center ${
										InPath(page.key)
											? 'bg-primary/10 text-primary'
											: 'hover:bg-primary/20 hover:text-primary/80 text-base-content/70'
									}`}
								>
									{React.createElement(page.icon, {
										size: 28,
									})}
									<AnimatePresence mode="wait">
										{InPath(page.key) && (
											<motion.span
												initial={{ opacity: 0, width: 0 }}
												animate={{ opacity: 1, width: 'auto' }}
												exit={{ opacity: 0, width: 0 }}
												transition={{ duration: 0.2 }}
												style={{
													overflow: 'hidden',
													whiteSpace: 'nowrap',
												}}
											>
												{page.name}
											</motion.span>
										)}
									</AnimatePresence>
								</div>
							</div>
						)
					})}
				</div>
				<Toaster />
			</TypesafeI18n>
		</div>
	)
}
