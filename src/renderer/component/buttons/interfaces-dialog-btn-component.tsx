import { useContext, useState } from 'react'

import { BsHddNetwork } from 'react-icons/bs'
import { serversContext } from '../../context/servers.context'
import { NetworkOptionsModalComponent } from '../modals/network-options.component'
import Tooltip from '../tooltip/toolTip'
import { Button } from '../button/button'

export function InterfacesDialogButtonComponent() {
	const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
	const serversStateContext = useContext(serversContext)

	function toggleOpenModal() {
		setIsOpenModal(!isOpenModal)
	}

	return (
		<div>
			<Tooltip content="Network Interfaces" position="left">
				<Button
					size={'sm'}
					onClick={toggleOpenModal}
					className="bg-base-200 hover:bg-base-200/80 rounded-xl"
				>
					<BsHddNetwork className="text-base-content/80" size={14} />
				</Button>
				<NetworkOptionsModalComponent
					isOpen={isOpenModal}
					setIsOpen={setIsOpenModal}
					cb={(va) => {
						serversStateContext.servers.push(va)
						serversStateContext.setServers([...serversStateContext.servers])
					}}
				/>
			</Tooltip>
		</div>
	)
}
