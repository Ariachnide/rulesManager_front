import { useEffect, useState } from "react";
import "../Style/MainElements.css";
import TermTypes from "../utils/TermTypes.js";

function Terms() {
    const [termList, setTermList] = useState([]);
    const [termListMessage, setTermListMessage] = useState("Données en cours de récupération...");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}terms/`)
            .then((res) => res.json())
            .then((data) => {
                setTermList(data.result.rows);
                if (data.result.rows.length === 0) {
                    setTermListMessage("Aucune donnée enregistrée.");
                }
            })
            .catch((error) => {
                console.error(error);
                setTermListMessage("Erreur lors de la récupération des termes.");
            });
    }, []);

    return (
        <>
            <div className="card">
                <h2>Termes</h2>
                <p>
                    Les différents types de termes disponibles sont :
                </p>
                <ul>
                    {
                        Object.entries(TermTypes)
                            .map(([key, value]) => (<li key={key}><b>{value}</b></li>))
                    }
                </ul>
                <p>
                    Voici la liste des termes disponibles :
                </p>
                {
                    termList.length > 0
                        ? (
                            <ul>
                                {termList.map(term => (
                                    <li key={term.id}><i>{term.name}</i>, de type <b>{term.type}</b></li>)
                                )}
                            </ul>
                        ) : (
                            <p><b>{termListMessage}</b></p>
                        )
                }
            </div>
        </>
    )
};

export default Terms;
