import settings, {
    actionTypes,
    mutationTypes,
} from '@settings/index';
import jwt, { actionTypes as jwtActionTypes } from '@settings/jwt';
import profile, { mutationTypes as profileMutationTypes } from '@settings/profile';
import theme, { mutationTypes as themeMutationTypes } from '@settings/theme';

jest.mock('@/api', () => ({
    __esmodule: true, // babel var to use named exports
    userApi: {
        fetchUser: jest.fn(),
    },
}));
import { userApi } from '@/api';

describe('Main settings Vuex module', () => {
    it('returns vuex module', () => {
        const s = settings;
        expect(s).toEqual(expect.objectContaining({
            namespaced: false,
            modules: {
                jwt,
                profile,
                theme,
            },
            state: expect.any(Object),
            mutations: expect.any(Object),
            actions: expect.any(Object),
        }));
    });

    describe('state', () => {
        describe.each`
            propName        | propDefault
            ${'error'}      | ${null}
            ${'isLoading'}  | ${null}
            ${'isLoggedIn'} | ${null}
        `('$propName', ({ propName, propDefault }) => {
            it('exists', () => {
                expect(settings.state).toHaveProperty(propName);
            });

            it(`has default value of "${propDefault}"`, () => {
                const property = settings.state[propName];
                expect(property).toBe(propDefault);
            });
        });
    });

    describe('mutations', () => {
        let state;
        beforeEach(() => {
            state = {
                error: null,
                isLoading: null,
                isLoggedIn: null,
            };
        });

        describe('[SET_PENDING]', () => {
            const { [mutationTypes.SET_PENDING]: setPending } = settings.mutations;

            it.each`
                statePropName   | statePropValue
                ${'error'}      | ${null}
                ${'isLoading'}  | ${true}
                ${'isLoggedIn'} | ${false}
            `('sets $statePropName to $statePropValue', ({ statePropName, statePropValue }) => {
                setPending(state);
                expect(state[statePropName]).toBe(statePropValue);
            });
        });

        describe('[SET_LOGGED_IN]', () => {
            const { [mutationTypes.SET_LOGGED_IN]: setLoggedIn } = settings.mutations;

            it.each`
                statePropName   | statePropValue
                ${'error'}      | ${null}
                ${'isLoading'}  | ${false}
                ${'isLoggedIn'} | ${true}
            `('sets $statePropName to $statePropValue', ({ statePropName, statePropValue }) => {
                setLoggedIn(state);
                expect(state[statePropName]).toBe(statePropValue);
            });
        });

        describe('[SET_NOT_LOGGED_IN]', () => {
            const { [mutationTypes.SET_NOT_LOGGED_IN]: setNotLoggedIn } = settings.mutations;

            it.each`
                statePropName   | statePropValue
                ${'error'}      | ${null}
                ${'isLoading'}  | ${false}
                ${'isLoggedIn'} | ${false}
            `('sets $statePropName to $statePropValue', ({ statePropName, statePropValue }) => {
                setNotLoggedIn(state);
                expect(state[statePropName]).toBe(statePropValue);
            });
        });

        describe('[SET_LOGIN_ERROR]', () => {
            const { [mutationTypes.SET_LOGIN_ERROR]: setLoginError } = settings.mutations;

            it('sets [error] to error object', () => {
                const error = new Object();
                setLoginError(state, error);
                expect(state.error).toBe(error);
            });

            it.each`
                statePropName   | statePropValue
                ${'isLoading'}  | ${false}
                ${'isLoggedIn'} | ${null}
            `('sets $statePropName to $statePropValue', ({ statePropName, statePropValue }) => {
                setLoginError(state, 'any error');
                expect(state[statePropName]).toBe(statePropValue);
            });
        });
    });

    describe('actions', () => {
        let context;
        beforeEach(() => {
            context = {
                commit: jest.fn(),
                dispatch: jest.fn(),
            };
        });

        describe('[USER_PENDING]', () => {
            const { [actionTypes.USER_PENDING]: userPending } = settings.actions;
            const jwtPayload = {
                profile: new Object(),
            };

            it('commits twice', () => {
                userPending(context, jwtPayload);
                expect(context.commit).toHaveBeenCalledTimes(2);
            });

            it('commits [SET_PENDING]', () => {
                userPending(context, jwtPayload);
                expect(context.commit).toHaveBeenCalledWith(mutationTypes.SET_PENDING);
            });

            it('commits [profile.SET_PROFILE] with jwtPayload.profile', () => {
                userPending(context, jwtPayload);
                expect(context.commit).toHaveBeenCalledWith(profileMutationTypes.SET_PROFILE, jwtPayload.profile);
            });
        });

        describe('[USER_AUTHENTICATED]', () => {
            const { [actionTypes.USER_AUTHENTICATED]: userAuthenticated } = settings.actions;
            const data = {
                profile: new Object(),
                settings: {
                    darkTheme: new Boolean(),
                },
            };

            it('commits 3 times', () => {
                userAuthenticated(context, data);
                expect(context.commit).toHaveBeenCalledTimes(3);
            });

            it('commits [SET_LOGGED_IN]', () => {
                userAuthenticated(context, data);
                expect(context.commit).toHaveBeenCalledWith(mutationTypes.SET_LOGGED_IN);
            });

            it('commits [profile.SET_PROFILE] with data.profile', () => {
                userAuthenticated(context, data);
                expect(context.commit).toHaveBeenCalledWith(profileMutationTypes.SET_PROFILE, data.profile);
            });

            it('commits [theme.SET_DARK_THEME] with data.profile', () => {
                userAuthenticated(context, data);
                expect(context.commit).toHaveBeenCalledWith(themeMutationTypes.SET_DARK_THEME, data.settings.darkTheme);
            });
        });

        describe('[USER_UNAUTHENTICATED]', () => {
            const { [actionTypes.USER_UNAUTHENTICATED]: userUnauthenticated } = settings.actions;

            it('commits twice', () => {
                userUnauthenticated(context);
                expect(context.commit).toHaveBeenCalledTimes(2);
            });

            it('commits [SET_NOT_LOGGED_IN]', () => {
                userUnauthenticated(context);
                expect(context.commit).toHaveBeenCalledWith(mutationTypes.SET_NOT_LOGGED_IN);
            });

            it('commits [profile.CLEAR_PROFILE] with jwtPayload.profile', () => {
                userUnauthenticated(context);
                expect(context.commit).toHaveBeenCalledWith(profileMutationTypes.CLEAR_PROFILE);
            });
        });

        describe('[USER_AUTH_ERROR]', () => {
            const { [actionTypes.USER_AUTH_ERROR]: userAuthError } = settings.actions;

            it.skip('commits twice', () => {
                userAuthError(context);
                expect(context.commit).toHaveBeenCalledTimes(2);
            });

            it.skip('commits [SET_LOGIN_ERROR]', () => {
                userAuthError(context);
                expect(context.commit).toHaveBeenCalledWith(mutationTypes.SET_LOGIN_ERROR);
            });

            it('commits [profile.CLEAR_PROFILE]', () => {
                userAuthError(context);
                expect(context.commit).toHaveBeenCalledWith(profileMutationTypes.CLEAR_PROFILE);
            });
        });

        describe('[CHECK_AUTH] flows', () => {
            const { [actionTypes.CHECK_AUTH]: checkAuth } = settings.actions;
            beforeEach(() => {
                context = {
                    ...context,
                    getters: {
                        jwtPayload: null,
                    },
                };
            });

            it('no valid jwt payload', async () => {
                context.getters.jwtPayload = null;
                await checkAuth(context);
                const dispatches = context.dispatch.mock.calls[Symbol.iterator]();
                expect(dispatches.next().value).toEqual([jwtActionTypes.LOAD_JWT]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_UNAUTHENTICATED]);
                expect(dispatches.next().done).toEqual(true);
            });

            it('valid jwt, fetch status 401', async () => {
                const jwtPayload = new Object();
                context.getters.jwtPayload = jwtPayload;
                const fetchResponse = {
                    ok: false,
                    status: 401,
                };
                userApi.fetchUser.mockImplementationOnce(() => fetchResponse);
                await checkAuth(context);
                const dispatches = context.dispatch.mock.calls[Symbol.iterator]();
                expect(dispatches.next().value).toEqual([jwtActionTypes.LOAD_JWT]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_PENDING, jwtPayload]);
                expect(dispatches.next().value).toEqual([jwtActionTypes.CLEAR_JWT]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_UNAUTHENTICATED]);
                expect(dispatches.next().done).toEqual(true);
            });

            it('valid jwt, fetch status non-401 error', async () => {
                const jwtPayload = new Object();
                context.getters.jwtPayload = jwtPayload;
                const fetchResponse = {
                    ok: false,
                    status: 500,
                };
                userApi.fetchUser.mockImplementationOnce(() => fetchResponse);
                await checkAuth(context);
                const dispatches = context.dispatch.mock.calls[Symbol.iterator]();
                expect(dispatches.next().value).toEqual([jwtActionTypes.LOAD_JWT]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_PENDING, jwtPayload]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_AUTH_ERROR]);
                expect(dispatches.next().done).toEqual(true);
            });

            it('valid jwt, valid fetch', async () => {
                const jwtPayload = new Object();
                context.getters.jwtPayload = jwtPayload;
                const fetchedUser = new Object();
                const fetchResponse = {
                    ok: true,
                    json: () => fetchedUser,
                };
                userApi.fetchUser.mockImplementationOnce(() => fetchResponse);
                await checkAuth(context);
                const dispatches = context.dispatch.mock.calls[Symbol.iterator]();
                expect(dispatches.next().value).toEqual([jwtActionTypes.LOAD_JWT]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_PENDING, jwtPayload]);
                expect(dispatches.next().value).toEqual([actionTypes.USER_AUTHENTICATED, fetchedUser]);
                expect(dispatches.next().done).toEqual(true);
            });
        });
    });
});
