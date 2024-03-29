import Router from 'vue-router';
// eslint-disable-next-line
import AuthMdw from './middlewares/auth-middleware';

// Page Layout
import Page from './layouts/Page.vue';

// Home
import Home from './views/Home.vue';

// Authentication
const AuthLayout = () => import(/* webpackChunkName: "auth-layout" */ './layouts/auth');
const Login = () => import(/* webpackChunkName: "login" */ './views/auth/Login.vue');
const Signup = () => import(/* webpackChunkName: "signup" */ './views/auth/Signup.vue');
const Logout = () => import(/* webpackChunkName: "logout" */ './views/auth/Logout.vue');

const PageNotFound = () => import(/* webpackChunkName: "pagenotfound" */ './views/PageNotFound.vue');

// Dashboard
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ './layouts/dashboard');
const MyEvents = () => import(/* webpackChunkName: "my-events" */ './views/dashboard/MyEvents.vue');
const CoopEvents = () => import(/* webpackChunkName: "coop-events" */ './views/dashboard/CoopEvents.vue');

// Admin
const AdminLayout = () => import(/* webpackChunkName: "admin" */ './layouts/admin');
const AdminQuestions = () => import(/* webpackChunkName: "admin-questions" */ './views/admin/Questions.vue');
const AdminPolls = () => import(/* webpackChunkName: "admin-polls" */ './views/admin/Polls.vue');
const AdminAnalytics = () => import(/* webpackChunkName: "admin-analytics" */ './views/admin/Analytics.vue');

// Guest
const GuestLayout = () => import(/* webpackChunkName: "guest" */ './layouts/guest');
const GuestQuestions = () => import(/* webpackChunkName: "guest-questions" */ './views/guest/Questions.vue');
const GuestPolls = () => import(/* webpackChunkName: "guest-polls" */ './views/guest/Polls.vue');

// Search
const SearchLayout = () => import(/* webpackChunkName: "search" */ './layouts/search');
const Search = () => import(/* webpackChunkName: "search-event" */ './views/search/Search.vue');
const EventVerify = () => import(/* webpackChunkName: "search-event-verify" */ './views/search/EventVerify.vue');

const router = new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			component: Page,
			redirect: { name: 'home' },
			children: [
				{
					path: '/',
					name: 'home',
					component: Home,
					meta: {
						title: 'Sliding - Event Supporter',
					},
				},
				{
					path: 'search',
					name: 'search',
					component: SearchLayout,
					redirect: { name: 'search-event' },
					children: [
						{
							path: '/',
							name: 'search-event',
							component: Search,
							meta: {
								title: 'Sliding - Search event',
							},
						},
						{
							path: 'event/verify',
							name: 'event-verify',
							component: EventVerify,
							meta: {
								title: 'Sliding - Welcome',
							},
						},
					],
				},
				{
					path: '/',
					name: 'auth',
					component: AuthLayout,
					redirect: { name: 'login' },
					children: [
						{
							path: 'login',
							name: 'login',
							beforeEnter: AuthMdw.beforeEnterLogin,
							component: Login,
							meta: {
								title: 'Login',
							},
						},
						{
							path: 'signup',
							name: 'signup',
							beforeEnter: AuthMdw.beforeEnterLogin,
							component: Signup,
							meta: {
								title: 'Signup',
							},
						},
						{
							path: 'logout',
							name: 'logout',
							component: Logout,
							meta: {
								title: 'Logout...',
							},
						},
					],
				},
				{
					path: 'dashboard',
					name: 'dashboard',
					component: Dashboard,
					beforeEnter: AuthMdw.guard,
					redirect: { name: 'my-events' },
					children: [
						{
							path: 'my-events',
							name: 'my-events',
							component: MyEvents,
							meta: {
								title: 'My Events',
							},
						},
						{
							path: 'coop-events',
							name: 'coop-events',
							component: CoopEvents,
							meta: {
								title: 'Co-op Events',
							},
						},
					],
				},
				{
					path: 'event/:code',
					redirect: '/guest/event/:code',
				},
				{
					path: 'admin/event/:code',
					name: 'admin-event',
					component: AdminLayout,
					redirect: { name: 'admin-questions' },
					children: [
						{
							path: 'questions',
							name: 'admin-questions',
							component: AdminQuestions,
							meta: {
								title: 'Questions',
							},
						},
						{
							path: 'polls',
							name: 'admin-polls',
							component: AdminPolls,
							meta: {
								title: 'Polls',
							},
						},
						{
							path: 'analytics',
							name: 'admin-analytics',
							component: AdminAnalytics,
							meta: {
								title: 'Analytics',
							},
						},
					],
				},
				{
					path: 'guest/event/:code',
					name: 'guest-event',
					component: GuestLayout,
					redirect: { name: 'guest-questions' },
					children: [
						{
							path: 'questions',
							name: 'guest-questions',
							component: GuestQuestions,
							meta: {
								title: 'Questions',
							},
						},
						{
							path: 'polls',
							name: 'guest-polls',
							component: GuestPolls,
							meta: {
								title: 'Polls',
							},
						},
					],
				},
				{
					path: '*',
					name: 'page-not-found',
					component: PageNotFound,
					meta: {
						title: 'Page Not Found',
					},
				},
			],
		},
	],
});

router.afterEach((to, from) => {
	document.title = `${to.meta.title || ' '}`;
});

export default router;
