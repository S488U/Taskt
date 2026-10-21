import { forwardRef } from "react";
import { TextInput, type TextInputInstance, type TextInputProps } from "react-native";

type AppTextInputProps = TextInputProps & {
	customClass?: string;
	hasError?: boolean;
};

const AppTextInput = forwardRef<TextInputInstance, AppTextInputProps>(
	(
		{
			customClass = "",
			multiline = false,
			hasError = false,
			placeholderTextColor = "#64748B",
			placeholder = "",
			value = "",
			onChangeText,
			...props
		},
		ref
	) => {
		return (
			<TextInput
				ref={ref}
				className={`${customClass} ${multiline ? "h-32" : "h-14"} font-inter rounded-3xl border ${hasError ? "border-danger" : "border-border"} text-secondary caret-secondary px-4 pr-4 pl-4 text-lg`}
				textAlignVertical={multiline ? "top" : "center"}
				placeholder={placeholder}
				multiline={multiline}
				placeholderTextColor={placeholderTextColor}
				value={value}
				onChangeText={onChangeText}
				autoCapitalize="none"
				autoCorrect={false}
				autoFocus={!multiline}
				spellCheck={false}
				{...props}
			/>
		);
	}
);

export default AppTextInput;
