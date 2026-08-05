import AppText from "./AppText";

type SubTitleProps = {
	title: string;
	customClass?: string;
}

const SubTitle = ({ title = "", customClass = "text-secondary" } : SubTitleProps) => {
	return <AppText className={`my-1 px-2 font-interSBold ${customClass}`}>{title}</AppText>;
};

export default SubTitle;
