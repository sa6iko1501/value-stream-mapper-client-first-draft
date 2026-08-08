import NavBar from "../reusable-components/navbar/NavBar";
import './VSMaps.css'
import { useTranslation } from "react-i18next";

function VSMaps() {
    const {t} = useTranslation();

    return (
        <div className="value-stream-maps">
            <p>{`${t("vs-maps.greeting")}`}</p>
        </div>
    );
}

export default VSMaps;