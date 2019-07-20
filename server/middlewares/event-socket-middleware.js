const Translator = requireWrp('modules/translator');
const Roles = requireDir('resources/roles/');
// const Validator = requireWrp('modules/validator-custom');
module.exports = {
	setIO(io) {
		// init state
		io.$state = {
			events: {},
		};

		// init func
		io.$fn = {
			saveEvent(event) {
				const { code } = event;
				const _event = {
					...event,
					rooms: {
						main: `/${code}`,
						admin: `/${code}/admin`,
						guest: `/${code}/guest`,
					},
				};
				io.$state.events[code] = _event;
				return { ..._event };
			},
			getEvent(code) {
				const event = io.$state.events[code];
				return event ? { ...event } : undefined;
			},
			removeEvent(code) {
				delete io.$state.events[code];
			},
			removeEventIfNoClient({ code }) {
				const event = io.$state.events[code];
				if ((
					event
					&& io.adapter.rooms
					&& !io.adapter.rooms[event.rooms.main]
				)
					||	!io.adapter.rooms
				) {
					delete io.$state.events[code];
				}
			},
		};
	},
	setSocket({ io, socket }) {
		if (!socket) return;
		const acceptlangs = socket.request.headers['accept-language'];
		let locales = null;
		if (acceptlangs) {
			locales = acceptlangs.split(';')[0].split(',');
		}
		const translator = new Translator(locales);

		// init state
		socket.$state = socket.$state || {
			locale: translator.locale,
			user: socket.request.session.user || null,
		};

		const { user } = socket.$state;
		if (user) {
			socket.join(`user#${user.username}`);
		}

		// functions
		socket.$fn = {
			t: translator.$t,
			d: translator.$d,
			setSession(key, value) {
				socket.request.session[key] = value;
				socket.request.session.save();
				return true;
			},
			getSession(key) {
				return key ? socket.request.session[key] : socket.request.session;
			},
			reloadSession() {
				socket.request.session.reload((err) => {
					if (err) {
						console.error(err);
					}
					this.setUser(socket.request.session.user || null);
				});
			},
			setLocale(locale) {
				socket.$state.locale = locale;
			},
			setEventCode(code) {
				socket.$state.eventCode = code;
			},
			getEventCode() {
				return socket.$state.eventCode;
			},
			getCurrentEvent() {
				return io.$fn.getEvent(this.getEventCode());
			},
			setUser(_user) {
				socket.$state.user = _user !== null ? { ..._user } : null;
			},
			getUser() {
				return { ...socket.$state.user };
			},
			isAuthenticated() {
				return !!socket.$state.user;
			},
			setRole(role) {
				socket.$state.role = role;
			},
			getRole() {
				return socket.$state.role;
			},
			isAdmin() {
				return ['host', 'moderator'].includes(this.getRole());
			},
			isGuest() {
				return !this.isAdmin();
			},
			addAdmin(admin) {
				const event = this.getCurrentEvent();
				event.admins.push(admin);
				io.$fn.saveEvent(event);
				return true;
			},
			removeAdmin(admin) {
				const event = this.getCurrentEvent();
				const index = event.admins.findIndex(e => e.id === admin.id);
				event.admins.splice(index, 1);
				io.$fn.saveEvent(event);
				return true;
			},
			// check role permissions
			can(permission) {
				const role = this.getRole();
				const { permissions } = Roles[role];
				return permissions[permission];
			},
			cannot(permission, callback) {
				if (this.can(permission)) return false;
				const message = this.t('noPermissionTo', {
					permission: this.t(permission),
				});
				this.handleError(message, callback);
				return true;
			},
			// check event rule
			allow(action) {
				if (this.isAdmin()) return true;
				const event = io.$fn.getEvent(this.getEventCode());
				return event && event[action];
			},
			forbid(action, callback) {
				if (this.allow(action)) return false;
				const message = this.t('forbidTo', {
					action: this.t(action),
				});
				this.handleError(message, callback);
				return true;
			},
			handleError(error, callback) {
				console.error(error);
				// check if error caused by system or user
				let errmsg = this.t('somethingWrong');
				if (typeof error === 'string') {
					errmsg = error;
				}
				else if (error && error.expected) {
					errmsg = error.expected;
				}

				// callback if have
				if (callback) {
					if (typeof callback === 'function') {
						return callback({ errmsg });
					}
					errmsg = 'Callback must be a function!';
				}
				return socket.emit('event_errmsg', { errmsg });
			},
		};
	},
};
