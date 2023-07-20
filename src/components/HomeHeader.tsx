import { HStack, Heading, Text, VStack, Icon } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { UserPhoto } from "./UserPhoto";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@hooks/useAuth";

import defaultUserImage from "@assets/userPhotoDefault.png";
import { api } from "@services/api";

export function HomeHeader() {
    const { user, signOut } = useAuth();

    const handleUserLogout = () => {
        signOut();
    }

    return (
        <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems="center">
            <UserPhoto
                size={16}
                source={user.avatar ?
                    { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                    : defaultUserImage}
                alt="user photo"
                mr={4}
            />
            <VStack flex={1}>
                <Text color="gray.100" fontSize="md">Olá</Text>
                <Heading color="gray.100" fontSize="md" fontFamily="heading">
                    {user.name}
                </Heading>
            </VStack>
            <TouchableOpacity onPress={handleUserLogout}>
                <Icon
                    as={MaterialIcons}
                    name="logout"
                    color="gray.200"
                    size={7}
                />
            </TouchableOpacity>

        </HStack>
    )
}