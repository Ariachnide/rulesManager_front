import { useState } from "react";
import "./Style/index.css";
import Terms from "./Components/Terms.jsx";
import Rules from "./Components/Rules.jsx";

function App() {
    const [termList, setTermList] = useState([]);
    const [isTermConnectionAvailable, setIsTermConnectionAvailable] = useState(false);
    const [termListMessage, setTermListMessage] = useState("Données en cours de récupération...");

    // GET TERM LIST
    const handleFetchTermList = () => 
        fetch(`${import.meta.env.VITE_API_BASE_URL}terms/`)
            .then((res) => res.json())
            .then((data) => {
                setTermList(data.result.rows);
                setIsTermConnectionAvailable(true);
                if (data.result.rows.length === 0) {
                    setTermListMessage("Aucune donnée enregistrée.");
                } else {
                    setTermListMessage("");
                }
            })
            .catch((error) => {
                console.error(error);
                setTermListMessage("Erreur lors de la récupération des termes.");
            });

    return (
        <>
            <h1>Gestionnaire de règles</h1>

            <Terms
                termList={termList}
                setTermList={setTermList}
                isTermConnectionAvailable={isTermConnectionAvailable}
                termListMessage={termListMessage}
                setTermListMessage={setTermListMessage}
                handleFetchTermList={handleFetchTermList}
            />

            <Rules
                termList={termList}
                isTermConnectionAvailable={isTermConnectionAvailable}
            />
        </>
    )
};

export default App;
