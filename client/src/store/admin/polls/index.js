/* ------------------------------------
@desc: get all polls in event
------------------------------------*/

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
	polls: [],
	editInfo: null,
};

export default {
	namespaced: true,
	state,
	actions,
	getters,
	mutations,
};
