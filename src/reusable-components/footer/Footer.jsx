import './Footer.css'
import { useTranslation } from 'react-i18next';

function Footer() {
    const {t} = useTranslation();

    return (
        <div className="footer">
            <p>Value-Stream Mapper</p>
            <p>{t("footer.author")}</p>
            <div className='github-info-container'>
                <a href="https://github.com/sa6iko1501" target="_blank">
                    <img src="src\assets\github-logo.png"></img>
                    <p>{`${t("footer.git-message")}!`}</p>
                </a>
            </div>
        </div>
    );
}

export default Footer;