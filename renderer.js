const QRCode = require('qrcode');

// --- DOM Elements ---
const loginSection = document.getElementById('login-section');
const generatorSection = document.getElementById('generator-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const qrForm = document.getElementById('qr-form');
const qrCanvas = document.getElementById('qr-canvas');
const qrPlaceholder = document.getElementById('qr-placeholder');
const jsonPreview = document.getElementById('json-preview');

// Input fields
const f_id = document.getElementById('f_id');
const f_qty = document.getElementById('f_qty');
const f_pos01 = document.getElementById('f_pos01');
const f_pos02 = document.getElementById('f_pos02');
const f_pos03 = document.getElementById('f_pos03');
const f_pos04 = document.getElementById('f_pos04');
const f_set01 = document.getElementById('f_set01');
const f_set02 = document.getElementById('f_set02');
const f_model = document.getElementById('f_model');

// --- Login Logic ---
// Default credentials (as discussed in plan)
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "123"; // Using simple password 123 for default, wait let's use admin / 1234. Let me use 1234 since user agreed.
// Let's stick with admin / 1234

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  if (u === 'admin' && p === '1234') {
    loginSection.classList.remove('active');
    generatorSection.classList.add('active');
    loginError.innerText = "";
  } else {
    loginError.innerText = "Invalid Username or Password";
  }
});

logoutBtn.addEventListener('click', () => {
  generatorSection.classList.remove('active');
  loginSection.classList.add('active');
  document.getElementById('username').value = "";
  document.getElementById('password').value = "";
  loginError.innerText = "";
});

// --- Input Formatting & Validation ---

// Helper: restrict to digits only
const enforceDigits = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
};

// Helper: enforce float with 2 decimal places max, max 3 digits before decimal
const enforceFloat = (e) => {
  let val = e.target.value;
  val = val.replace(/[^0-9.]/g, ''); // Allow only digits and dot
  
  // Ensure only one dot
  const parts = val.split('.');
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Max 3 digits before decimal
  if (parts[0].length > 3) {
    parts[0] = parts[0].substring(0, 3);
  }
  
  // Max 2 digits after decimal
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }

  e.target.value = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
};

// Helper: Auto-pad digits to 4
const pad4 = (val) => val.padStart(4, '0');

// Helper: Format float to 3 digits before dot and 2 after
const formatFloat = (val) => {
  if (!val) return "000.00";
  const num = parseFloat(val);
  if (isNaN(num)) return "000.00";
  
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].padStart(3, '0');
  return parts.join('.');
};

// Attach listeners for 4-digit fields
[f_id, f_qty, f_pos01, f_pos02, f_pos03, f_pos04].forEach(el => {
  el.addEventListener('input', enforceDigits);
  el.addEventListener('blur', (e) => {
    if (e.target.value) {
      e.target.value = pad4(e.target.value);
    }
  });
});

// Attach listeners for float fields
[f_set01, f_set02].forEach(el => {
  el.addEventListener('input', enforceFloat);
  el.addEventListener('blur', (e) => {
    if (e.target.value) {
      e.target.value = formatFloat(e.target.value);
    }
  });
});

// --- Generate QR Code ---
qrForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Create JSON Object exactly as requested
  const dataObj = {
    "id": f_id.value || "0000",
    "qty": f_qty.value || "0000",
    "POSITION01(mm)": f_pos01.value || "0000",
    "POSITION02(mm)": f_pos02.value || "0000",
    "POSITION03(mm)": f_pos03.value || "0000",
    "POSITION04(mm)": f_pos04.value || "0000",
    "SETPOINT01(BAR)": formatFloat(f_set01.value),
    "SETPOINT02(RESERVE)": formatFloat(f_set02.value),
    "MODEL": f_model.value || ""
  };

  const jsonString = JSON.stringify(dataObj, null, 2);
  jsonPreview.innerText = jsonString;

  // Minified JSON string for QR Code payload
  const qrPayload = JSON.stringify(dataObj);

  QRCode.toCanvas(qrCanvas, qrPayload, {
    width: 250,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }, function (error) {
    if (error) {
      console.error(error);
      alert('Error generating QR Code');
    } else {
      qrPlaceholder.style.display = 'none';
      qrCanvas.style.display = 'block';
    }
  });
});
