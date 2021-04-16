import React from "../../_snowpack/pkg/react.js";
import ReactDOM from "../../_snowpack/pkg/react-dom.js";
import DoenetRenderer from "./DoenetRenderer.js";
import {FontAwesomeIcon} from "../../_snowpack/pkg/@fortawesome/react-fontawesome.js";
import {faCheck, faLevelDownAlt, faTimes, faCloud, faPercentage} from "../../_snowpack/pkg/@fortawesome/free-solid-svg-icons.js";
export default class TextInput extends DoenetRenderer {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.currentValue = this.doenetSvData.value;
    this.valueToRevertTo = this.doenetSvData.value;
  }
  static initializeChildrenOnConstruction = false;
  updateValidationState() {
    this.validationState = "unvalidated";
    if (this.doenetSvData.valueHasBeenValidated) {
      if (this.doenetSvData.creditAchievedForSubmitButton === 1) {
        this.validationState = "correct";
      } else if (this.doenetSvData.creditAchievedForSubmitButton === 0) {
        this.validationState = "incorrect";
      } else {
        this.validationState = "partialcorrect";
      }
    }
  }
  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.valueToRevertTo = this.doenetSvData.value;
      if (this.doenetSvData.value !== this.doenetSvData.immediateValue) {
        this.actions.updateValue();
      }
      if (this.doenetSvData.includeCheckWork && this.validationState === "unvalidated") {
        this.actions.submitAnswer();
      }
      this.forceUpdate();
    }
  }
  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.actions.updateImmediateValue({
        text: this.valueToRevertTo
      });
      this.forceUpdate();
    }
  }
  handleFocus(e) {
    this.focused = true;
    this.forceUpdate();
  }
  handleBlur(e) {
    this.focused = false;
    this.valueToRevertTo = this.doenetSvData.immediateValue;
    if (this.doenetSvData.immediateValue !== this.doenetSvData.value) {
      this.actions.updateValue();
    }
    this.forceUpdate();
  }
  onChangeHandler(e) {
    this.currentValue = e.target.value;
    this.actions.updateImmediateValue({
      text: e.target.value
    });
    this.forceUpdate();
  }
  render() {
    if (this.doenetSvData.hidden) {
      return null;
    }
    this.updateValidationState();
    const inputKey = this.componentName + "_input";
    let surroundingBorderColor = "#efefef";
    if (this.focused) {
      surroundingBorderColor = "#82a5ff";
    }
    if (this.doenetSvData.immediateValue !== this.currentValue) {
      this.currentValue = this.doenetSvData.immediateValue;
      this.valueToRevertTo = this.doenetSvData.immediateValue;
    }
    let checkWorkStyle = {
      position: "relative",
      width: "30px",
      height: "24px",
      fontSize: "20px",
      fontWeight: "bold",
      color: "#ffffff",
      display: "inline-block",
      textAlign: "center",
      top: "3px",
      padding: "2px"
    };
    let checkWorkButton = null;
    if (this.doenetSvData.includeCheckWork) {
      if (this.validationState === "unvalidated") {
        checkWorkStyle.backgroundColor = "rgb(2, 117, 216)";
        checkWorkButton = /* @__PURE__ */ React.createElement("button", {
          id: this.componentName + "_submit",
          tabIndex: "0",
          ref: (c) => {
            this.target = c && ReactDOM.findDOMNode(c);
          },
          style: checkWorkStyle,
          onClick: this.actions.submitAnswer,
          onKeyPress: (e) => {
            if (e.key === "Enter") {
              this.actions.submitAnswer();
            }
          }
        }, /* @__PURE__ */ React.createElement(FontAwesomeIcon, {
          icon: faLevelDownAlt,
          transform: {rotate: 90}
        }));
      } else {
        if (this.doenetSvData.showCorrectness) {
          if (this.validationState === "correct") {
            checkWorkStyle.backgroundColor = "rgb(92, 184, 92)";
            checkWorkButton = /* @__PURE__ */ React.createElement("span", {
              id: this.componentName + "_correct",
              style: checkWorkStyle,
              ref: (c) => {
                this.target = c && ReactDOM.findDOMNode(c);
              }
            }, /* @__PURE__ */ React.createElement(FontAwesomeIcon, {
              icon: faCheck
            }));
          } else if (this.validationState === "partialcorrect") {
            let percent = Math.round(this.doenetSvData.creditAchievedForSubmitButton * 100);
            let partialCreditContents = `${percent} %`;
            checkWorkStyle.width = "50px";
            checkWorkStyle.backgroundColor = "#efab34";
            checkWorkButton = /* @__PURE__ */ React.createElement("span", {
              id: this.componentName + "_partial",
              style: checkWorkStyle,
              ref: (c) => {
                this.target = c && ReactDOM.findDOMNode(c);
              }
            }, partialCreditContents);
          } else {
            checkWorkStyle.backgroundColor = "rgb(187, 0, 0)";
            checkWorkButton = /* @__PURE__ */ React.createElement("span", {
              id: this.componentName + "_incorrect",
              style: checkWorkStyle,
              ref: (c) => {
                this.target = c && ReactDOM.findDOMNode(c);
              }
            }, /* @__PURE__ */ React.createElement(FontAwesomeIcon, {
              icon: faTimes
            }));
          }
        } else {
          checkWorkStyle.backgroundColor = "rgb(74, 3, 217)";
          checkWorkButton = /* @__PURE__ */ React.createElement("span", {
            id: this.componentName + "_saved",
            style: checkWorkStyle,
            ref: (c) => {
              this.target = c && ReactDOM.findDOMNode(c);
            }
          }, /* @__PURE__ */ React.createElement(FontAwesomeIcon, {
            icon: faCloud
          }));
        }
      }
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("a", {
      name: this.componentName
    }), /* @__PURE__ */ React.createElement("span", {
      className: "textInputSurroundingBox",
      id: this.componentName
    }, /* @__PURE__ */ React.createElement("input", {
      key: inputKey,
      id: inputKey,
      value: this.currentValue,
      disabled: this.doenetSvData.disabled,
      onChange: this.onChangeHandler,
      onKeyPress: this.handleKeyPress,
      onKeyDown: this.handleKeyDown,
      onBlur: this.handleBlur,
      onFocus: this.handleFocus,
      style: {
        width: `${this.doenetSvData.size * 10}px`,
        height: "22px",
        fontSize: "14px",
        borderWidth: "1px",
        borderColor: surroundingBorderColor,
        padding: "4px"
      }
    }), checkWorkButton));
  }
}