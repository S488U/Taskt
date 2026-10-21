import { Text, TextProps } from "react-native";

const AppText = (props: TextProps) => {
	return <Text {...props} className={`font-inter ${props.className}`} />;
};

export default AppText;
