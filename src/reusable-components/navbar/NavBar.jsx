import './NavBar.css'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next';
import { changeLanguage } from 'i18next';
import { useEffect, useState } from 'react';

function NavBar() {
    const languageCodes = [
        { code: "en", label: "En" },
        { code: "bg", label: "Бг" }
    ]
    const [activeLanguage, setActiveLanguage] = useState(() => {

        const savedLanguage = localStorage.getItem("language");

        return languageCodes.find(
            language => language.code === savedLanguage
        ) || languageCodes[0];
    });
    const { t } = useTranslation();

    const renderLanguage = useEffect(() => {
        changeLanguage(activeLanguage.code)
    }, [activeLanguage])

    const handleChangeLanguage = () => {
        if (activeLanguage.code === "en") {
            setActiveLanguage(activeLanguage => languageCodes.filter(x => x.code === "bg").at(0))
        }
        else {
            setActiveLanguage(activeLanguage => languageCodes.filter(x => x.code === "en").at(0))
        }
    }

    useEffect(() => {
        changeLanguage(activeLanguage.code);
        localStorage.setItem("language", activeLanguage.code);
    }, [activeLanguage]);

    return (
        <nav className="navbar">
            <Link className="navbar-link" to="/" className="navbar-logo">
                <img src="src\assets\Icon_Transparent.png" alt="Logo" />
            </Link>
            <ul>
                <li>
                    <Link className="navbar-link" to="/dashboards">
                        <div className='navbar-item'>
                            <p>
                                {t("nav-bar.dashboards-label")}
                            </p>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link className="navbar-link" to="/value-stream-maps">
                        <div className='navbar-item'>
                            <p>
                                {t("nav-bar.vs-maps-label")}
                            </p>
                        </div>
                    </Link>
                </li>
                <li>
                    <div className='language-switch'>
                        <p>{`${t("nav-bar.language-label")}: ${activeLanguage.label}`}</p>
                        <button
                            className={`language-toggle ${activeLanguage.code === 'bg' ? 'active' : ''}`}
                            onClick={handleChangeLanguage}
                            aria-label={`Switch to ${activeLanguage.code === 'en' ? 'Bulgarian' : 'English'}`}
                        >
                            <span className="toggle-knob"></span>
                        </button>
                    </div>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;