import { View } from "react-native";
import AppText from "./AppText";

interface HeaderProps {
	title: string;
	customClass?: string;
}

const Header = ({ title = "Todo Personal", customClass }: HeaderProps) => {
	return (
		<View className="w-full">
			<AppText
				className={`font-interSBold text-text capitalize ${
					customClass ? customClass : "text-4xl leading-[44px]"
				}`}
			>
				{title}
			</AppText>
		</View>
	);
};

export default Header;
