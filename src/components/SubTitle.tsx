import AppText from "./AppText";

type SubTitleProps = {
	title: string;
	customClass?: string;
}

const SubTitle = ({ title = "", customClass = "text-secondary" } : SubTitleProps) => {
	return <AppText className={` ${customClass} my-1 px-2 font-interSBold`}>{title}</AppText>;
};

export default SubTitle;
