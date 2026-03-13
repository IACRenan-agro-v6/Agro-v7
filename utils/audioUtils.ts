
// Decodes Base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Converts raw PCM data to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let audioContext: AudioContext | null = null;

export const playRawAudio = async (base64Audio: string, onEnded?: () => void): Promise<() => void> => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // Resume context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const bytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(bytes, audioContext, 24000, 1);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    source.onended = () => {
      if (onEnded) onEnded();
    };

    source.start(0);

    // Return a function to stop the audio
    return () => {
      try {
        source.stop();
        if (onEnded) onEnded(); // Ensure cleanup happens
      } catch (e) {
        // Ignore errors if already stopped
      }
    };

  } catch (error) {
    console.error("Erro ao reproduzir áudio:", error);
    if (onEnded) onEnded();
    return () => {};
  }
};
