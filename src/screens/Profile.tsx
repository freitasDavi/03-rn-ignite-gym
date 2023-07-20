import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import defaultUserImage from "@assets/userPhotoDefault.png";

import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

const PHOTO_SIZE = 33;

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    oldPassword: string;
    confirmPassword: string;
}

const profileSchema = yup.object({
    name: yup.string().required("Informe o nome"),
    password: yup.string().min(6, 'A senha deve ter pelo menos 6 digítos.').nullable().transform((value) => !!value ? value : null),
    confirmPassword: yup.string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password')], 'A Confirmação de senha não bate.')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) => schema.nullable().transform((value) => !!value ? value : null).required("Informe a confirmação de senha"),
        })
})

export function Profile() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const { user, updateUserProfile } = useAuth();

    const toast = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    });

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

                const fileExtension = selectedPhoto.assets[0].uri.split(".").pop();

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: selectedPhoto.assets[0].uri,
                    type: `${selectedPhoto.assets[0].type}/${fileExtension}`
                } as any

                const userPhotoUploadForm = new FormData();

                userPhotoUploadForm.append('avatar', photoFile);

                const updatedUserResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                    headers: {
                        'Content-Type': "multipart/form-data"
                    }
                });

                const userUpdated = user;
                userUpdated.avatar = updatedUserResponse.data.avatar;
                updateUserProfile(userUpdated);

                toast.show({
                    title: "Foto atualizada",
                    placement: "top",
                    bgColor: "green.500"
                })
            }

        } catch (err) {
            console.error(err);
        } finally {
            setPhotoIsLoading(false);
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setIsUpdating(true);

            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put('/users', {
                name: data.name,
                password: data.password,
                confirm_password: data.confirmPassword,
                old_password: data.oldPassword,
                email: data.email
            });

            await updateUserProfile(userUpdated);

            toast.show({
                title: "Perfil atualizado com sucesso",
                placement: 'top',
                bgColor: 'green.500'
            })

        } catch (err) {
            const isAppError = err instanceof AppError;
            const title = isAppError ? err.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })

        } finally {
            setIsUpdating(false);
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
                            source={{ uri: user.avatar ? `${api.defaults.baseURL}/avatar/${user.avatar}` : defaultUserImage }}
                            alt="Foto do usuário"
                            size={PHOTO_SIZE}
                        />
                    )}
                    <TouchableOpacity onPress={handleUserSelectPhoto}>
                        <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => <Input
                            bg="gray.600"
                            value={value}
                            onChangeText={onChange}
                            placeholder="Nome"
                            errorMessage={errors.name?.message}
                        />}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { value, onChange } }) => <Input
                            bg="gray.600"
                            value={value}
                            onChangeText={onChange}
                            placeholder="davi@gmail.com"
                            isDisabled
                        />}
                    />
                </Center>
                <VStack px={10} mt={12} mb={9}>
                    <Heading fontSize="md" color="gray.200" mb={2} fontFamily="heading">
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        name="oldPassword"
                        render={({ field: { value, onChange } }) => <Input
                            bg="gray.600"
                            value={value}
                            onChangeText={onChange}
                            placeholder="Senha antiga"
                            secureTextEntry
                        />}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { value, onChange } }) => <Input
                            bg="gray.600"
                            value={value}
                            onChangeText={onChange}
                            placeholder="Nova senha"
                            secureTextEntry
                            errorMessage={errors.password?.message}
                        />}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { value, onChange } }) => <Input
                            bg="gray.600"
                            value={value}
                            onChangeText={onChange}
                            placeholder="Confirme a senha"
                            secureTextEntry
                            errorMessage={errors.confirmPassword?.message}
                        />}
                    />


                    <Button
                        title="Atualizar"
                        mt={4}
                        isLoading={isUpdating}
                        onPress={handleSubmit(handleProfileUpdate)}
                    />
                </VStack>
            </ScrollView>
        </VStack>
    )
}