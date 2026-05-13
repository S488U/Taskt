import { View, Pressable, Text } from "react-native";
import AppText from "./AppText";

type FloatingButtonProps = {
    icon?: React.ReactElement;
    text?: string;
    onPress: () => void;
}

const FloatingButton = ({ icon, text = "", onPress } : FloatingButtonProps) => {
    return (
        <View className='absolute bottom-[80px] right-6'>
            <Pressable
                className='bg-primary rounded-2xl p-5 flex-row items-center gap-3 shadow-lg shadow-primary/50 active:opacity-90'
                onPress={onPress}
            >
                {icon && <View>{icon}</View>}

                {text ? (
                    <AppText className='text-surface font-interSBold text-lg'>
                        {text}
                    </AppText>
                ) : null}
            </Pressable>
        </View>
    );
};

export default FloatingButton;