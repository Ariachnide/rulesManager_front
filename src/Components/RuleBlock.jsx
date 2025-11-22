import RuleCriteria from "./RuleCriteria";
import ElementTypes from "../utils/ElementTypes";
import "../Style/RuleElements.css";

function RuleBlock({ block, handleBlockEdition, handleCriteriaEdition, addNewElm, parentElm }) {
    return (
        <>
            <p>
                <span className="ruleElm blockElm" onClick={() => handleBlockEdition(block.dataId, parentElm)}>{`  ${block.blockOperator}  `}</span>
            </p>
            <ul>
                {
                    block.content.map((e) => (
                        <li key={e.dataId}>
                            {
                                e.type === ElementTypes.CRITERIA
                                    ? <RuleCriteria
                                        criteria={e}
                                        handleCriteriaEdition={handleCriteriaEdition}
                                        parentElm={block}
                                    />
                                    : <RuleBlock
                                        block={e}
                                        handleBlockEdition={handleBlockEdition}
                                        handleCriteriaEdition={handleCriteriaEdition}
                                        addNewElm={addNewElm}
                                        parentElm={block}
                                    />
                            }
                        </li>
                    ))
                }
                <li>
                    <span className="ruleElm newElm" onClick={() => addNewElm(block.dataId)}>AJOUTER UN NOUVEL ELEMENT</span>
                </li>
            </ul>
        </>
    );
};

export default RuleBlock;
