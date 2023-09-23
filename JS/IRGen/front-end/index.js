/**
 *
 * ========== Click button event handler -- Collect part -- ==========
 *
 */
listenBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var brandVal = brandSel.value;
  var buttonVal = buttonSel.value;
  var modelVal = modelInput.value;
  var nameOfBtnVal = nameOfBtn.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  // check brand value
  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (
      brandVal == "" ||
      brandVal == undefined ||
      brandVal == null ||
      isWrongFormat(brandVal)
    ) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  // check button value
  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (
      buttonVal == "" ||
      buttonVal == undefined ||
      buttonVal == null ||
      isWrongFormat(buttonVal)
    ) {
      isTrueFormat = false;
      alert("Other Key (Button) is wrong format !!");
      return;
    }
  }

  // check model value
  if (
    modelVal == "" ||
    modelVal == undefined ||
    modelVal == null ||
    isWrongFormat(modelVal)
  ) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }

  // check name of button value
  if (nameOfBtnVal == "" || nameOfBtnVal == undefined || nameOfBtnVal == null) {
    isTrueFormat = false;
    alert("Name of key (button) is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    brand: brandVal,
    model: modelVal,
    button: buttonVal,
    nameOfBtn: nameOfBtnVal,
  };
  console.log("--- Value from input: " + JSON.stringify(data));

  if (isTrueFormat) {
    /** set up FE & POST send */
    statusNotify.innerHTML = "Wait for LED & start collect IR signal";
    statusNotify.style.color = "#0335fc";
    contentNotify.innerHTML =
      "LED GREEN ON: Listenning<br>LED GREEN OFF: Close<br>LED BLUE BLINK: IR sense";
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "visible";
    sendListenReq(data);
  }
});

/** Override click handle */
overrideBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var buttonVal = buttonSel.value;
  var brandVal = brandSel.value;
  var modelVal = modelInput.value;
  var nameOfBtnVal = nameOfBtn.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (buttonVal == "" || isWrongFormat(buttonVal)) {
      isTrueFormat = false;
      alert("Other Button is wrong format !!");
      return;
    }
  }

  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (brandVal == "" || isWrongFormat(brandVal)) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  if (modelVal == "" || isWrongFormat(modelVal)) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }
  if (nameOfBtnVal == "") {
    isTrueFormat = false;
    alert("Name of button is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    model: modelVal,
    brand: brandVal,
    button: buttonVal,
    nameOfBtn: nameOfBtnVal,
  };
  console.log("--- Override for button: " + JSON.stringify(data));

  if (isTrueFormat) {
    /** set up FE & POST send */
    statusNotify.innerHTML = `Wait for LED & start collect IR signal for key ${data.button}`;
    statusNotify.style.color = "#0335fc";
    contentNotify.innerHTML =
      "LED GREEN ON: Listenning<br>LED GREEN OFF: Close<br>LED BLUE BLINK: IR sense";
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "visible";
    sendOverrideReq(data);
  }
});

/** Cancel click handle */
cancelBtn.addEventListener("click", (event) => {
  setupFE();
  statusNotify.innerHTML = "";
  contentNotify.innerHTML = "";
  sendCancelReq();
});

/** Delete click handle */
deleteBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var brandVal = brandSel.value;
  var buttonVal = buttonSel.value;
  var modelVal = modelInput.value;
  var nameOfBtnVal = nameOfBtn.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  // check brand value
  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (
      brandVal == "" ||
      brandVal == undefined ||
      brandVal == null ||
      isWrongFormat(brandVal)
    ) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  // check button value
  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (
      buttonVal == "" ||
      buttonVal == undefined ||
      buttonVal == null ||
      isWrongFormat(buttonVal)
    ) {
      isTrueFormat = false;
      alert("Other Key (Button) is wrong format !!");
      return;
    }
  }

  // check model value
  if (
    modelVal == "" ||
    modelVal == undefined ||
    modelVal == null ||
    isWrongFormat(modelVal)
  ) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }

  // check name of button value
  if (nameOfBtnVal == "" || nameOfBtnVal == undefined || nameOfBtnVal == null) {
    isTrueFormat = false;
    alert("Name of key (button) is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    brand: brandVal,
    model: modelVal,
    button: buttonVal,
    nameOfBtn: nameOfBtnVal,
  };
  console.log("--- Value from input: " + JSON.stringify(data));

  if (isTrueFormat) {
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "hidden";
    sendDeleteBtnReq(data);
  }
});

/**
 *
 * ========== Click button event handler -- Test part -- ==========
 *
 */

/** check cliack handle */
checkBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var brandVal = brandSel.value;
  var buttonVal = buttonSel.value;
  var modelVal = modelInput.value;
  var nameOfBtnVal = nameOfBtn.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  // check brand value
  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (
      brandVal == "" ||
      brandVal == undefined ||
      brandVal == null ||
      isWrongFormat(brandVal)
    ) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  // check button value
  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (
      buttonVal == "" ||
      buttonVal == undefined ||
      buttonVal == null ||
      isWrongFormat(buttonVal)
    ) {
      isTrueFormat = false;
      alert("Other Key (Button) is wrong format !!");
      return;
    }
  }

  // check model value
  if (
    modelVal == "" ||
    modelVal == undefined ||
    modelVal == null ||
    isWrongFormat(modelVal)
  ) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }

  // check name of button value
  if (nameOfBtnVal == "" || nameOfBtnVal == undefined || nameOfBtnVal == null) {
    isTrueFormat = false;
    alert("Name of key (button) is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    brand: brandVal,
    model: modelVal,
    button: buttonVal,
    nameOfBtn: nameOfBtnVal,
  };
  console.log("--- Value from input: " + JSON.stringify(data));

  if (isTrueFormat) {
    /** set up FE & POST send */
    statusNotify.innerHTML =
      "Wait for LED & start taking data to check IR signal";
    statusNotify.style.color = "#0335fc";
    contentNotify.innerHTML =
      "LED GREEN ON: Listenning<br>LED GREEN OFF: Close<br>LED BLUE BLINK: IR sense";

    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "visible";
    sendCheckReq(data);
  }
});

/** Check again button cliack handle */
checkAgainBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var buttonVal = buttonSel.value;
  var brandVal = brandSel.value;
  var modelVal = modelInput.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (buttonVal == "" || isWrongFormat(buttonVal)) {
      isTrueFormat = false;
      alert("Other Button is wrong format !!");
      return;
    }
  }

  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (brandVal == "" || isWrongFormat(brandVal)) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  if (modelVal == "" || isWrongFormat(modelVal)) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    model: modelVal,
    brand: brandVal,
    button: buttonVal,
  };
  console.log("--- Check again for button: " + JSON.stringify(data));

  if (isTrueFormat) {
    /** set up FE & POST send */
    statusNotify.innerHTML = `Wait for LED & start test IR signal for key ${data.button}`;
    statusNotify.style.color = "#0335fc";
    contentNotify.innerHTML =
      "LED GREEN ON: Listenning<br>LED GREEN OFF: Close<br>LED BLUE BLINK: IR sense";
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "visible";

    sendCheckAgain(data);
  }
});

/** Delete click handle */
deleteTestedBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var brandVal = brandSel.value;
  var buttonVal = buttonSel.value;
  var modelVal = modelInput.value;
  var nameOfBtnVal = nameOfBtn.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  // check brand value
  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (
      brandVal == "" ||
      brandVal == undefined ||
      brandVal == null ||
      isWrongFormat(brandVal)
    ) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  // check button value
  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (
      buttonVal == "" ||
      buttonVal == undefined ||
      buttonVal == null ||
      isWrongFormat(buttonVal)
    ) {
      isTrueFormat = false;
      alert("Other Key (Button) is wrong format !!");
      return;
    }
  }

  // check model value
  if (
    modelVal == "" ||
    modelVal == undefined ||
    modelVal == null ||
    isWrongFormat(modelVal)
  ) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }

  // check name of button value
  if (nameOfBtnVal == "" || nameOfBtnVal == undefined || nameOfBtnVal == null) {
    isTrueFormat = false;
    alert("Name of key (button) is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    brand: brandVal,
    model: modelVal,
    button: buttonVal,
  };
  console.log("--- Value from input: " + JSON.stringify(data));

  if (isTrueFormat) {
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "hidden";
    sendDeleteCheckBtnReq(data);
  }
});

/**
 *
 * ========== Click button event handler -- Send raw -- ==========
 *
 */

/** check cliack handle */
sendRawBtn.addEventListener("click", (event) => {
  var categoryVal = categorySel.value;
  var brandVal = brandSel.value;
  var buttonVal = buttonSel.value;
  var modelVal = modelInput.value;
  var nameOfBtnVal = nameOfBtn.value;

  var isTrueFormat = true;

  /** Set up read attributes, avoid null & wrong format */
  if (categoryVal == "OTHER") {
    categoryVal = otherCat.value;
    // check format phase
    if (
      categoryVal == "" ||
      categoryVal == null ||
      categoryVal == isWrongFormat(categoryVal)
    ) {
      isTrueFormat = false;
      alert("Other Category is wrong format !!");
      return;
    }
  }

  // check brand value
  if (brandVal == "OTHER") {
    brandVal = otherBr.value;
    if (
      brandVal == "" ||
      brandVal == undefined ||
      brandVal == null ||
      isWrongFormat(brandVal)
    ) {
      isTrueFormat = false;
      alert("Other Brand is wrong format !!");
      return;
    }
  }

  // check button value
  if (buttonVal == "OTHER") {
    buttonVal = otherBtn.value;
    if (
      buttonVal == "" ||
      buttonVal == undefined ||
      buttonVal == null ||
      isWrongFormat(buttonVal)
    ) {
      isTrueFormat = false;
      alert("Other Key (Button) is wrong format !!");
      return;
    }
  }

  // check model value
  if (
    modelVal == "" ||
    modelVal == undefined ||
    modelVal == null ||
    isWrongFormat(modelVal)
  ) {
    isTrueFormat = false;
    alert("Model is wrong format !!");
    return;
  }

  // check name of button value
  if (nameOfBtnVal == "" || nameOfBtnVal == undefined || nameOfBtnVal == null) {
    isTrueFormat = false;
    alert("Name of key (button) is wrong format !!");
    return;
  }

  var data = {
    category: categoryVal,
    brand: brandVal,
    model: modelVal,
    button: buttonVal,
    nameOfBtn: nameOfBtnVal,
  };
  console.log("--- Value from input: " + JSON.stringify(data));

  if (isTrueFormat) {
    /** set up FE & POST send */
    statusNotify.innerHTML = "LED ON trigger send IR signal";
    statusNotify.style.color = "#0335fc";

    contentNotify.innerHTML = "";

    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    sendRawBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "visible";
    sendRawReq(data);
  }
});
