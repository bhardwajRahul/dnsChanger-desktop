import { useState } from 'react'
import { FaBroom } from 'react-icons/fa'
import { appNotif } from '../../notifications/appNotif'
import Tooltip from '../tooltip/toolTip'
import { Button } from '../button/button'

export function FlushDNS_BtnComponent() {
	const [loading, setLoading] = useState<boolean>(false)

	async function handleClick() {
		if (loading) return
		setLoading(true)
		const result = await window.ipc.flushDns()
		setLoading(false)
		if (result.success) {
			appNotif('Success', `DNS Flushed Successfully`, 'SUCCESS')
		} else {
			appNotif('Failed', `Failed to Flush DNS`, 'ERROR')
		}
	}

	return (
		<div>
			<Tooltip content="Flush DNS" position="top">
				<Button
					size={'sm'}
					onClick={handleClick}
					disabled={loading}
					className={'bg-base-200 hover:bg-base-200/80'}
				>
					<FaBroom
						// className={`dark:text-gray-600 text-gray-700  ${loading ? 'animate-pulse' : ''}`}
						size={16}
					/>
				</Button>
			</Tooltip>
		</div>
	)
}
