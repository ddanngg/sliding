/* ------------------------------------------------------ *
@desc: Dashboard view all events (active, pass)
 * ------------------------------------------------------ */

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
	events: [],
	invites: [],
};

export default {
	namespaced: true,
	state,
	actions,
	getters,
	mutations,
};
