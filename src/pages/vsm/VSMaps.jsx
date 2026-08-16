import NavBar from "../../reusable-components/navbar/NavBar";
import './VSMaps.css'
import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import  Axios  from 'axios';

function VSMaps() {
    const { t } = useTranslation();
    const [vsMaps, setVsMaps] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVSIds();
    }, []);

    const handleRowClick = (id) => {
        navigate(`/vs-map/${id}`);
    };

    async function fetchVSIds() {
        try {
            const response = await Axios.get('http://localhost:8080/vsm');
            setVsMaps(response.data.vsm_for_user);  // Set the array directly
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="value-stream-maps">
            <div className="vs-maps-container">
                <h1 className="vs-maps-title">{t("vs-maps.greeting") || "Value Stream Maps"}</h1>
                <table className="vs-maps-table">
                    <thead>
                        <tr>
                            <th>{t("vs-maps.title")}</th>
                            <th>{t("vs-maps.date")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vsMaps.map(vsMap => (
                            <tr
                                key={vsMap.id}
                                onClick={() => handleRowClick(vsMap.id)}
                                className="vs-maps-row"
                            >
                                <td>{vsMap.title}</td>
                                <td>{vsMap.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default VSMaps;