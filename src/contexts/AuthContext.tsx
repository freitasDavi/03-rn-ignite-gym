import { UserDTO } from "@dtos/UserDTO";
import { ReactNode, createContext, useState } from "react";

export type AuthContextDataProps = {
    user: UserDTO
}


export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

type AuthContextProviderProps = {
    children: ReactNode
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDTO>({
        id: '1',
        name: "Davi",
        avatar: ""
    });

    return (
        <AuthContext.Provider value={{
            user
        }}>
            {children}
        </AuthContext.Provider>
    )
}