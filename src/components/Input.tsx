import { Input as NativeInput, IInputProps, FormControl } from "native-base"

type InputProps = IInputProps & {
    errorMessage?: string;
}

export function Input({ errorMessage, isInvalid, ...rest }: InputProps) {
    const invalid = !!errorMessage || isInvalid;

    return (
        <FormControl isInvalid={invalid} mb={4}>
            <NativeInput
                bg="gray.700"
                h={14}
                px={4}
                borderWidth={0}
                fontSize="md"
                color="white"
                fontFamily="body"
                placeholderTextColor="gray.300"
                _focus={{
                    bg: "gray.700",
                    borderWidth: 1,
                    borderColor: "green.500"
                }}
                isInvalid={invalid}
                _invalid={{
                    borderWidth: 1,
                    borderColor: "red.500"
                }}
                {...rest}
            />
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>

    )
}