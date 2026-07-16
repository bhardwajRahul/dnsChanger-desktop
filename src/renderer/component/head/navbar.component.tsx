import { IoClose } from 'react-icons/io5'
import { VscChromeMinimize } from 'react-icons/vsc'
import { BsDiscord, BsGiftFill, BsGithub } from 'react-icons/bs'
import { Button } from '../button/button'
import Tooltip from '../tooltip/toolTip'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { UrlsConstant } from '../../../shared/constants/urls.constant'

export function NavbarComponent() {
	const [ad, setAd] = useState<string | null>(null)
	useEffect(() => {
		async function fetchAd() {
			try {
				const response = await axios.get(
					`${UrlsConstant.DONATE_STORE}?t=${Date.now()}`
				)
				if (!response.data) {
					setAd(null)
				} else {
					setAd(response.data.url)
				}
			} finally {
			}
		}

		fetchAd()
	}, [])

	return (
		<div>
			<div className="bg-base-300 navbar">
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
						{ad ? (
							<Tooltip content="Donate Us">
								<Button
									className="text-[#616161] hover:text-current btn-ghost rounded-lg"
									size="xs"
									onClick={() => window.ipc.openBrowser(ad)}
								>
									<BsGiftFill />
								</Button>
							</Tooltip>
						) : null}
					</div>
				</div>
			</div>
		</div>
	)
}
