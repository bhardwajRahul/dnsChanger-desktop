import { useState } from 'react'
import { MdSpeed } from 'react-icons/md'

import type { Server } from '../../../shared/interfaces/server.interface'
import { DnsBenchmarkModalComponent } from '../modals/dns-benchmark.component'
import Tooltip from '../tooltip/toolTip'
import { Button } from '../button/button'

interface Props {
	servers: Server[]
}

export function BenchmarkDnsButtonComponent({ servers }: Props) {
	const [isOpenModal, setIsOpenModal] = useState<boolean>(false)

	return (
		<div>
			<Tooltip content="DNS Speed Test" position="left">
				<Button
					size={'sm'}
					onClick={() => setIsOpenModal(true)}
					className={'bg-base-200 hover:bg-base-200/80 rounded-xl'}
				>
					<MdSpeed className="text-base-content/80" size={14} />
				</Button>
			</Tooltip>

			<DnsBenchmarkModalComponent
				isOpen={isOpenModal}
				setIsOpen={setIsOpenModal}
				servers={servers}
			/>
		</div>
	)
}
