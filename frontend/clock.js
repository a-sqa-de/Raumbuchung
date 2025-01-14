function clock() {
    const now = new Date();
    const ClockContainer = document.getElementById("clock");
  
    if (ClockContainer) {
      ClockContainer.textContent = `Uhrzeit: ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }

  clock();
  setInterval(clock, 1000);