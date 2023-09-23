/**
 *
 *
 * ===== Assign phase =====
 *
 *
 */
const HOST = "localhost";
const PORT = "8080";
const EXCEPT_CHAR = /[\s\n]/;

/**
 *
 * =============== Send POST to collect data
 *
 * @param data: <Object type> data is body of POST request
 *
 */
async function sendListenReq(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log("--- Body of LISTEN POST request: " + options.body);
  const resquest = await fetch(`http://${HOST}:${PORT}/device`, options);
  const response = await resquest.json();

  // if check Conflict detect button already exist
  if ("button" in response) {
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "visible";
    deleteBtn.style.visibility = "visible";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "hidden";
    deleteTestedBtn.style.visibility = "hidden";

    cancelBtn.style.visibility = "visible";
    statusNotify.style.color = "#0335fc";
    contentNotify.innerHTML = response.content;
  } else {
    /** set display Front end after take response from server */
    setupFE();
    if (response.status == 1) {
      statusNotify.innerHTML = "ADD SUCCESS !!!";
      statusNotify.style.color = "green";
      contentNotify.innerHTML = response.content.toString();
    } else {
      statusNotify.innerHTML = "ADD FAIL !!!";
      statusNotify.style.color = "red";
      contentNotify.innerHTML = response.content.toString();
    }
    console.log("\nPOST request finish");
  }
}

/**
 *
 * @param {*} buttonOverride
 *
 * @func: Override already collected button
 */
async function sendOverrideReq(buttonOverride) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buttonOverride),
  };
  console.log("--- Body of OVERRIDE POST request: " + options.body);
  const resquest = await fetch(`http://${HOST}:${PORT}/overrideBtn`, options);
  const response = await resquest.json();

  setupFE();
  if (response.status == 1) {
    statusNotify.innerHTML = "OVERIDE SUCCESS !!!";
    statusNotify.style.color = "green";
    contentNotify.innerHTML = response.content.toString();
  } else {
    statusNotify.innerHTML = "OVERRIDE FAIL !!!";
    statusNotify.style.color = "red";
    contentNotify.innerHTML = response.content.toString();
  }
  console.log("\nPOST request finish");
}

/**
 *
 * @param {*} data
 *
 * @func: deleete already collected button (why delete, your reason right ...?)
 */
async function sendDeleteBtnReq(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log("--- Body of DELETE POST request: " + options.body);
  const resquest = await fetch(`http://${HOST}:${PORT}/deleteBtn`, options);
  const response = await resquest.json();

  setupFE();
  if (response.status == 1) {
    statusNotify.innerHTML = "DELETE BUTTON SUCCESS !!!";
    statusNotify.style.color = "green";
    contentNotify.innerHTML = response.content.toString();
  } else {
    statusNotify.innerHTML = "DELETE BUTTON FAIL !!!";
    statusNotify.style.color = "red";
    contentNotify.innerHTML = response.content.toString();
  }
  console.log("\nDELETE POST request finish");
}

/**
 * cancel, kill all listener MQTT
 * */
async function sendCancelReq() {
  const resquest = await fetch(`http://${HOST}:${PORT}/cancel`);
  const response = await resquest.json();

  setupFE();
  if (response.status == 1) {
    statusNotify.innerHTML = "CANCEL SUCCESS !!!";
    statusNotify.style.color = "green";
    contentNotify.innerHTML = "Close listener for MQTT message";
  } else {
    statusNotify.innerHTML = "CANCEL FAIL !!!";
    statusNotify.style.color = "red";
    contentNotify.innerHTML = "";
  }
  console.log("\nCANCEL request finish");
}

/**
 *
 *
 * ========================== SEND request to server for test task
 *
 *
 *
 * @param {*} data
 */
async function sendCheckReq(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log("--- Body of LISTEN POST request: " + options.body);
  const resquest = await fetch(`http://${HOST}:${PORT}/check`, options);
  const response = await resquest.json();
  /** set display Front end after take response from server */

  // if check already tested button
  if ("button" in response) {
    listenBtn.style.visibility = "hidden";
    overrideBtn.style.visibility = "hidden";
    deleteBtn.style.visibility = "hidden";

    checkBtn.style.visibility = "hidden";
    checkAgainBtn.style.visibility = "visible";
    deleteTestedBtn.style.visibility = "visible";

    cancelBtn.style.visibility = "visible";
    statusNotify.style.color = "#0335fc";
    statusNotify.innerHTML =
      "Button is checked in the past, Want to check again ?";
    contentNotify.innerHTML = response.content;
  } else {
    /** set display Front end after take response from server */
    setupFE();
    if (response.status == 1) {
      statusNotify.innerHTML = "CHECK SUCCESS !!!";
      statusNotify.style.color = "green";
      contentNotify.innerHTML = response.content.toString();
    } else {
      statusNotify.innerHTML = "CHECK FAIL !!!";
      statusNotify.style.color = "red";
      contentNotify.innerHTML = response.content.toString();
    }
    console.log("\nPOST request finish");
  }
}

/**
 *
 * @param {*} buttonOverride
 */
async function sendCheckAgain(buttonCheckAgain) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buttonCheckAgain),
  };
  console.log("--- Body of OVERRIDE POST request: " + options.body);
  const resquest = await fetch(`http://${HOST}:${PORT}/checkAgain`, options);
  const response = await resquest.json();

  setupFE();
  if (response.status == 1) {
    statusNotify.innerHTML = "CHECK AGAIN SUCCESS !!!";
    statusNotify.style.color = "green";
    contentNotify.innerHTML = response.content.toString();
  } else {
    statusNotify.innerHTML = "CHECK AGAIN FAIL !!!";
    statusNotify.style.color = "red";
    contentNotify.innerHTML = response.content.toString();
  }
  console.log("\nPOST request finish");
}

/**
 *
 * @param {*} data
 *
 * @func: deleete already collected button (why delete, your reason right ...?)
 */
async function sendDeleteCheckBtnReq(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log("--- Body of DELETE CHECK KEY POST request: " + options.body);
  const resquest = await fetch(
    `http://${HOST}:${PORT}/deleteCheckBtn`,
    options
  );
  const response = await resquest.json();

  setupFE();
  if (response.status == 1) {
    statusNotify.innerHTML = "DELETE TESTED BUTTON SUCCESS !!!";
    statusNotify.style.color = "green";
    contentNotify.innerHTML = response.content.toString();
  } else {
    statusNotify.innerHTML = "DELETE TESTED BUTTON FAIL !!!";
    statusNotify.style.color = "red";
    contentNotify.innerHTML = response.content.toString();
  }
  console.log("\nDELETE POST request finish");
}

/**
 *
 *
 * ========================== SEND request to server for send raw task
 *
 *
 *
 * @param {*} data
 */
async function sendRawReq(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log("--- Body of LISTEN POST request: " + options.body);
  const resquest = await fetch(`http://${HOST}:${PORT}/sendRaw`, options);
  const response = await resquest.json();
  /** set display Front end after take response from server */

  /** set display Front end after take response from server */
  setupFE();
  if (response.status == 1) {
    statusNotify.innerHTML = "SEND OK !!!";
    statusNotify.style.color = "green";
    contentNotify.innerHTML = response.content.toString();
  } else {
    statusNotify.innerHTML = "SEND FAIL !!!";
    statusNotify.style.color = "red";
    contentNotify.innerHTML = response.content.toString();
  }
  console.log("\nPOST request finish");
}
