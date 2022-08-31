import { ActionContext, IMiddleware, Logger, Message, Store } from './'

interface AdminAccessData { [id: string]: number }
export class AdminAccessMiddleware implements IMiddleware<AdminAccessData> {
	public readonly name = 'adminRoleAccessControl'
	private readonly roleName: string

	constructor (roleName: string) {
		this.roleName = roleName
	}

	public async apply (
		action: ActionContext,
		message: Message,
		data: Store<AdminAccessData>,
		logger: Logger
	): Promise<boolean> {
		if (!action.admin) return true
		if (await message.authorHasRole(this.roleName)) {
			return true
		} else {
			const key = `${message.author.id}:deniedCount`
			let count = await data.getItem(key)
			if (count == null) count = 0
			count++
			await data.setItem(key, count, 15 * 60 * 1000)
			logger.warn(
				`Admin action denied for user ${message.author.tag} involving ${action.name}. Tried ${count} times in the past 15 minutes.`
			)
			logger.debug(
				`Needed a role of ${this.roleName}, but got [ ${message.author.getRoles().join(', ')} ]`
			)
			await message.reply('You are not allowed to use this command.')
			return false
		}
	}
}

interface RbacData { [id: string]: number }
export class RbacMiddleware implements IMiddleware<RbacData> {
	public readonly name = 'roleBasedAccessControl'

	public async apply (
		action: ActionContext,
		message: Message,
		data: Store<RbacData>,
		logger: Logger
	): Promise<boolean> {
		if ((action.roles == null) || action.roles.length === 0) {
			return true
		}
		if (await message.authorHasAnyRole(action.roles)) {
			return true
		} else {
			const key = `${message.author.id}:deniedCount`
			let count = await data.getItem(key)
			if (count == null) count = 0
			count++
			await data.setItem(key, count, 15 * 60 * 1000)
			logger.warn(
				`Role base access denied for user ${message.author.tag} involving ${action.name}. Tried ${count} times in the past 15 minutes.`
			)
			logger.debug(
				`Needed any role in [ ${action.roles.join(', ')} ], but got [ ${message.author.getRoles().join(', ')} ]`
			)
			await message.reply('You are not allowed to use this command.')
			return false
		}
	}
}

export interface UsernameAccessData { [id: string]: number }
export class UsernameAccessMiddleware
implements IMiddleware<UsernameAccessData> {
	public readonly name = 'usernameBasedAccessControl'

	public async apply (
		action: ActionContext,
		message: Message,
		data: Store<UsernameAccessData>,
		logger: Logger
	): Promise<boolean> {
		if ((action.users == null) || action.users.length === 0) return true
		const isExpectedUser = (action.users).some(
			(username) => message.author.username === username
		)
		if (isExpectedUser) {
			return true
		} else {
			const key = `${message.author.id}:deniedCount`
			let count = await data.getItem(key)
			if (count == null) count = 0
			count++
			await data.setItem(key, count, 15 * 60 * 1000)
			logger.warn(
				`Username based access denied for user ${message.author.tag} involving ${action.name}. Tried ${count} times in the past 15 minutes.`
			)
			logger.debug(
				`Permitted users [ ${action.users.join(', ')} ]`
			)
			await message.reply('You are not allowed to use this command.')
			return false
		}
	}
}
