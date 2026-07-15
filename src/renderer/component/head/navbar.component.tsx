import { IoClose } from 'react-icons/io5'
import { VscChromeMinimize } from 'react-icons/vsc'
import { BsDiscord, BsGithub } from 'react-icons/bs'

import { useEffect, useState } from 'react'
import { FiWifiOff } from 'react-icons/fi'
import { Button } from '../button/button'

export function NavbarComponent() {
	const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
	useEffect(() => {
		window.addEventListener('offline', function (e) {
			setIsOnline(false)
		})
		window.addEventListener('online', function (e) {
			setIsOnline(true)
		})
	}, [])
	return (
		<div>
			<div className="bg-base-200 navbar">
				<div className="flex-1 pl-5">
					<h1 className="text-2xl mt-1 font-[balooTamma] text-[#75767c]">
						DNS Changer
					</h1>
				</div>
				<div className="flex-none">
					<div className="flex flex-row-reverse items-center gap-1">
						<Button
							className="rounded-lg btn-ghost hover:bg-error hover:text-gray-100"
							size="sm"
							onClick={() => window.ipc.close()}
						>
							<IoClose />
						</Button>

						<Button
							className="rounded-lg btn-ghost"
							size="sm"
							onClick={() => window.ipc.minimize()}
						>
							<VscChromeMinimize />
						</Button>

						<Button
							className="text-[#616161] hover:text-current btn-ghost rounded-lg"
							size="xs"
							onClick={() =>
								window.ipc.openBrowser('https://discord.gg/p9TZzEV39e')
							}
						>
							<BsDiscord />
						</Button>

						<Button
							className="text-[#616161] hover:text-current btn-ghost rounded-lg"
							size="xs"
							onClick={() =>
								window.ipc.openBrowser(
									'https://github.com/DnsChanger/dnsChanger-desktop'
								)
							}
						>
							<BsGithub />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
