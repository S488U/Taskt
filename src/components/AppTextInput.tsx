import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

type AppTextInputProps = TextInputProps & {
	customClass? : string;
	hasError? : boolean;
}

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
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
				className={`${customClass} ${multiline ? "h-32" : "h-14"} rounded-3xl border font-inter ${hasError ? "border-danger" : "border-border"} px-4 text-lg text-secondary caret-secondary`}
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
