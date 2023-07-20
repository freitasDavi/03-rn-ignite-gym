import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";
import { AppError } from "@utils/AppError";
import axios, { AxiosError, AxiosInstance } from "axios";

type PromiseType = {
    onSuccess: (token: string) => void;
    onError: (error: AxiosError) => void;
};

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

let failedQueue: Array<PromiseType> = [];
let isRefreshing = false;

const api = axios.create({
    baseURL: "http://192.168.15.112:3333"
}) as APIInstanceProps;

api.registerInterceptTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.response.use(response => response, async (requestError) => {

        if (requestError?.response?.status === 401) {
            if (requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
                const { refreshToken } = await storageAuthTokenGet();

                console.log('CAI NO 401', refreshToken);

                if (!refreshToken) {
                    signOut();

                    return Promise.reject(requestError);
                }

                const originalRequestConfig = requestError.config;

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                                resolve(api(originalRequestConfig));
                            },
                            onError: (error) => {
                                reject(error);
                            },
                        });
                    })
                }

                isRefreshing = true;

                return new Promise(async (resolve, reject) => {
                    try {
                        const { data } = await api.post("/sessions/refresh-token", {
                            refresh_token: refreshToken
                        });

                        await storageAuthTokenSave({ token: data.token, refreshToken: data.refresh_token });

                        if (originalRequestConfig.data) {
                            originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
                        }

                        originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

                        failedQueue.forEach((request) => {
                            request.onSuccess(data.token);
                        })

                        console.log("TOKEN ATUALIZADO");

                        resolve(api(originalRequestConfig));

                    } catch (err: any) {
                        failedQueue.forEach((request) => {
                            request.onError(err);
                        });

                        signOut();
                        reject();
                    } finally {
                        isRefreshing = false;
                        failedQueue = [];
                    }
                })
            }

            signOut();
        }


        if (requestError.response && requestError.response.data) {
            return Promise.reject(new AppError(requestError.response.data.message));
        }

        return Promise.reject(requestError);
    });

    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    }
}



export { api }