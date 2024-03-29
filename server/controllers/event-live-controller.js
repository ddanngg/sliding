const EventModel = requireWrp('models/event');
const EventRoleModel = requireWrp('models/event-role');
const Roles = requireDir('resources/roles/');

module.exports = {
	async getEvent({ io, socket, code }) {
		const result = {};

		try {
			const Event = new EventModel();
			const EventRole = new EventRoleModel();
			// find event
			let ioEvent = io.$fn.getEvent({ code });
			let event = ioEvent;
			if (!event) {
				event = await Event.findByCode(code).exec();
				if (!event) throw socket.$fn.t('eventNotFound');
				event.admins = await EventRole.findAdmins(event.id).exec();
				ioEvent = io.$fn.saveEvent(event);
			}
			result.event = event;
			delete result.event.passcode;

			// check user role
			if (socket.$fn.isAuthenticated()) {
				const user = socket.$fn.getUser();
				const eventRole = event.admins.find(r => Number(r.user_id) === Number(user.id));
				if (eventRole) {
					if (eventRole.is_accepted || eventRole.role === 'host') {
						result.role = Roles[eventRole.role];
					}
					else {
						result.role = Roles.guest;
					}
					EventRole.setLastAccessed({
						user_id: user.id,
						event_id: event.id,
					}).exec();
				}
				else {
					EventRole.createOrUpdate({
						event_id: event.id,
						user_id: user.id,
					}, {
						role: 'guest',
						accessed_at: new Date().toISOString(),
					}).exec();
					result.role = Roles.guest;
				}
			}
			else {
				throw {
					expected: 440, // unauthenticated
				};
			}
			socket.$fn.setRole(result.role.name);
			socket.$fn.setEventCode(result.event.code);

			// join role room
			socket.join(ioEvent.rooms.main);
			if (socket.$fn.isAdmin()) {
				socket.join(ioEvent.rooms.admin);
			}
			else {
				socket.join(ioEvent.rooms.guest);
			}

			const onlineUsers = io.$fn.getEventOnlineUsers({ code });
			result.onlineUsers = onlineUsers;
			io.$fn.updateOnlineUsers({ code });

			return socket.emit('get_event', result);
		}
		catch (error) {
			return socket.$fn.handleError(error);
		}
	},

	async editEvent({ io, socket }, info, callback) {
		if (socket.$fn.cannot('editEvent', callback)) return;
		// VALIDATE INFO HERE
		// ..
		const event = socket.$fn.getCurrentEvent();
		const result = {};
		try {
			const Event = new EventModel();
			const newInfo = {
				...info,
				id: event.id,
				code: event.code,
			};
			const editedEvent = await Event.update(newInfo).exec();
			io.$fn.saveEvent({ ...event, ...editedEvent });
			result.event = newInfo;
			delete result.event.password;

			socket.to(event.rooms.main).emit('new_edited_event', newInfo);
			return callback(result);
		}
		catch (e) {
			socket.$fn.handleError(e, callback);
		}
	},
};
