export default {
	name: 'handleMessage',
	created() {
		if (this.flashMessage !== undefined) {
			const message = this.$cookies.get(this.$env.VUE_APP_CK_FLASH_MESSAGE);
			if (message) {
				this.flashMessage = message;
				this.$cookies.remove(this.$env.VUE_APP_CK_FLASH_MESSAGE);
			}
		}
	},
	methods: {
		handleErrorMessages(dataMsg) {
			if (typeof dataMsg === 'string') {
				if (this.errorMessage !== undefined) {
					this.errorMessage = dataMsg;
				}
				else {
					this.showNotify(dataMsg, 'danger');
				}
			}
			else if (typeof dataMsg === 'object') {
				const messages = [];
				for (const key of Object.keys(dataMsg)) {
					if (this.form) {
						if (Object.prototype.hasOwnProperty.call(this.form, key)) {
							this.form[key].errmsg = dataMsg[key];
						}
						else messages.push(dataMsg[key]);
					}
					else messages.push(dataMsg[key]);
				}

				if (messages.length > 0) {
					this.showNotify(messages.join('\n\r'), 'danger');
				}
			}
		},
		showNotify(msg, type, duration) {
			this.$root.$emit('show-noti', {
				msg,
				type: type || '',
				duration,
			});
		},
		hideNotify() {
			this.$root.$emit('hide-noti');
		},
	},
};
