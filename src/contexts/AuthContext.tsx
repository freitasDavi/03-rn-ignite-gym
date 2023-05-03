import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { ReactNode, createContext, useEffect, useState } from "react";

import { storageUserGet, storageUserSave } from "@storage/storageUser";

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
}


export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

type AuthContextProviderProps = {
    children: ReactNode
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDTO>({} as UserDTO);

    async function loadUserData() {
        const userLogged = await storageUserGet();

        if (userLogged) {
            setUser(userLogged);
        }
    }

    useEffect(() => {
        loadUserData();
    }, [])

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post('/sessions', { email, password });

            if (data.user) {
                setUser(data.user);
                storageUserSave(data.user);
            }
        } catch (error) {
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            signIn
        }}>
            {children}
        </AuthContext.Provider>
    )
}