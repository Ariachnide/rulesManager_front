import { useEffect, useState, useRef } from "react";
import "../Style/MainElements.css";
import TermTypes from "../utils/TermTypes.js";

function Terms() {
    const [termList, setTermList] = useState([]);
    const [termListMessage, setTermListMessage] = useState("Données en cours de récupération...");
    const [isTermConnectionAvailable, setIsTermConnectionAvailable] = useState(false);

    const postDialogRef = useRef(null);
    const [postTermName, setPostTermName] = useState("");
    const [postTypeValue, setPostTypeValue] = useState(TermTypes.TEXT);

    const updateDialogRef = useRef(null);
    const [tempUpdateId, setTempUpdateId] = useState(-1);
    const [updateTermName, setUpdateTermName] = useState("");
    const [updateTypeValue, setUpdateTypeValue] = useState(null);

    useEffect(() => {
        handleFetchTermList();
    }, []);

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
    
    // POST TERM
    const handlePostModalOpening = (isOpen) => {
        if (isOpen) {
            postDialogRef.current.showModal();
        } else {
            postDialogRef.current.close();
        }
        setPostTypeValue(TermTypes.TEXT);
        setPostTermName("");
    };

    const handlePostTerm = () => {
        fetch(
            `${import.meta.env.VITE_API_BASE_URL}terms/`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: postTermName,
                    type: postTypeValue
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (termList.length == 0) {
                    setTermListMessage("");
                }
                setTermList([...termList, data.result]);
            })
            .catch((error) => {
                console.error(error);
            });

        handlePostModalOpening(false);
    };

    // UPDATE TERM
    const handleUpdateModalOpening = (isOpen, id) => {
        setTempUpdateId(id);
        if (isOpen) {
            const item = termList.find(t => t.id === id);
            setUpdateTermName(item.name);
            setUpdateTypeValue(item.type);
            updateDialogRef.current.showModal();
        } else {
            setUpdateTermName("");
            setUpdateTypeValue(null);
            updateDialogRef.current.close();
        }
    };

    const handleUpdateTerm = () => {
        fetch(
            `${import.meta.env.VITE_API_BASE_URL}terms/${tempUpdateId}`,
            {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: updateTermName,
                    type: updateTypeValue
                })
            }
        )
            .then((res) => res.json())
            .then((data) => setTermList(
                (previousState) => previousState.map(
                    (term) => term.id === data.result.id ? {...term, name: data.result.name, type: data.result.type} : {...term}
                )
            ))
            .catch((error) => {
                console.error(error);
            });

        handlePostModalOpening(false);
    }

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
                    Voici le catalogue des termes disponibles :
                </p>

                {
                    termList.length > 0
                        ? (
                            <ul>
                                {termList.map(term => (
                                    <li key={term.id}>
                                        <span className="hoverReactBlue" onClick={() => handleUpdateModalOpening(true, term.id)}>
                                            <i>{term.name}</i>, de type <b>{term.type}</b>
                                        </span>
                                    </li>)
                                )}
                            </ul>
                        ) : (
                            <p><b>{termListMessage}</b></p>
                        )
                }

                {
                    (isTermConnectionAvailable && termList.length > 0)
                        ? <p>Cliclez sur un terme pour le modifier.</p>
                        : null
                }

                {
                    isTermConnectionAvailable
                        ? (
                            <button className="hoverReactBlue inlineSpacedElements" onClick={() => handlePostModalOpening(true)}>
                                Créer un nouveau terme
                            </button>
                        ) : null
                }

                <button className="hoverReactBlue inlineSpacedElements" onClick={handleFetchTermList}>
                    Recharger le catalogue de termes
                </button>

                <dialog ref={postDialogRef}>
                    <p className="dialogBox">Veuillez définir le nom et le type du terme que vous souhaitez créer :</p>
                    <form method="dialog" onSubmit={handlePostTerm}>
                        <div className="dialogBox">
                            <label className="inlineSpacedElements" htmlFor="postTermName">Nom :</label>
                            <input
                                className="inlineSpacedElements"
                                type="text"
                                id="postTermName"
                                name="name"
                                required
                                maxLength="50"
                                size="16"
                                value={postTermName}
                                onChange={(e) => setPostTermName(e.target.value)}
                            />
                        </div>
                        <div className="dialogBox">
                            <fieldset>
                                <legend>
                                    Type :
                                </legend>

                                <div>
                                    <input
                                        type="radio"
                                        id="postTermTypeText"
                                        name="type"
                                        value={TermTypes.TEXT}
                                        checked={postTypeValue === TermTypes.TEXT}
                                        onChange={() => setPostTypeValue(TermTypes.TEXT)}
                                    />
                                    <label htmlFor={TermTypes.TEXT}>Texte</label>
                                </div>

                                <div>
                                    <input
                                        type="radio"
                                        id="postTermTypeNumber"
                                        name="type"
                                        value={TermTypes.NUMBER}
                                        onChange={() => setPostTypeValue(TermTypes.NUMBER)}
                                    />
                                    <label htmlFor={TermTypes.NUMBER}>Nombre</label>
                                </div>

                                <div>
                                    <input
                                        type="radio"
                                        id="postTermTypeDate"
                                        name="type"
                                        value={TermTypes.DATE}
                                        onChange={() => setPostTypeValue(TermTypes.DATE)}
                                    />
                                    <label htmlFor={TermTypes.DATE}>Date</label>
                                </div>
                                
                            </fieldset>
                        </div>
                        <div className="dialogBox">
                            <button className="hoverReactBlue inlineSpacedElements" type="submit">OK</button>
                            <button className="hoverReactRed inlineSpacedElements" type="button" onClick={() => handlePostModalOpening(false)}>Annuler</button>
                        </div>
                    </form>
                </dialog>

                <dialog ref={updateDialogRef}>
                    <p className="dialogBox">Veuillez définir le nom et le type du terme que vous souhaitez mettre à jour :</p>
                    <form method="dialog" onSubmit={handleUpdateTerm}>
                        <div className="dialogBox">
                            <label className="inlineSpacedElements" htmlFor="updateTermName">Nom :</label>
                            <input
                                className="inlineSpacedElements"
                                type="text"
                                id="updateTermName"
                                name="name"
                                required
                                maxLength="50"
                                size="16"
                                value={updateTermName}
                                onChange={(e) => setUpdateTermName(e.target.value)}
                            />
                        </div>
                        <div className="dialogBox">
                            <fieldset>
                                <legend>
                                    Type :
                                </legend>

                                <div>
                                    <input
                                        type="radio"
                                        id="updateTermTypeText"
                                        name="type"
                                        value={TermTypes.TEXT}
                                        checked={updateTypeValue === TermTypes.TEXT}
                                        onChange={() => setUpdateTypeValue(TermTypes.TEXT)}
                                    />
                                    <label htmlFor={TermTypes.TEXT}>Texte</label>
                                </div>

                                <div>
                                    <input
                                        type="radio"
                                        id="updateTermTypeNumber"
                                        name="type"
                                        value={TermTypes.NUMBER}
                                        checked={updateTypeValue === TermTypes.NUMBER}
                                        onChange={() => setUpdateTypeValue(TermTypes.NUMBER)}
                                    />
                                    <label htmlFor={TermTypes.NUMBER}>Nombre</label>
                                </div>

                                <div>
                                    <input
                                        type="radio"
                                        id="updateTermTypeDate"
                                        name="type"
                                        value={TermTypes.DATE}
                                        checked={updateTypeValue === TermTypes.DATE}
                                        onChange={() => setUpdateTypeValue(TermTypes.DATE)}
                                    />
                                    <label htmlFor={TermTypes.DATE}>Date</label>
                                </div>
                                
                            </fieldset>
                        </div>
                        <div className="dialogBox">
                            <button className="hoverReactBlue inlineSpacedElements" type="submit">OK</button>
                            <button className="hoverReactRed inlineSpacedElements" type="button" onClick={() => handleUpdateModalOpening(false, -1)}>Annuler</button>
                        </div>
                    </form>
                </dialog>

            </div>
        </>
    )
};

export default Terms;
