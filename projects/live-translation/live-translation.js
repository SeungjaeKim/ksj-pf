const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const inputLanguage = document.getElementById("inputLanguage");
    const outputLanguage = document.getElementById("outputLanguage");
    const sourceText = document.getElementById("sourceText");
    const translatedText = document.getElementById("translatedText");
    const statusPill = document.getElementById("statusPill");
    const recognitionState = document.getElementById("recognitionState");
    const speechState = document.getElementById("speechState");
    const lastUpdated = document.getElementById("lastUpdated");

    let recognition = null;
    let isListening = false;
    let isTranslating = false;
    let finalTranscript = [];
    let translatedTranscript = [];
    let pendingSegments = [];
    let availableVoices = [];

    function getRecognitionLanguage() {
        return inputLanguage.value;
    }

    function getTranslationLanguage(selectElement) {
        return selectElement.selectedOptions[0].dataset.translateLang;
    }

    function setStatus(message, tone) {
        statusPill.textContent = message;
        statusPill.dataset.tone = tone || "neutral";
        recognitionState.textContent = tone === "live" ? "listening" : message.toLowerCase();
        lastUpdated.textContent = new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function setSpeechState(message) {
        speechState.textContent = message;
    }

    function updateTextareas(interimText) {
        sourceText.value = [finalTranscript.join("\n"), interimText]
            .filter((part) => part && part.trim() !== "")
            .join("\n");
        translatedText.value = translatedTranscript.join("\n");
        sourceText.scrollTop = sourceText.scrollHeight;
        translatedText.scrollTop = translatedText.scrollHeight;
    }

    function cancelSpeech() {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }

    function resetSession() {
        finalTranscript = [];
        translatedTranscript = [];
        pendingSegments = [];
        sourceText.value = "";
        translatedText.value = "";
        cancelSpeech();
        setSpeechState("ready");
    }

    function syncLanguageSelections() {
        if (inputLanguage.value === outputLanguage.value) {
            const fallbackOption = Array.from(outputLanguage.options).find((option) => option.value !== inputLanguage.value);
            if (fallbackOption) {
                outputLanguage.value = fallbackOption.value;
            }
        }
    }

    async function translateWithGoogle(text, sourceLang, targetLang) {
        const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
            encodeURIComponent(sourceLang) +
            "&tl=" +
            encodeURIComponent(targetLang) +
            "&dt=t&q=" +
            encodeURIComponent(text);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Google translation failed");
        }

        const data = await response.json();
        return (data[0] || [])
            .map((item) => item[0])
            .join("")
            .trim();
    }

    async function translateWithMyMemory(text, sourceLang, targetLang) {
        const url = "https://api.mymemory.translated.net/get?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(sourceLang + "|" + targetLang);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("MyMemory translation failed");
        }

        const data = await response.json();
        return (data.responseData?.translatedText || "").trim();
    }

    async function translateText(text) {
        const sourceLang = getTranslationLanguage(inputLanguage);
        const targetLang = getTranslationLanguage(outputLanguage);

        try {
            return await translateWithGoogle(text, sourceLang, targetLang);
        } catch (googleError) {
            return translateWithMyMemory(text, sourceLang, targetLang);
        }
    }

    function chooseVoice(targetLocale) {
        const [language] = targetLocale.split("-");
        return (
            availableVoices.find((voice) => voice.lang === targetLocale) ||
            availableVoices.find((voice) => voice.lang.startsWith(language)) ||
            null
        );
    }

    function speakText(text) {
        if (!("speechSynthesis" in window) || !text) {
            setSpeechState("unsupported");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = chooseVoice(outputLanguage.value);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = outputLanguage.value;
        }

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setSpeechState("speaking");
        utterance.onend = () => setSpeechState("ready");
        utterance.onerror = () => setSpeechState("error");

        window.speechSynthesis.speak(utterance);
    }

    async function drainTranslationQueue() {
        if (isTranslating || pendingSegments.length === 0) {
            return;
        }

        isTranslating = true;
        const nextSegment = pendingSegments.shift();
        setStatus("번역 중", "working");

        try {
            const translatedSegment = await translateText(nextSegment);
            translatedTranscript.push(translatedSegment || "[번역 결과 없음]");
            updateTextareas("");
            speakText(translatedSegment);
            setStatus("실시간 통역 중", "live");
        } catch (error) {
            translatedTranscript.push("[번역 실패] " + nextSegment);
            updateTextareas("");
            setStatus("번역 서비스 오류", "error");
            setSpeechState("ready");
        } finally {
            isTranslating = false;
            if (pendingSegments.length > 0) {
                drainTranslationQueue();
            }
        }
    }

    function ensureRecognition() {
        if (!SpeechRecognition) {
            setStatus("이 브라우저는 음성 인식을 지원하지 않습니다", "error");
            startBtn.disabled = true;
            stopBtn.disabled = true;
            return null;
        }

        recognition = new SpeechRecognition();
        recognition.lang = getRecognitionLanguage();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setStatus("실시간 통역 중", "live");
            setSpeechState("ready");
            recognitionState.textContent = "listening";
        };

        recognition.onresult = (event) => {
            let interimText = "";

            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const result = event.results[index];
                const transcript = result[0].transcript.trim();

                if (!transcript) {
                    continue;
                }

                if (result.isFinal) {
                    finalTranscript.push(transcript);
                    pendingSegments.push(transcript);
                } else {
                    interimText += transcript + " ";
                }
            }

            updateTextareas(interimText.trim());
            if (pendingSegments.length > 0) {
                drainTranslationQueue();
            }
        };

        recognition.onerror = (event) => {
            const recoverable = event.error === "no-speech" || event.error === "aborted";
            setStatus(recoverable ? "음성 대기 중" : "마이크 오류: " + event.error, recoverable ? "working" : "error");
            if (!recoverable) {
                setSpeechState("ready");
            }
        };

        recognition.onend = () => {
            if (isListening) {
                recognition.lang = getRecognitionLanguage();
                setStatus("음성 재연결 중", "working");
                window.setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (error) {
                        setStatus("마이크 재시작 대기 중", "working");
                    }
                }, 250);
            } else {
                setStatus("대기 중", "neutral");
                recognitionState.textContent = "idle";
            }
        };

        return recognition;
    }

    function startListening() {
        syncLanguageSelections();

        if (!recognition) {
            ensureRecognition();
        }

        if (!recognition) {
            return;
        }

        resetSession();
        recognition.lang = getRecognitionLanguage();
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        try {
            recognition.start();
        } catch (error) {
            setStatus("마이크를 시작할 수 없습니다", "error");
            startBtn.disabled = false;
            stopBtn.disabled = true;
            isListening = false;
        }
    }

    function stopListening() {
        isListening = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;

        if (recognition) {
            recognition.stop();
        }

        cancelSpeech();
        setSpeechState("stopped");
        setStatus("통역 종료", "neutral");
    }

    function loadVoices() {
        availableVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    }

    if ("speechSynthesis" in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        setSpeechState("unsupported");
    }

    syncLanguageSelections();
    ensureRecognition();

    inputLanguage.addEventListener("change", () => {
        syncLanguageSelections();
        if (recognition && !isListening) {
            recognition.lang = getRecognitionLanguage();
        }
    });

    outputLanguage.addEventListener("change", syncLanguageSelections);
    startBtn.addEventListener("click", startListening);
    stopBtn.addEventListener("click", stopListening);

    setStatus("대기 중", "neutral");
});
