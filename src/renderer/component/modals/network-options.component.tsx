import { useContext, useEffect, useState } from 'react'
import { settingStore } from '../../app'
import { serversContext } from '../../context/servers.context'
import type { setState } from '../../interfaces/react.interface'
import type { ServersContext } from '../../interfaces/servers-context.interface'
import Modal from './modal'
import { Button } from '../button/button'

interface Props {
	isOpen: boolean
	setIsOpen: setState<boolean>
	cb: (val: any) => void
}

export function NetworkOptionsModalComponent(props: Props) {
	const { setNetwork, network } = useContext<ServersContext>(serversContext)

	const handleOpen = () => props.setIsOpen((cur) => !cur)

	const [loading, setLoading] = useState<boolean>(true)

	const [networkInterface, setNetworkInterfaceInterface] = useState<string>()

	const [networkAdapters, setNetworkAdapters] = useState<string[]>([])

	useEffect(() => {
		const fetchNetworkInterfaces = async () => {
			try {
				const interfaces = await window.os.getInterfaces()
				const networks = interfaces.map((d: any) => d.name)
				networks.unshift('Auto')
				setNetworkAdapters(networks)
			} finally {
				setLoading(false)
			}
		}

		if (props.isOpen) {
			const current = window.storePreload.get('settings').network_interface
			setNetwork(current)
			fetchNetworkInterfaces()
		}
	}, [props.isOpen])

	useEffect(() => {
		if (networkInterface) {
			settingStore.network_interface = networkInterface
			window.ipc.saveSettings(settingStore).catch()

			setNetwork(networkInterface)
		}
	}, [networkInterface])

	// Modal overlay
	if (!props.isOpen) return null

	return (
		<Modal
			isOpen={props.isOpen}
			onClose={() => props.setIsOpen(false)}
			title="Network Interface"
			size="sm"
		>
			{/* Body */}
			<div className="flex flex-col items-center justify-between gap-2 py-2">
				{loading ? (
					<div className="flex flex-row items-center gap-2">
						<span className="loading loading-ring loading-xs"></span>
						fetching interfaces...
					</div>
				) : (
					<select
						onChange={(value) =>
							setNetworkInterfaceInterface(value.target.value)
						}
						className="border cursor-pointer select rounded-xl bg-base-200 border-base-300 outline-primary/30"
					>
						{networkAdapters.map((item) => (
							<option value={item} selected={item === network} key={item}>
								{item}
							</option>
						))}
					</select>
				)}
				<Button
					className="normal-case font-[balooTamma] text-xl w-full mt-4 rounded-xl"
					onClick={handleOpen}
					size="md"
				>
					Close
				</Button>
			</div>
		</Modal>
	)
}
