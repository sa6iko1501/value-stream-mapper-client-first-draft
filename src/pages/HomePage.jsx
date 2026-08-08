import './HomePage.css'
import { useTranslation } from 'react-i18next';

function HomePage() {
    const {t} = useTranslation();

    return (
        <div className="home-page">
            <h1>{`${t("home-screen.hello-label")}!`}</h1>

            <img src="src\assets\FullLogo_Transparent.png"></img>
            <p>{`${t("home-screen.message")}!`}</p>
        </div>
    );
}

export default HomePage;