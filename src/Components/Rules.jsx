import { useEffect, useState, useRef } from "react";
import RuleBlock from "./RuleBlock.jsx";
import RuleCriteria from "./RuleCriteria.jsx";
import "../Style/MainElements.css";
import ruleReader, { addRuleIndex, removeRuleIndex, retrieveElmById } from "../utils/ruleReader.js";
import DisplayTypes from "../utils/DisplayTypes.js";
import ElementTypes from "../utils/ElementTypes";
import TermTypes from "../utils/TermTypes.js";
import defaultRule from "../utils/defaultRule.js";
import { getRawDateNow, convertDate } from "../utils/dateTools.js";

function Rules(props) {
    const [ruleList, setRuleList] = useState([]);
    const ruleDetailModal = useRef(null);

    const [chosenRule, setChosenRule] = useState({});
    const [processedRule, setProcessedRule] = useState({});
    const [processedRuleID, setProcessedRuleID] = useState(-1);

    const [ruleBuilderIndex, setRuleBuilderIndex] = useState(0);
    const [editedRuleName, setEditedRuleName] = useState("");

    const [isCreating, setIsCreating] = useState(false);

    const [criteriaOperator, setCriteriaOperator] = useState("");
    const [criteriaValue, setCriteriaValue] = useState("");
    const [editedCriteria, setEditedCriteria] = useState({});
    const [editedCriteriaParent, setEditedCriteriaParent] = useState({});
    const [editedTerm, setEditedTerm] = useState({});

    const [blockOperator, setBlockOperator] = useState("");
    const [editedBlock, setEditedBlock] = useState({});
    const [editedBlockParent, setEditedBlockParent] = useState({});

    const [newElmChoice, setNewElmChoice] = useState("");
    const [newElmParent, setNewElmParent] = useState({});

    const blockEditModal = useRef(null);
    const criteriaEditModal = useRef(null);
    const newElmModal = useRef(null);

    useEffect(() => {
        handleFetchRuleList();
    }, []);

    const globalRuleEditionReset = () => {
        setChosenRule({});
        setProcessedRule({});
        setProcessedRuleID(-1);

        setRuleBuilderIndex(0);
        setEditedRuleName("");

        setIsCreating(false);

        setCriteriaOperator("");
        setCriteriaValue("");
        setEditedCriteria({});
        setEditedCriteriaParent({});
        setEditedTerm({});

        setBlockOperator("");
        setEditedBlock({});
        setEditedBlockParent({});

        setNewElmChoice("");
        setNewElmParent({});

        blockEditModal.current.close();
        ruleDetailModal.current.close();
        criteriaEditModal.current.close();
        newElmModal.current.close();
    };

    // GET RULE LIST
    const handleFetchRuleList = () => 
        fetch(`${import.meta.env.VITE_API_BASE_URL}rules/`)
            .then((res) => res.json())
            .then((data) => setRuleList(data.result.rows))
            .catch((error) => console.error(error));
    
    // RULE DETAIL MODAL
    const handleRuleDetailModal = (isOpen, id) => {
        if (isOpen) {
            setChosenRule(ruleList.find(rule => rule.id === id));
            ruleDetailModal.current.showModal();
        } else {
            setChosenRule({});
            ruleDetailModal.current.close();
        }
    };

    // RULE UPDATE
    const handleRuleEdition = () => {
        const addRuleIndexResults = addRuleIndex(chosenRule.rule);
        setProcessedRule(addRuleIndexResults[0]);
        setRuleBuilderIndex(addRuleIndexResults[1]);
        setEditedRuleName(chosenRule.name);
        setProcessedRuleID(chosenRule.id);

        handleRuleDetailModal(false, -1);
    };

    const confirmRuleUpdate = () => {
        fetch(
            `${import.meta.env.VITE_API_BASE_URL}rules/${processedRuleID}`,
            {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: editedRuleName,
                    rule: removeRuleIndex(processedRule)
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setRuleList((previousState) => previousState.map(
                    (rule) => rule.id === data.result.id ? {...rule, name: data.result.name, rule: data.result.rule } : rule
                ));
                globalRuleEditionReset();
            })
            .catch((error) => console.error(error));
    };

    // RULE CREATION
    const handleRuleCreation = () => {
        const addRuleIndexResults = addRuleIndex(JSON.parse(JSON.stringify(defaultRule)));
        setProcessedRule(addRuleIndexResults[0]);
        setRuleBuilderIndex(addRuleIndexResults[1]);
        setEditedRuleName("Nouvelle règle");
        setProcessedRuleID(-1);
    };

    const confirmRulePost = () => {
        fetch(
            `${import.meta.env.VITE_API_BASE_URL}rules/`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: editedRuleName,
                    rule: removeRuleIndex(processedRule)
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setRuleList([...ruleList, data.result]);
                globalRuleEditionReset();
            })
            .catch((error) => console.error(error));
    };

    // RULE EDITION
    const handleCriteriaEdition = (id, parentElm) => {
        setIsCreating(false);
        const nextEditedCriteria = retrieveElmById(processedRule, id);
        const nextEditedTerm = props.termList.find((t) => nextEditedCriteria.term === t.name);

        setCriteriaOperator(nextEditedCriteria.operator);
        if (nextEditedTerm.type === TermTypes.DATE) {
            setCriteriaValue(convertDate(nextEditedCriteria.value));
        } else {
            setCriteriaValue(nextEditedCriteria.value);
        }
        setEditedCriteria(nextEditedCriteria);
        setEditedCriteriaParent(parentElm);
        setEditedTerm(nextEditedTerm);

        criteriaEditModal.current.showModal();
    };

    const onCriteriaNameChange = (e) => {
        const newTerm = props.termList.find((t) => e.target.value === t.name);
        setEditedTerm(newTerm);
        switch (newTerm.type) {
            case TermTypes.TEXT:
                setCriteriaValue("");
                break;
            case TermTypes.NUMBER:
                setCriteriaValue(0);
                break;
            case TermTypes.DATE:
                setCriteriaValue(getRawDateNow());
                break;
        }
    };

    const onCriteriaOperatorChange = (e) => {
        if (e.target.value.match(/^[\>,\<,\=]*$/)) {
            setCriteriaOperator(e.target.value);
            return;
        }
        setCriteriaOperator(e.target.value);
    };

    const onCriteriaValueChange = (e) => {
        if (editedTerm.type === TermTypes.NUMBER) {
            if (e.target.value.match(/[0-9]+/)) {
                setCriteriaValue(e.target.value);
            } else if (e.target.value === "") {
                setCriteriaValue(0);
            }
            return;
        }
        setCriteriaValue(e.target.value);
    };

    const closeCriteriaEditionModal = () => {
        setCriteriaOperator("");
        setCriteriaValue("");
        setEditedCriteria({});
        setEditedCriteriaParent({});
        setEditedTerm({});

        criteriaEditModal.current.close();
    };

    const confirmCriteriaUpdate = () => {
        editedCriteria.term = editedTerm.name;
        editedCriteria.operator = criteriaOperator;
        if (editedTerm.type === TermTypes.DATE) {
            editedCriteria.value = convertDate(criteriaValue);
        } else {
            editedCriteria.value = criteriaValue;
        }
        setProcessedRule(JSON.parse(JSON.stringify(processedRule)));
        closeCriteriaEditionModal();
    };

    const deleteCriteria = () => {
        if (editedCriteriaParent.dataId === editedCriteria.dataId) {
            globalRuleEditionReset();
            return;
        } else {
            editedCriteriaParent.content = editedCriteriaParent.content.filter((criteria) => criteria.dataId !== editedCriteria.dataId);
        }
        setProcessedRule(JSON.parse(JSON.stringify(processedRule)));
        closeCriteriaEditionModal();
    };

    // BLOCK EDITION
    const handleBlockEdition = (id, parentElm) => {
        setIsCreating(false);
        const nextEditedBlock = retrieveElmById(processedRule, id);

        setBlockOperator(nextEditedBlock.blockOperator);
        setEditedBlock(nextEditedBlock);
        setEditedBlockParent(parentElm);

        blockEditModal.current.showModal();
    };

    const confirmBlockUpdate = () => {
        editedBlock.blockOperator = blockOperator;
        setProcessedRule(JSON.parse(JSON.stringify(processedRule)));
        closeBlockEditionModal();
    };

    const closeBlockEditionModal = () => {
        setBlockOperator("");
        setEditedBlock({});
        setEditedBlockParent({});

        blockEditModal.current.close();
    };

    const deleteBlock = () => {
        if (editedBlockParent.dataId === editedBlock.dataId) {
            globalRuleEditionReset();
            return;
        } else {
            editedBlockParent.content = editedBlockParent.content.filter((block) => block.dataId !== editedBlock.dataId);
        }
        setProcessedRule(JSON.parse(JSON.stringify(processedRule)));
        closeBlockEditionModal();
    };

    // ELEMENT CREATION
    const addNewElm = (id) => {
        setIsCreating(true);
        setNewElmParent(retrieveElmById(processedRule, id));
        setNewElmChoice("");
        newElmModal.current.showModal();
    };

    const closeNewElmModal = () => {
        setNewElmParent({});
        setNewElmChoice("");
        newElmModal.current.close();
    };

    const confirmNewElmCreation = () => {
        switch (newElmChoice) {
            case (ElementTypes.BLOCK):
                setBlockOperator("ET");
                setEditedBlock({
                    dataId: ruleBuilderIndex + 1,
                    blockOperator: "ET",
                    content: [],
                    type: ElementTypes.BLOCK
                });
                setEditedBlockParent(newElmParent);
                
                setRuleBuilderIndex((prevState) => prevState + 1);

                blockEditModal.current.showModal();
                break;

            case (ElementTypes.CRITERIA):
                const nextEditedTerm = props.termList[0];

                const nextOperator = "=";
                setCriteriaOperator("=");
                let nextValue = "";
                switch (nextEditedTerm.type) {
                    case (TermTypes.DATE):
                        nextValue = getRawDateNow();
                        break;
                    case (TermTypes.NUMBER):
                        nextValue = 0;
                        break;
                    case (TermTypes.TEXT):
                        nextValue = "";
                        break;
                }
                setCriteriaValue(nextValue);

                setEditedCriteria({
                    dataId: ruleBuilderIndex + 1,
                    operator: nextOperator,
                    term: nextEditedTerm.name,
                    type: ElementTypes.CRITERIA,
                    value: nextValue
                });
                setEditedCriteriaParent(newElmParent);
                setEditedTerm(nextEditedTerm);

                setRuleBuilderIndex((prevState) => prevState + 1);
                
               criteriaEditModal.current.showModal();
                break;
        }

        closeNewElmModal();
    };

    const confirmNewCriteriaCreation = () => {
        editedCriteria.term = editedTerm.name;
        editedCriteria.operator = criteriaOperator;
        if (editedTerm.type === TermTypes.DATE) {
            editedCriteria.value = convertDate(criteriaValue);
        } else {
            editedCriteria.value = criteriaValue;
        }

        editedCriteriaParent.content.push(editedCriteria);

        setProcessedRule(JSON.parse(JSON.stringify(processedRule)));

        closeCriteriaEditionModal();
    };

    const confirmNewBlockCreation = () => {
        editedBlock.blockOperator = blockOperator;

        editedBlockParent.content.push(editedBlock);

        setProcessedRule(JSON.parse(JSON.stringify(processedRule)));

        closeBlockEditionModal();
    };

    return(
        <>
            <div className="card">
                <h2>Règles</h2>
                {
                    ruleList.length > 0
                        ? (
                            <>
                                <p>Voici la liste des différentes règles. Vous pouvez cliquer dessus afin de la voir plus en détail et de l'éditer dans l'espace de travail plus bas.</p>
                                <ul>
                                    {
                                        ruleList.map((rule) => (
                                            <li key={rule.id}>
                                                <span className="hoverReactBlue" onClick={() => handleRuleDetailModal(true, rule.id)}>
                                                    <i>{rule.name}</i> : {ruleReader(rule.rule, DisplayTypes.SENTENCE)}
                                                </span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </>
                        ) : (
                            <p>Aucune règle disponible pour l'instant.</p>
                        )
                }
                {
                    props.isTermConnectionAvailable
                        ? (
                            <>
                                <p>
                                    Vous pouvez travailler sur une nouvelle règle ici.
                                    {ruleList.length > 0 ? " Si vous souhaitez éditer une règle existante, cliquez sur celle-ci et elle sera disponible ici. Attention : si une règle était déjà en cours d'édition et n'a pas été enregistrée, sa progression sera perdue." : null}
                                </p>
                                <div className="ruleEditionSpace">
                                    {
                                        processedRule.type ? (
                                            <>
                                                <label className="inlineSpacedElements" htmlFor="ruleName">Nom de la règle :</label>
                                                <input
                                                    className="inlineSpacedElements"
                                                    type="text"
                                                    id="ruleName"
                                                    name="ruleName"
                                                    required
                                                    maxLength="120"
                                                    size="50"
                                                    value={editedRuleName}
                                                    onChange={(e) => setEditedRuleName(e.target.value)}
                                                />
                                                <ul>
                                                    {processedRule.type === ElementTypes.BLOCK
                                                        ? <RuleBlock
                                                            block={processedRule}
                                                            handleBlockEdition={handleBlockEdition}
                                                            handleCriteriaEdition={handleCriteriaEdition}
                                                            addNewElm={addNewElm}
                                                            parentElm={processedRule}
                                                        />
                                                        : <RuleCriteria
                                                            criteria={processedRule}
                                                            handleCriteriaEdition={handleCriteriaEdition}
                                                            parentElm={processedRule}
                                                        />
                                                    }
                                                </ul>
                                            </>
                                        ) : (
                                            <p className="placeholderText">
                                                <i>Aucun règle à l'étude pour le moment.</i>
                                            </p>
                                        )
                                    }
                                </div>
                                
                                <div>
                                    <button className="hoverReactBlue inlineSpacedElements" onClick={handleRuleCreation}>
                                        Créer une nouvelle règle
                                    </button>
                                    {
                                        processedRuleID > -1 ? (
                                            <button className="hoverReactBlue inlineSpacedElements" onClick={confirmRuleUpdate}>
                                                Editer la règle
                                            </button>
                                        ) : (
                                            <button className="hoverReactBlue inlineSpacedElements" onClick={confirmRulePost}>
                                                Enregistrer la règle
                                            </button>
                                        )
                                    }
                                </div>

                            </>
                        ) : (
                            null
                        )
                }



                <dialog ref={ruleDetailModal}>
                    <p className="dialogBox">Détails de la règle {chosenRule.name} :</p>
                    <div className="dialogBox">
                        {ruleReader(chosenRule.rule, DisplayTypes.SENTENCE)}
                    </div>
                    <div className="dialogBox">
                        <pre>
                            {ruleReader(chosenRule.rule, DisplayTypes.TREE)}
                        </pre>
                    </div>
                    <div className="dialogBox">
                        <button className="hoverReactBlue inlineSpacedElements" onClick={() => handleRuleDetailModal(false)}>Retour</button>
                        <button className="hoverReactGreen inlineSpacedElements" onClick={() => handleRuleEdition()}>Editer</button>
                    </div>
                </dialog>



                <dialog ref={criteriaEditModal}>
                    <p className="dialogBox">Edition du critère {editedTerm.name} (de type {editedTerm.type}):</p>

                    <div className="dialogBox">
                        <label className="inlineSpacedElements" htmlFor="criteriaTermSelect">
                            Vous pouvez changer le terme sélectionné ici :
                        </label>

                        <select className="inlineSpacedElements" id="criteriaTermSelect" onChange={onCriteriaNameChange}>
                            <option>{editedTerm.name}</option>
                            {props.termList.filter((term) => term.name !== editedTerm.name).map((term) => <option key={term.id} value={term.name}>{term.name}</option>)}
                        </select>
                    </div>

                    <div className="dialogBox">
                        <label className="inlineSpacedElements" htmlFor="criteriaOperator">
                            Opérateur :
                        </label>

                        <input
                            id="criteriaOperator"
                            className="inlineSpacedElements"
                            value={criteriaOperator}
                            type="text"
                            name="termOperator"
                            maxLength="3"
                            size="6"
                            onChange={onCriteriaOperatorChange}
                        />
                    </div>

                    <div className="dialogBox">
                        <label className="inlineSpacedElements" htmlFor="criteriaValue">
                            Valeur :
                        </label>

                        {
                            editedTerm.type === TermTypes.TEXT
                                ? (<input
                                    id="criteriaValue"
                                    className="inlineSpacedElements"
                                    value={criteriaValue}
                                    type="text"
                                    name="termName"
                                    onChange={onCriteriaValueChange}
                                />)
                            : editedTerm.type === TermTypes.NUMBER
                                ? (<input
                                    id="criteriaValue"
                                    className="inlineSpacedElements"
                                    value={criteriaValue}
                                    type="number"
                                    name="termName"
                                    onChange={onCriteriaValueChange}
                                />)
                            : editedTerm.type === TermTypes.DATE
                                ? (<input
                                    id="criteriaValue"
                                    className="inlineSpacedElements"
                                    value={criteriaValue}
                                    type="date"
                                    name="termName"
                                    onChange={onCriteriaValueChange}
                                />)
                            : null
                        }
                    </div>

                    {
                        isCreating
                            ? (
                                <div className="dialogBox">
                                    <button className="hoverReactGreen inlineSpacedElements" onClick={confirmNewCriteriaCreation}>Confirmer</button>
                                    <button className="hoverReactBlue inlineSpacedElements" onClick={closeCriteriaEditionModal}>Annuler</button>
                                </div>
                            ) : (
                                <div className="dialogBox">
                                    <button className="hoverReactGreen inlineSpacedElements" onClick={confirmCriteriaUpdate}>Confirmer</button>
                                    <button className="hoverReactBlue inlineSpacedElements" onClick={closeCriteriaEditionModal}>Annuler</button>
                                    <button className="hoverReactRed inlineSpacedElements" onClick={deleteCriteria}>Supprimer</button>
                                </div>
                            )
                    }
                    
                </dialog>



                <dialog ref={blockEditModal}>
                    <p className="dialogBox">Edition du bloc :</p>
                    
                    <div className="dialogBox">
                        <fieldset>
                            <div className="dialogBox">
                                <input
                                    type="radio"
                                    id="ET"
                                    name="ET"
                                    value="ET"
                                    checked={blockOperator === "ET"}
                                    onChange={() => setBlockOperator("ET")}
                                />
                                <label htmlFor="ET">ET</label>
                            </div>
                            <div className="dialogBox">
                                <input
                                    type="radio"
                                    id="OU"
                                    name="OU"
                                    value="OU"
                                    checked={blockOperator === "OU"}
                                    onChange={() => setBlockOperator("OU")}
                                />
                                <label htmlFor="OU">OU</label>
                            </div>
                        </fieldset>
                    </div>

                    {
                        isCreating
                            ? (
                                <div className="dialogBox">
                                    <button className="hoverReactGreen inlineSpacedElements" onClick={confirmNewBlockCreation}>Confirmer</button>
                                    <button className="hoverReactBlue inlineSpacedElements" onClick={closeBlockEditionModal}>Annuler</button>
                                </div>
                            )
                            : (
                                <div className="dialogBox">
                                    <button className="hoverReactGreen inlineSpacedElements" onClick={confirmBlockUpdate}>Confirmer</button>
                                    <button className="hoverReactBlue inlineSpacedElements" onClick={closeBlockEditionModal}>Annuler</button>
                                    <button className="hoverReactRed inlineSpacedElements" onClick={deleteBlock}>Supprimer</button>
                                </div>
                            )
                    }

                </dialog>



                <dialog ref={newElmModal}>
                    <p className="dialogBox">Choisissez le type de bloc que vous voulez créer :</p>
                    <div className="dialogBox">
                        <fieldset>
                            <div className="dialogBox">
                                <div className="dialogBox">
                                    <input
                                        type="radio"
                                        id="block"
                                        name="block"
                                        value="block"
                                        checked={newElmChoice === "block"}
                                        onChange={() => setNewElmChoice("block")}
                                    />
                                    <label htmlFor="block">Bloc</label>
                                </div>
                                <div className="dialogBox">
                                    <input
                                        type="radio"
                                        id="criteria"
                                        name="criteria"
                                        value="criteria"
                                        checked={newElmChoice === "criteria"}
                                        onChange={() => setNewElmChoice("criteria")}
                                    />
                                    <label htmlFor="criteria">Critère</label>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div className="dialogBox">
                        <button className="hoverReactGreen inlineSpacedElements" onClick={confirmNewElmCreation}>Confirmer</button>
                        <button className="hoverReactBlue inlineSpacedElements" onClick={closeNewElmModal}>Annuler</button>
                    </div>
                </dialog>

            </div>
        </>
    );
};

export default Rules;
