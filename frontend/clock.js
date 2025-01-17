function clock() {
    const now = new Date();
    const ClockContainer = document.getElementById("clock");
  
    if (ClockContainer) {
      ClockContainer.textContent = `${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }

  clock();
  setInterval(clock, 10000); //aktualisiert Zeit alle 10 Sekunden