import axios from 'axios';
import cookies from './vue-cookies-custom';
import router from '@/router';

const {
	VUE_APP_CK_USER: user,
	VUE_APP_CK_FLASH_MESSAGE: flashMsg,
} = process.env;

axios.interceptors.response.use(
	response => response,
	(error) => {
		let errorResult = {};
		if (error.response) {
			if (error.response.status === 401) {
				cookies.remove(user);
				try {
					cookies.set(flashMsg, error.response.data.messages.authenticate);
				}
				catch (e) {
					// do nothing
				}
				router.push({ name: 'login' });
			}
			errorResult = { ...errorResult, ...error.response.data };
		}
		else {
			errorResult = { messages: 'Server not responding' };
		}
		return Promise.reject(errorResult);
	}
);

export default axios;
