
import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from 'native-base';

import LogoSvg from "@assets/logo.svg";
import BackgroundImg from "@assets/background.png";
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigatorRouteProps } from '@routes/auth.routes';
import { useAuth } from '@hooks/useAuth';
import { useForm, Controller } from "react-hook-form";
import { AppError } from '@utils/AppError';
import { useState } from 'react';

type LoginFormData = {
    email: string;
    password: string;
}

export function SignIn() {
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
    const { signIn } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation<AuthNavigatorRouteProps>();

    function handleNewAccount() {
        navigation.navigate('signUp');
    }

    async function handleSignIn({ email, password }: LoginFormData) {
        try {
            setIsLoading(true);
            await signIn(email, password);
        } catch (err) {
            const isAppError = err instanceof AppError;
            const title = isAppError ? err.message : "Não foi possível entrar. Tente novamente mais tarde."

            if (isAppError) {
                toast.show({
                    title,
                    placement: "top",
                    bg: "red.500"
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} >
            <VStack flex={1} px={10} pb={16} >
                <Image
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt='Pessoas treinando na bicicleta'
                    resizeMode='contain'
                    position="absolute"
                />
                <Center my={24}>
                    <LogoSvg />
                    <Text color="gray.100" fontSize="sm">Treine sua mente e o corpo</Text>
                </Center>

                <Center>
                    <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
                        Acesse sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name='email'
                        rules={{
                            required: "Informe o email"
                        }}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder='E-mail'
                                keyboardType='email-address'
                                autoCapitalize='none'
                                onChangeText={onChange}
                                errorMessage={errors?.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder='Senha'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors?.password?.message}
                            />
                        )}

                    />

                    <Button
                        title='Acessar'
                        onPress={handleSubmit(handleSignIn)}
                        isLoading={isLoading}
                    />
                </Center>

                <Center mt={24}>
                    <Text color="gray.100" fontSize="sm" mb={3} fontFamily="heading">Ainda não tem acesso?</Text>

                    <Button title='Criar conta' variant="outline" onPress={handleNewAccount} />
                </Center>
            </VStack>
        </ScrollView>
    );
}