import ElementType from "./ElementTypes.js";
import DisplayType from "./DisplayTypes.js";

const addRuleIndex = (data) => {
    if (typeof data.type === "undefined") return data;

    let level = 0;
    let pointer = data;
    const tempArrayList = [];
    let dataId = 0;
  
    while(level > -1) {
        if (pointer.type === ElementType.BLOCK) {

            dataId++;
            pointer.dataId = dataId;

            level++;
      
            tempArrayList.push({
                type: "tempArray",
                content: pointer.content,
                blockOperator: pointer.blockOperator,
                index: -1
            });
            
            pointer = tempArrayList[tempArrayList.length - 1];
      
        } else if (pointer.type === ElementType.CRITERIA) {

            dataId++;
            pointer.dataId = dataId;

            if (tempArrayList.length > 0) {
                pointer = tempArrayList[tempArrayList.length - 1];
            } else {
                level--;
            }
      
        } else if (pointer.type === "tempArray") {
            pointer.index++;
      
            if (pointer.content.length > pointer.index) {
                pointer = pointer.content[pointer.index];
            } else {
                tempArrayList.pop();
                if (tempArrayList.length > 0) {
                    pointer = tempArrayList[tempArrayList.length - 1];
                    level--;
                } else {
                    level = -1;
                }
            }
        }
    }

    return [data, dataId];
};

const removeRuleIndex = (rule) => {
    if (typeof data.type === "undefined") return data;

    let level = 0;
    let pointer = data;
    const tempArrayList = [];
  
    while(level > -1) {
        if (pointer.type === ElementType.BLOCK) {

            delete pointer.dataId;

            level++;
      
            tempArrayList.push({
                type: "tempArray",
                content: pointer.content,
                blockOperator: pointer.blockOperator,
                index: -1
            });
            
            pointer = tempArrayList[tempArrayList.length - 1];
      
        } else if (pointer.type === ElementType.CRITERIA) {

            delete pointer.dataId;

            if (tempArrayList.length > 0) {
                pointer = tempArrayList[tempArrayList.length - 1];
            } else {
                level--;
            }
      
        } else if (pointer.type === "tempArray") {
            pointer.index++;
      
            if (pointer.content.length > pointer.index) {
                pointer = pointer.content[pointer.index];
            } else {
                tempArrayList.pop();
                if (tempArrayList.length > 0) {
                    pointer = tempArrayList[tempArrayList.length - 1];
                    level--;
                } else {
                    level = -1;
                }
            }
        }
    }

    return data;
};

const retrieveElmById = (data, id) => {
    if (typeof data.type === "undefined") return data;

    let level = 0;
    let pointer = data;
    const tempArrayList = [];
  
    while(level > -1) {
        if (pointer.type === ElementType.BLOCK) {

            if (pointer.dataId === id) return pointer;

            level++;
      
            tempArrayList.push({
                type: "tempArray",
                content: pointer.content,
                blockOperator: pointer.blockOperator,
                index: -1
            });
            
            pointer = tempArrayList[tempArrayList.length - 1];
      
        } else if (pointer.type === ElementType.CRITERIA) {

            if (pointer.dataId === id) return pointer;

            if (tempArrayList.length > 0) {
                pointer = tempArrayList[tempArrayList.length - 1];
            } else {
                level--;
            }
      
        } else if (pointer.type === "tempArray") {
            pointer.index++;
      
            if (pointer.content.length > pointer.index) {
                pointer = pointer.content[pointer.index];
            } else {
                tempArrayList.pop();
                if (tempArrayList.length > 0) {
                    pointer = tempArrayList[tempArrayList.length - 1];
                    level--;
                } else {
                    level = -1;
                }
            }
        }
    }

    return data;
};

export default (data, displayType) => {
    if (typeof data === "undefined" || typeof data.type === "undefined") return "";

    let result = "";

    let level = 0;
    let pointer = data;
    const tempArrayList = [];
  
    while(level > -1) {
        if (pointer.type === ElementType.BLOCK) {
            
            if (displayType === DisplayType.TREE) {
                for (let i = 0; i < level * 2; i++) {
                    result += " ";
                }
                result += pointer.blockOperator;
                result += "\n";
            } else if (displayType === DisplayType.SENTENCE && level !== 0) {
                result += "(";
            }
            level++;
      
            tempArrayList.push({
                type: "tempArray",
                content: pointer.content,
                blockOperator: pointer.blockOperator,
                index: -1
            });
            
            pointer = tempArrayList[tempArrayList.length - 1];
      
        } else if (pointer.type === ElementType.CRITERIA) {
            if (displayType === DisplayType.TREE) {
                for (let i = 0; i < level * 2; i++) {
                    result += " ";
                }
            }
      
            result += `${pointer.term} ${pointer.operator} ${pointer.value}`;
            if (displayType === DisplayType.TREE) {
                result += "\n";
            }

            if (tempArrayList.length > 0) {
                pointer = tempArrayList[tempArrayList.length - 1];
            } else {
                level--;
            }
      
        } else if (pointer.type === "tempArray") {
            pointer.index++;
      
            if (pointer.content.length > pointer.index) {
                if (displayType === DisplayType.SENTENCE && pointer.index > 0) {
                    result += " " + pointer.blockOperator + " ";
                }
                pointer = pointer.content[pointer.index];
            } else {
                tempArrayList.pop();
                if (tempArrayList.length > 0) {
                    pointer = tempArrayList[tempArrayList.length - 1];
                    if (displayType === DisplayType.SENTENCE) {
                        result += ")";
                    }
                    level--;
                } else {
                    level = -1;
                }
            }
        }
    }

    return result;
};

export { addRuleIndex, removeRuleIndex, retrieveElmById };
