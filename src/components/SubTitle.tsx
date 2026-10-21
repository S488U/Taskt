import AppText from "./AppText";

type SubTitleProps = {
	title: string;
	customClass?: string;
};

const SubTitle = ({ title = "", customClass = "text-secondary" }: SubTitleProps) => {
	return <AppText className={`font-interSBold my-1 px-2 ${customClass}`}>{title}</AppText>;
};

export default SubTitle;
