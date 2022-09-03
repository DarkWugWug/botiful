/**
	* Use top-level Botiful exports as this isn't a part of the library in its
	* purest form, per-se
	*/
import { ActionContext, IMiddleware, Logger, Message, Store, Client } from '..'

interface AdminAccessData { [id: string]: number }
export class AdminAccessMiddleware implements IMiddleware<AdminAccessData> {
	public readonly name = 'adminRoleAccessControl'
	private readonly roleName: string
	private readonly logger?: Logger

	constructor (roleName: string, logger?: Logger) {
		this.roleName = roleName
		this.logger = logger
	}

	public async init (_privateData: Store<AdminAccessData>, client: Client): Promise<void> {
		if (client.guildsHaveRole(this.roleName)) return
		if (this.logger != null) this.logger.warn(`Not all guilds have role named ${this.roleName}. Creating new role for the admin middleware.`)
		await client.createRoleInGuilds(this.roleName, 'Random')
	}

	public async apply (
		action: ActionContext,
		message: Message,
		data: Store<AdminAccessData>
	): Promise<boolean> {
		if (!action.admin) return true
		if (await message.author.hasRole(this.roleName)) {
			return true
		} else {
			const key = `${message.author.id}:deniedCount`
			let count = await data.getItem(key)
			if (count == null) count = 0
			count++
			await data.setItem(key, count, 15 * 60 * 1000)
			if (this.logger != null) {
				this.logger.warn(
					`Admin action denied for user ${message.author.tag} invoking ${action.name}. Tried ${count} times in the past 15 minutes.`
				)
				this.logger.debug(
					`Needed a role of ${this.roleName}, but got [ ${message.author.getRoles().join(', ')} ]`
				)
			}
			await message.reply('You are not allowed to use this command.')
			return false
		}
	}
}
