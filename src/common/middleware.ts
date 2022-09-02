import EventEmitter from 'events'
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

interface RbacData { [id: string]: number }
export class RbacMiddleware implements IMiddleware<RbacData> {
	public readonly name = 'roleBasedAccessControl'

	private readonly roles: Set<string> = new Set()
	private readonly logger?: Logger

	constructor (emitter: EventEmitter, actions: ActionContext[], logger?: Logger) {
		for (const action of actions) {
			this.addActionRoles(action)
		}
		emitter.on('actionLoaded', (action: ActionContext) => this.addActionRoles(action))
		this.logger = logger
	}

	public async init (_privateData: Store<AdminAccessData>, client: Client): Promise<void> {
		for (const role of this.roles) {
			if (!client.guildsHaveRole(role)) {
				if (this.logger != null) this.logger.warn(`Not all guilds have role named ${role}  (it's being used by some loaded action). Creating new role for the rbac middleware.`)
				await client.createRoleInGuilds(role)
			}
		}
	}

	public async apply (
		action: ActionContext,
		message: Message,
		data: Store<RbacData>
	): Promise<boolean> {
		if ((action.roles == null) || action.roles.length === 0) {
			return true
		}
		if (await message.author.hasAnyRole(action.roles)) {
			return true
		} else {
			const key = `${message.author.id}:deniedCount`
			let count = await data.getItem(key)
			if (count == null) count = 0
			count++
			await data.setItem(key, count, 15 * 60 * 1000)
			if (this.logger != null) {
				this.logger.warn(
					`Role base access denied for user ${message.author.tag} invoking ${action.name}. Tried ${count} times in the past 15 minutes.`
				)
				this.logger.debug(
					`Needed any role in [ ${action.roles.join(', ')} ], but got [ ${message.author.getRoles().join(', ')} ]`
				)
			}
			await message.reply('You are not allowed to use this command.')
			return false
		}
	}

	private addActionRoles (action: ActionContext): void {
		if (action.roles == null) return
		for (const role of action.roles) {
			this.roles.add(role)
		}
	}
}
