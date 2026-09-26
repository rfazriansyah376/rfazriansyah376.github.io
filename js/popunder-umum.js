// Popunder + Tabunder Rottor v2026 (merged, single URL list, all random)
(function maulinator_2026(){

  // =========nakap.web.id========== DAFTAR URL (dipakai popunder & tabunder) ====================
  const DAFTAR_URL = [
"https://t.co/AnuTEFNPxv",
"https://t.co/R2TsK7xcPR",
"https://t.co/4uBEu1p56Q",
"https://t.co/JxpB8vECQj",
"https://t.co/dy1g9SMHKV",
"https://t.co/WKOq54MW8Y"
  ];

  // ==================== RANDOM HELPER ====================
  function CRRandom(arr){
    return arr[Math.floor(Math.random()*arr.length)];
  }

  // ==================== TABUNDER ====================
  const JEDA_MINIMAL = 2000;
  var terakhirTrigger = 0;

  function bukaTabunder() {
    var sekarang = Date.now();

    if (sekarang - terakhirTrigger < JEDA_MINIMAL) {
      return;
    }

    terakhirTrigger = sekarang;

    var urlIklan = CRRandom(DAFTAR_URL);
    var tabBaru = window.open(urlIklan, "_blank");

    if (tabBaru) {
      setTimeout(function() {
        window.focus();
      }, 100);
    }
  }

  // ==================== HANDLER GABUNGAN ====================
  document.addEventListener("click", function(){

    // --- Popunder: tiap klik, URL random ---
    const url = CRRandom(DAFTAR_URL);
    const win = window.open(url, "_blank");

    if(win){
      win.blur();
      window.focus();
    }

    // --- Tabunder: jeda 2 detik, URL random ---
    bukaTabunder();

  }, true);

})();
