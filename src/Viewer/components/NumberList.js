import InlineComponent from './abstract/InlineComponent';
import me from 'math-expressions';

export default class NumberList extends InlineComponent {
  static componentType = "numberlist";
  static rendererType = "aslist";

  static stateVariableForPropertyValue = "numbers";

  static createPropertiesObject(args) {
    let properties = super.createPropertiesObject(args);
    properties.unordered = { default: false };
    properties.maximumNumber = { default: undefined };
    return properties;
  }


  static returnSugarInstructions() {
    let sugarInstructions = super.returnSugarInstructions();

    let breakStringsIntoNumbersBySpaces = function ({ matchedChildren }) {

      // break any string by white space and wrap pieces with number

      let newChildren = matchedChildren.reduce(function (a, c) {
        if (c.componentType === "string") {
          return [
            ...a,
            ...c.state.value.split(/\s+/)
              .filter(s => s)
              .map(s => ({
                componentType: "number",
                children: [{ componentType: "string", state: { value: s } }]
              }))
          ]
        } else {
          return [...a, c]
        }
      }, []);

      return {
        success: true,
        newChildren: newChildren,
      }
    }


    sugarInstructions.push({
      replacementFunction: breakStringsIntoNumbersBySpaces
    });

    return sugarInstructions;

  }


  static returnChildLogic(args) {
    let childLogic = super.returnChildLogic(args);

    let atLeastZeroNumbers = childLogic.newLeaf({
      name: "atLeastZeroNumbers",
      componentType: 'number',
      comparison: 'atLeast',
      number: 0
    });

    let atLeastZeroNumberlists = childLogic.newLeaf({
      name: "atLeastZeroNumberlists",
      componentType: 'numberlist',
      comparison: 'atLeast',
      number: 0
    });

    childLogic.newOperator({
      name: "numberAndNumberLists",
      operator: "and",
      propositions: [atLeastZeroNumbers, atLeastZeroNumberlists],
      setAsBase: true,
    })

    return childLogic;
  }



  static returnStateVariableDefinitions() {

    let stateVariableDefinitions = super.returnStateVariableDefinitions();

    // set overrideChildHide so that children are hidden
    // only based on whether or not the list is hidden
    // so that can't have a list with partially hidden components
    stateVariableDefinitions.overrideChildHide = {
      returnDependencies: () => ({}),
      definition: () => ({ newValues: { overrideChildHide: true } })
    }

    stateVariableDefinitions.nComponents = {
      public: true,
      componentType: "number",
      additionalStateVariablesDefined: ["childIndexByArrayKey"],
      returnDependencies: () => ({
        maximumNumber: {
          dependencyType: "stateVariable",
          variableName: "maximumNumber",
        },
        numberAndNumberlistChildren: {
          dependencyType: "child",
          childLogicName: "numberAndNumberLists",
          variableNames: ["nComponents"],
          variablesOptional: true,
        }
      }),
      definition: function ({ dependencyValues }) {

        let nComponents = 0;
        let childIndexByArrayKey = [];

        for (let [childInd, child] of dependencyValues.numberAndNumberlistChildren.entries()) {
          if (child.stateValues.nComponents !== undefined) {
            for (let i = 0; i < child.stateValues.nComponents; i++) {
              childIndexByArrayKey[nComponents + i] = [childInd, i];
            }
            nComponents += child.stateValues.nComponents;

          } else {
            childIndexByArrayKey[nComponents] = [childInd, 0];
            nComponents += 1;
          }
        }

        let maxNum = dependencyValues.maximumNumber;
        if (maxNum !== null && nComponents > maxNum) {
          nComponents = maxNum;
          childIndexByArrayKey = childIndexByArrayKey.slice(0, maxNum);
        }

        return {
          newValues: { nComponents, childIndexByArrayKey },
          checkForActualChange: { nComponents: true }
        }
      }
    }


    stateVariableDefinitions.numbers = {
      public: true,
      componentType: "number",
      isArray: true,
      entryPrefixes: ["number"],
      stateVariablesDeterminingDependencies: ["childIndexByArrayKey"],
      returnArraySizeDependencies: () => ({
        nComponents: {
          dependencyType: "stateVariable",
          variableName: "nComponents",
        },
      }),
      returnArraySize({ dependencyValues }) {
        return [dependencyValues.nComponents];
      },

      returnArrayDependenciesByKey({ arrayKeys, stateValues }) {
        let dependenciesByKey = {}
        let globalDependencies = {
          childIndexByArrayKey: {
            dependencyType: "stateVariable",
            variableName: "childIndexByArrayKey"
          }
        };

        for (let arrayKey of arrayKeys) {
          let childIndices = [];
          let numberIndex = "1";
          if (stateValues.childIndexByArrayKey[arrayKey]) {
            childIndices = [stateValues.childIndexByArrayKey[arrayKey][0]];
            numberIndex = stateValues.childIndexByArrayKey[arrayKey][1] + 1;
          }
          dependenciesByKey[arrayKey] = {
            numberAndNumberlistChildren: {
              dependencyType: "child",
              childLogicName: "numberAndNumberLists",
              variableNames: ["value", "number" + numberIndex],
              variablesOptional: true,
              childIndices,
            },
          }
        }
        return { globalDependencies, dependenciesByKey }

      },
      arrayDefinitionByKey({
        globalDependencyValues, dependencyValuesByKey, arrayKeys,
      }) {

        let numbers = {};

        for (let arrayKey of arrayKeys) {
          let child = dependencyValuesByKey[arrayKey].numberAndNumberlistChildren[0];

          if (child) {
            if (child.stateValues.value !== undefined) {
              numbers[arrayKey] = child.stateValues.value;
            } else {
              let numberIndex = globalDependencyValues.childIndexByArrayKey[arrayKey][1] + 1;
              numbers[arrayKey] = child.stateValues["number" + numberIndex];

            }

          }

        }

        return { newValues: { numbers } }

      },
      inverseArrayDefinitionByKey({ desiredStateVariableValues, globalDependencyValues,
        dependencyValuesByKey, dependencyNamesByKey, arraySize
      }) {

        let instructions = [];

        for (let arrayKey in desiredStateVariableValues.numbers) {

          if (!dependencyValuesByKey[arrayKey]) {
            continue;
          }

          let child = dependencyValuesByKey[arrayKey].numberAndNumberlistChildren[0];

          if (child) {
            if (child.stateValues.value !== undefined) {
              instructions.push({
                setDependency: dependencyNamesByKey[arrayKey].numberAndNumberlistChildren,
                desiredValue: desiredStateVariableValues.numbers[arrayKey],
                childIndex: 0,
                variableIndex: 0,
              });

            } else {
              instructions.push({
                setDependency: dependencyNamesByKey[arrayKey].numberAndNumberlistChildren,
                desiredValue: desiredStateVariableValues.numbers[arrayKey],
                childIndex: 0,
                variableIndex: 1,
              });

            }
          }
        }

        return {
          success: true,
          instructions
        }


      }
    }

    stateVariableDefinitions.nValues = {
      isAlias: true,
      targetVariableName: "nComponents"
    };

    stateVariableDefinitions.values = {
      isAlias: true,
      targetVariableName: "numbers"
    };

    stateVariableDefinitions.text = {
      public: true,
      componentType: "text",
      additionalStateVariablesDefined: ["texts"],
      returnDependencies: () => ({
        numberAndNumberlistChildren: {
          dependencyType: "child",
          childLogicName: "numberAndNumberLists",
          variableNames: ["valueForDisplay", "text", "texts"],
          variablesOptional: true,
        },
        maximumNumber: {
          dependencyType: "stateVariable",
          variableName: "maximumNumber",
        },
      }),
      definition: function ({ dependencyValues }) {

        let texts = [];

        for (let child of dependencyValues.numberAndNumberlistChildren) {

          if (child.stateValues.valueForDisplay !== undefined) {
            texts.push(child.stateValues.text);
          } else {
            texts.push(...child.stateValues.texts);
          }
        }

        let maxNum = dependencyValues.maximumNumber;
        if (maxNum !== null && texts.length > maxNum) {
          maxNum = Math.max(0, Math.floor(maxNum));
          texts = texts.slice(0, maxNum)
        }

        let text = texts.join(', ');

        return { newValues: { text, texts } }

      }
    }

    stateVariableDefinitions.childrenToRender = {
      returnDependencies: () => ({
        numberAndNumberlistChildren: {
          dependencyType: "child",
          childLogicName: "numberAndNumberLists",
          variableNames: ["childrenToRender"],
          variablesOptional: true,
        },
        maximumNumber: {
          dependencyType: "stateVariable",
          variableName: "maximumNumber",
        },
      }),
      definition: function ({ dependencyValues, componentInfoObjects }) {
        let childrenToRender = [];

        for (let child of dependencyValues.numberAndNumberlistChildren) {
          if (componentInfoObjects.isInheritedComponentType({
            inheritedComponentType: child.componentType,
            baseComponentType: "numberlist"
          })) {
            childrenToRender.push(...child.stateValues.childrenToRender);
          } else {
            childrenToRender.push(child.componentName);
          }
        }

        let maxNum = dependencyValues.maximumNumber;
        if (maxNum !== null && childrenToRender.length > maxNum) {
          maxNum = Math.max(0, Math.floor(maxNum));
          childrenToRender = childrenToRender.slice(0, maxNum)
        }

        return { newValues: { childrenToRender } }

      }
    }

    return stateVariableDefinitions;
  }

}