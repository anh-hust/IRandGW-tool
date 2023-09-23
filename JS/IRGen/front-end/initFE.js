// select field
const categorySel = document.getElementById("categorySel");
const brandSel = document.getElementById("brandSel");
const buttonSel = document.getElementById("buttonSel");

// input field
const otherCat = document.querySelector(".otherCat");
const otherBr = document.querySelector(".otherBr");
const otherBtn = document.querySelector(".otherBtn");

const nameOfBtn = document.querySelector(".nameOfBtn");
const modelInput = document.querySelector(".model");

// button
const listenBtn = document.getElementById("listenBtn");
const overrideBtn = document.getElementById("overrideBtn");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");
const checkBtn = document.getElementById("checkBtn");
const checkAgainBtn = document.getElementById("checkAgainBtn");
const deleteTestedBtn = document.getElementById("deleteTestedBtn");
const sendRawBtn = document.getElementById("sendRawBtn");

// notify, just text
const statusNotify = document.getElementById("status");
const contentNotify = document.getElementById("content");

/** initialize in very first or when client reload */
modelInput.value = "";

for (let item in category) {
  let option = document.createElement("option");
  option.setAttribute("value", category[item]);

  let optionText = document.createTextNode(category[item]);
  option.appendChild(optionText);

  categorySel.appendChild(option);
}

for (let key in tv_button) {
  let option = document.createElement("option");
  option.setAttribute("value", key);

  let optionText = document.createTextNode(key);
  option.appendChild(optionText);

  buttonSel.appendChild(option);
}

for (let item in brand) {
  let option = document.createElement("option");
  option.setAttribute("value", brand[item]);

  let optionText = document.createTextNode(brand[item]);
  option.appendChild(optionText);

  brandSel.appendChild(option);
}

setupFE();

/**
 *
 * @brief setupFE at Other option: clear input tag
 *
 */
function setupFE() {
  /** Button for collect data */
  listenBtn.style.visibility = "visible";
  deleteBtn.style.visibility = "hidden";
  overrideBtn.style.visibility = "hidden";

  /** Button forr test key */
  checkBtn.style.visibility = "visible";
  deleteTestedBtn.style.visibility = "hidden";
  checkAgainBtn.style.visibility = "hidden";

  sendRawBtn.style.visibility = "visible";

  cancelBtn.style.visibility = "hidden";

  if (categorySel.value == "OTHER") {
    otherCat.style.visibility = "visible";
  } else {
    otherCat.style.visibility = "hidden";
  }

  if (brandSel.value == "OTHER") {
    otherBr.style.visibility = "visible";
  } else {
    otherBr.style.visibility = "hidden";
  }

  if (buttonSel.value == "OTHER") {
    otherBtn.style.visibility = "visible";
    var filledVal = otherBtn.value;
    nameOfBtn.value = (
      filledVal.charAt(0).toUpperCase() + filledVal.slice(1)
    ).replace(/_/g, " ");
  } else {
    otherBtn.style.visibility = "hidden";
    nameOfBtn.value = tv_button[buttonSel.value];
  }
}
