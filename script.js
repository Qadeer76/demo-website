let stream, audioContext, analyser, dataArray, rafID;

// Open modal
function openDemo() {
  document.getElementById("modal").style.display = "flex";
}

// Close modal
function closeDemo() {
  stopPreview();
  document.getElementById("modal").style.display = "none";
}

// Confirm permission
async function confirmDemo(pageID) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("video").srcObject = stream;
    document.getElementById("preview").style.display = "block";

    // Audio meter
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    function updateMeter() {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        let v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      document.getElementById("meter").style.width = (rms * 300) + "px";
      rafID = requestAnimationFrame(updateMeter);
    }
    updateMeter();

    // Log minimal consent record to server
    fetch("/consent-log", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        page: pageID,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        consent: "granted"
      })
    });

  } catch (e) {
    alert("Permission denied: " + e.message);
    closeDemo();
  }
}

// Stop preview
function stopPreview() {
  if (rafID) cancelAnimationFrame(rafID);
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (audioContext) audioContext.close();
  document.getElementById("preview").style.display = "none";
}
