import "../Style/RuleElements.css";

function RuleCriteria({ criteria, handleCriteriaEdition, parentElm }) {
    return (
        <>
            <span className="ruleElm criteriaElm" onClick={() => handleCriteriaEdition(criteria.dataId, parentElm)}>
                {`${criteria.term}  ${criteria.operator}  ${criteria.value}`}
            </span>
        </>
    );
};

export default RuleCriteria;
