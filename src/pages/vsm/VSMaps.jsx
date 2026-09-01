import './VSMaps.css'
import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Axios from 'axios';

function VSMaps() {
    const { t } = useTranslation();
    const [vsMaps, setVsMaps] = useState();
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
            setVsMaps(response.data.vsm_for_user);
        } catch (err) {
            console.log(err);
        }
    }

    const handleDeleteVSMapClick = async (vsmId) => {
        try {
            await Axios.delete(`http://localhost:8080/vsm/${vsmId}`);
            window.location.reload();
        } catch (err) {
            console.error("Failed to delete customer:", err);
        }
    }

    const formatDate = (date) => {
    if (!date) {
        return "";
    }

    const parsedDate = new Date(date);

    return parsedDate.toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).replace(",", "");
};


    if (vsMaps === undefined) {
        return (
            <div className="value-stream-maps">
                <div className="vs-maps-container">
                    <h1 className="vs-maps-title">{t("common.loading") || "Loading..."}</h1>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="value-stream-maps">
                <div className="vs-maps-container">
                    <h1 className="vs-maps-title">{t("vs-maps.greeting") || "Value Stream Maps"}</h1>
                    <table className="vs-maps-table">
                        <thead>
                            <tr>
                                <th>{t("vs-maps.title")}</th>
                                <th>{t("vs-maps.date")}</th>
                                <th></th>
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
                                    <td>{formatDate(vsMap.date)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="vs-map-delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteVSMapClick(vsMap.id);
                                            }}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        className="vs-maps-add-button"
                        onClick={() => navigate("/vs-map/new")}
                    >
                        {t("common.add-new")}
                    </button>
                </div>
            </div>
        );
    }
}

export default VSMaps;