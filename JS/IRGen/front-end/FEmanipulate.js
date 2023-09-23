/**
 *
 *
 * =========== Select option event ===========
 *
 *
 */
categorySel.addEventListener("change", (event) => {
  var valueSel = event.target.value;
  if (valueSel == "OTHER") {
    otherCat.style.visibility = "visible";
    otherCat.value = "";
  }

  // TV
  if (valueSel == category[0]) {
    otherCat.style.visibility = "hidden";
    buttonSel.innerHTML = "";
    for (let key in tv_button) {
      let option = document.createElement("option");
      option.setAttribute("value", key);

      let optionText = document.createTextNode(key);
      option.appendChild(optionText);

      buttonSel.appendChild(option);
    }
  }

  // FAN
  if (valueSel == "FAN") {
    otherCat.style.visibility = "hidden";
    buttonSel.innerHTML = "";
    for (let key in fan_button) {
      let option = document.createElement("option");
      option.setAttribute("value", key);

      let optionText = document.createTextNode(key);
      option.appendChild(optionText);

      buttonSel.appendChild(option);
    }
  }

  // STB
  if (valueSel == category[2]) {
    otherCat.style.visibility = "hidden";
    buttonSel.innerHTML = "";
    for (let key in set_top_box_button) {
      let option = document.createElement("option");
      option.setAttribute("value", key);

      let optionText = document.createTextNode(key);
      option.appendChild(optionText);

      buttonSel.appendChild(option);
    }
  }
});

brandSel.addEventListener("change", (event) => {
  var valueSel = event.target.value;
  if (valueSel == "OTHER") {
    otherBr.style.visibility = "visible";
    otherBr.value = "";
  } else {
    otherBr.style.visibility = "hidden";
  }
});

buttonSel.addEventListener("change", (event) => {
  var valueSel = event.target.value;

  // if TV
  if (categorySel.value == category[0]) {
    nameOfBtn.value = tv_button[valueSel];
  }
  if (categorySel.value == category[1]) {
    nameOfBtn.value = fan_button[valueSel];
  }
  if (categorySel.value == category[2]) {
    nameOfBtn.value = set_top_box_button[valueSel];
  }
  if (valueSel == "OTHER") {
    otherBtn.style.visibility = "visible";
    otherBtn.value = "";
    nameOfBtn.value = "";
  } else {
    otherBtn.style.visibility = "hidden";
  }
});

/** check format: white space, new line, -, tab space & FE manipulate
 *
 * @brief test if input string have "except" character or space
 *
 * @param s: string
 *
 * @return true: wrong format
 *         false: true format
 */
function isWrongFormat(s) {
  return EXCEPT_CHAR.test(s);
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

/** Handle press custom name of button (key) */
nameOfBtn.addEventListener("click", () => {
  if (buttonSel.value == "OTHER") {
    var filledVal = otherBtn.value;
    nameOfBtn.value = (
      filledVal.charAt(0).toUpperCase() + filledVal.slice(1)
    ).replace(/_/g, " ");
  }
});

/** handle when press tab to switch context input field */
function handleTabKeyPress(event) {
  // Check if the pressed key is the "tab" key
  if (event.keyCode === 9 || event.key == "Tab") {
    if (buttonSel.value == "OTHER") {
      var filledVal = otherBtn.value;
      nameOfBtn.value = (
        filledVal.charAt(0).toUpperCase() + filledVal.slice(1)
      ).replace(/_/g, " ");
    }
    // Prevent the default tab behavior (e.g., moving focus to the next element)
    event.preventDefault();
  }
}
