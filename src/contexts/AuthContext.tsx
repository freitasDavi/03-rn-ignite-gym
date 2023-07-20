import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { ReactNode, createContext, useEffect, useState } from "react";

import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/storageAuthToken";

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (updatedUser: UserDTO) => Promise<void>;
    isLoadingUserStorageData: boolean;
}


export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

type AuthContextProviderProps = {
    children: ReactNode
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDTO>({} as UserDTO);
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

    function updateUserAndToken(userData: UserDTO, token: string) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
    }

    async function saveUserAndTokenInStorage(userData: UserDTO, token: string, refreshToken: string) {
        try {
            await storageUserSave(userData);
            await storageAuthTokenSave({ token, refreshToken });
        } catch (error) {
            throw error;
        }
    }

    async function loadUserData() {
        try {
            setIsLoadingUserStorageData(true);

            const userLogged = await storageUserGet();

            const { token } = await storageAuthTokenGet();

            if (token && userLogged) {
                updateUserAndToken(userLogged, token);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    useEffect(() => {
        loadUserData();
    }, [])

    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(signOut);

        return () => {
            subscribe();
        }
    }, [signOut]);

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post('/sessions', { email, password });

            if (data.user && data.token && data.refresh_token) {
                setIsLoadingUserStorageData(true);

                await saveUserAndTokenInStorage(data.user, data.token, data.refresh_token);
                updateUserAndToken(data.user, data.token);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true);
            setUser({} as UserDTO);
            await storageUserRemove();
            await storageAuthTokenRemove();
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function updateUserProfile(updatedUser: UserDTO) {
        try {
            setUser(updatedUser);

            await storageUserSave(updatedUser);
        } catch (error) {
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            signIn,
            signOut,
            updateUserProfile,
            isLoadingUserStorageData
        }}>
            {children}
        </AuthContext.Provider>
    )
}