import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const PHOTO_SIZE = 33;

export function Profile() {
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState("https://github.com/freitasDavi.png");

    const toast = useToast();

    async function handleUserSelectPhoto() {
        setPhotoIsLoading(true);
        try {
            const selectedPhoto = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
            });

            if (selectedPhoto.canceled) {
                return;
            }

            if (selectedPhoto.assets[0].uri) {
                const photoInfo = await FileSystem.getInfoAsync(selectedPhoto.assets[0].uri);

                if (photoInfo.exists && ((photoInfo.size / 1024 / 1024) > 5)) {
                    return toast.show({
                        title: "Essa imagem é muito grande. Escolha uma até 5mb",
                        placement: 'top',
                        bgColor: 'red.500'
                    })
                }

                setUserPhoto(selectedPhoto.assets[0].uri);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setPhotoIsLoading(false);
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader
                title="Perfil"
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 56 }}>
                <Center mt={6} px={10}>
                    {photoIsLoading ? (
                        <Skeleton
                            w={PHOTO_SIZE}
                            h={PHOTO_SIZE}
                            rounded="full"
                            startColor="gray.500"
                            endColor="gray.300"
                        />

                    ) : (
                        <UserPhoto
                            source={{ uri: userPhoto }}
                            alt="Foto do usuário"
                            size={PHOTO_SIZE}
                        />
                    )}
                    <TouchableOpacity onPress={handleUserSelectPhoto}>
                        <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Input
                        bg="gray.600"
                        placeholder="Nome"
                    />

                    <Input
                        bg="gray.600"
                        value="davi@gmail.com"
                        isDisabled
                    />
                </Center>
                <VStack px={10} mt={12} mb={9}>
                    <Heading fontSize="md" color="gray.200" mb={2} fontFamily="heading">
                        Alterar senha
                    </Heading>

                    <Input
                        bg="gray.600"
                        placeholder="Senha antiga"
                        secureTextEntry
                    />

                    <Input
                        bg="gray.600"
                        placeholder="Nova senha"
                        secureTextEntry
                    />

                    <Input
                        bg="gray.600"
                        placeholder="Confirme a nova senha"
                        secureTextEntry
                    />

                    <Button
                        title="Atualizar"
                        mt={4}
                    />
                </VStack>
            </ScrollView>
        </VStack>
    )
}