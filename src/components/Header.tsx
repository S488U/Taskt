import { View } from 'react-native';
import AppText from "./AppText";

const Header = ({ title = "Todo Personal" } : { title: string }) => {
    
    return (
        <View className='w-full'>
            <AppText className='font-interSBold capitalize text-4xl text-text leading-[44px]'>
                {title}
            </AppText>
        </View>
    );
};

export default Header;
