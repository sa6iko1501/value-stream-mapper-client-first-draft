import NavBar from "../reusable-components/navbar/NavBar";
import './Dashboards.css'
import { useTranslation } from 'react-i18next';

function Dashboards() {
    const {t} = useTranslation();

    return (
        <div className="dashboards">
            <p>{`${t("dashboards.greeting")}!`}</p>
        </div>
    );
}

export default Dashboards;