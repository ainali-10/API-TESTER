// hey there it is my first mini project.
// made this project to test api's and learn how to use fetch api and local storage in javascript.
// yea so the html and css are made by me and in js i got ai help to make the code more readable and understandable.
// hope it gonna help you to learn and understand how to use fetch api and local storage in javascript.




// =============================================================
// DOM REFERENCES
// Grab every element we'll need to read from or write to.
// =============================================================
const urlInput = document.getElementById("urlInput");
const methodSelect = document.getElementById("methodSelect");
const bodyInput = document.getElementById("bodyInput");

const paramsList = document.getElementById("paramsList");
const headersList = document.getElementById("headersList");
const addParamBtn = document.getElementById("addParamBtn");
const addHeaderBtn = document.getElementById("addHeaderBtn");

const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

const errorBox = document.getElementById("errorBox");
const resultsSection = document.getElementById("results");
const statusEl = document.getElementById("status");
const timeEl = document.getElementById("time");
const responseHeadersEl = document.getElementById("responseHeaders");
const bodyEl = document.getElementById("body");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Keep the last response body around so the Copy button has
// something to grab without re-parsing anything.
let lastResponseText = "";

// =============================================================
// DYNAMIC KEY/VALUE ROWS (used for both Headers and Query Params)
// Instead of one fixed input, the user can add/remove as many
// rows as they want. Each row is just two <input> elements plus
// a remove button, all created with document.createElement().
// =============================================================
function createKeyValueRow(container, keyPlaceholder, valuePlaceholder) {
  const row = document.createElement("div");
  row.className = "kv-row";

  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.placeholder = keyPlaceholder;
  keyInput.className = "kv-key";

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.placeholder = valuePlaceholder;
  valueInput.className = "kv-value";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "✕";
  // Arrow function here just means: "when clicked, remove THIS row"
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);
  container.appendChild(row);
}

addParamBtn.addEventListener("click", () => {
  createKeyValueRow(paramsList, "key (e.g. role)", "value (e.g. admin)");
});

addHeaderBtn.addEventListener("click", () => {
  createKeyValueRow(headersList, "Header name (e.g. Content-Type)", "Value (e.g. application/json)");
});

// Reads all the kv-rows inside a container and turns them into
// a plain JS object: { role: "admin", page: "2" }
// Empty rows (blank key) are skipped.
function collectKeyValuePairs(container) {
  const result = {};
  const rows = container.querySelectorAll(".kv-row");
  rows.forEach((row) => {
    const key = row.querySelector(".kv-key").value.trim();
    const value = row.querySelector(".kv-value").value.trim();
    if (key) {
      result[key] = value;
    }
  });
  return result;
}

// Start with one header row pre-filled, since almost every
// JSON API call needs Content-Type.
createKeyValueRow(headersList, "Header name (e.g. Content-Type)", "Value (e.g. application/json)");

// =============================================================
// SEND REQUEST
// =============================================================
sendBtn.addEventListener("click", sendRequest);

async function sendRequest() {
  errorBox.style.display = "none";
  resultsSection.style.display = "none";
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  const rawUrl = urlInput.value.trim();
  const method = methodSelect.value;

  if (!rawUrl) {
    showError("Please enter a URL.");
    resetButton();
    return;
  }

  // BUILD THE FINAL URL
  // The "URL" object parses the URL string, and "URLSearchParams"
  // safely appends "?key=value&key2=value2" — it handles escaping
  // special characters for us so we don't build broken URLs by hand.
  let finalUrl;
  try {
    const urlObj = new URL(rawUrl);
    const params = collectKeyValuePairs(paramsList);
    Object.keys(params).forEach((key) => {
      urlObj.searchParams.set(key, params[key]);
    });
    finalUrl = urlObj.toString();
  } catch (urlError) {
    showError("Invalid URL. Make sure it starts with http:// or https://");
    resetButton();
    return;
  }

   // BUILD HEADERS
  // fetch() accepts a plain object of header name -> value.
  const headers = collectKeyValuePairs(headersList);

  // BUILD THE FETCH OPTIONS OBJECT
  // GET/DELETE requests conventionally don't send a body.
  // For POST/PUT/PATCH, we take the text the user typed in the
  // textarea and validate that it's actually valid JSON with
  // JSON.parse() BEFORE we send it --- much better to catch a typo
  // now than to get a confusing error back from the server.
  const fetchOptions = { method, headers };
  const methodsWithBody = ["POST", "PUT", "PATCH"];

  if (methodsWithBody.includes(method) && bodyInput.value.trim()) {
    try {
      const parsedBody = JSON.parse(bodyInput.value);
      fetchOptions.body = JSON.stringify(parsedBody);
    } catch (jsonError) {
      showError("Invalid JSON in request body. Check for missing quotes or commas.");
      resetButton();
      return;
    }
  }

  const startTime = Date.now();

  try {
    // THE ACTUAL REQUEST
    // fetch() returns a Promise. "await" pauses this function
    // until the browser actually gets a response back (or fails
    // to reach the server at all), without freezing the page.
    const response = await fetch(finalUrl, fetchOptions);
    const responseTime = Date.now() - startTime;

    // response.status / response.ok describe THIS response.
    // Getting a 404 or 500 here is not a JavaScript error --- the
    // server responded successfully, it just reported a problem.
    statusEl.textContent = response.status + " " + response.statusText;
    statusEl.className = "summary-value " + (response.ok ? "ok" : "error");
    timeEl.textContent = responseTime + " ms";

    // response.headers is iterable — looping over it gives us each header name and value.
    let headerLines = "";
    response.headers.forEach((value, name) => {
      headerLines += name + ": " + value + "\n";
    });
    responseHeadersEl.textContent = headerLines || "(no headers)";

    // Try to parse the body as JSON. Not every response IS JSON, so if it fails we just show a message instead of crashing.
    let bodyText;
    try {
      const data = await response.json();
      bodyText = JSON.stringify(data, null, 2);
    } catch (parseError) {
      bodyText = "(Response was not valid JSON)";
    }
    bodyEl.textContent = bodyText;
    lastResponseText = bodyText;

    resultsSection.style.display = "block";

    saveToHistory({
      method,
      url: finalUrl,
      status: response.status,
      time: responseTime
    });

  } catch (networkError) {
    // This only fires for real failures: no internet connection,
    // a DNS lookup failure, or the server blocking cross-origin
    // requests (CORS) --- never for a "successful but unhappy"
    // HTTP status like 401 or 500.
    showError("Network error: " + networkError.message + ". The server may be unreachable or blocking this request (CORS).");
  }

  resetButton();
}

function showError(message) {
  errorBox.textContent = "❌ " + message;
  errorBox.style.display = "block";
}

function resetButton() {
  sendBtn.disabled = false;
  sendBtn.textContent = "Send";
}

// CLEAR BUTTON --- resets it all to the default state, including one empty header row.
clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  methodSelect.value = "GET";
  bodyInput.value = "";
  paramsList.innerHTML = "";
  headersList.innerHTML = "";
  createKeyValueRow(headersList, "Header name (e.g. Content-Type)", "Value (e.g. application/json)");
  errorBox.style.display = "none";
  resultsSection.style.display = "none";
});

// COPY RESPONSE — navigator.clipboard.writeText() is itself async, so we use async/await here too.
copyBtn.addEventListener("click", async () => {
  if (!lastResponseText) return;
  try {
    await navigator.clipboard.writeText(lastResponseText);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  } catch (err) {
    copyBtn.textContent = "Copy failed";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  }
});

// REQUEST HISTORY--- so the user can see what they sent before and re-run it if they want.
const HISTORY_KEY = "apiTesterHistory";

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveToHistory(entry) {
  const history = loadHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 15); // keep it from growing forever... wiwi
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = "";

  if (history.length === 0) {
    const hint = document.createElement("div");
    hint.className = "empty-hint";
    hint.textContent = "No requests yet.";
    historyList.appendChild(hint);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const methodBadge = document.createElement("span");
    methodBadge.className = "history-method method-" + entry.method;
    methodBadge.textContent = entry.method;

    const urlSpan = document.createElement("span");
    urlSpan.className = "history-url";
    urlSpan.textContent = entry.url;

    const statusSpan = document.createElement("span");
    statusSpan.className = "history-status";
    statusSpan.textContent = entry.status;

    const timeSpan = document.createElement("span");
    timeSpan.className = "history-status";
    timeSpan.textContent = entry.time + "ms";

    item.appendChild(methodBadge);
    item.appendChild(urlSpan);
    item.appendChild(statusSpan);
    item.appendChild(timeSpan);

    // having the history item clickable to re-populate the form with that request's details.
    item.addEventListener("click", () => {
      urlInput.value = entry.url;
      methodSelect.value = entry.method;
    });

    historyList.appendChild(item);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

// Render the history on page load.
renderHistory();