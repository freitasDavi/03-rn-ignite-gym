import { HistoryCard } from "@components/HistoryCard";
import { Loading } from "@components/Loading";
import { ScreenHeader } from "@components/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { Heading, VStack, SectionList, Text, useToast } from "native-base";
import { useCallback, useState } from "react";



export function History() {
    const [exercises, setExercises] = useState([
        {
            title: "26.08.22",
            data: ["Puxada frontal", "Remada unilateral"]
        },
        {
            title: "27.08.22",
            data: ["Puxada frontal"]
        }
    ]);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);

    async function fetchHistory() {
        try {
            setIsLoading(true);

            const response = await api.get("/history");

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível recuperar o histórico.'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []))

    return (
        <VStack flex={1}>
            <ScreenHeader title="Histórico de Exercícios" />
            {
                isLoading ? <Loading />
                    : (


                        <SectionList
                            sections={exercises}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <HistoryCard />
                            )}
                            px={8}
                            renderSectionHeader={({ section }) => (
                                <Heading color="gray.200" fontSize="md" mt={10} mb={3} fontFamily="heading">
                                    {section.title}
                                </Heading>
                            )}
                            contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: "center" }}
                            ListEmptyComponent={() => (
                                <Text color="gray.100" textAlign="center">
                                    Não há exercícios registrados ainda. {'\n'}
                                    Vamos fazer exercícios hoje?
                                </Text>
                            )}
                        />
                    )
            }
        </VStack>
    )
}