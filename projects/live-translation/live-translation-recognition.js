(function (root) {
    function getOrderedIndexes(primaryMap, secondaryMap) {
        var seen = {};
        var indexes = [];

        function collectKeys(map) {
            var keys;
            var index;

            if (!map) {
                return;
            }

            keys = Object.keys(map);
            for (index = 0; index < keys.length; index += 1) {
                if (seen[keys[index]]) {
                    continue;
                }

                seen[keys[index]] = true;
                indexes.push(Number(keys[index]));
            }
        }

        collectKeys(primaryMap);
        collectKeys(secondaryMap);

        indexes.sort(function (left, right) {
            return left - right;
        });

        return indexes;
    }

    function buildJoinedText(primaryMap, secondaryMap) {
        return getOrderedIndexes(primaryMap, secondaryMap)
            .map(function (index) {
                var value = primaryMap[index];

                if (typeof value === "undefined") {
                    value = secondaryMap[index];
                }

                return String(value || "").trim();
            })
            .filter(function (value) {
                return value !== "";
            })
            .join("\n");
    }

    function createRecognitionBuffer() {
        return {
            finalSegments: {},
            interimSegments: {},
            translatedSegments: {},
            translatedSourceSegments: {}
        };
    }

    function applyRecognitionResults(buffer, entries) {
        var changedFinalIndexes = [];
        var nextInterimSegments = {};
        var index;
        var entry;
        var transcript;

        for (index = 0; index < entries.length; index += 1) {
            entry = entries[index];
            transcript = String(entry.transcript || "").trim();

            if (!transcript) {
                continue;
            }

            if (entry.isFinal) {
                if (buffer.finalSegments[entry.index] !== transcript) {
                    buffer.finalSegments[entry.index] = transcript;
                    changedFinalIndexes.push(entry.index);
                }
            } else {
                nextInterimSegments[entry.index] = transcript;
            }
        }

        buffer.interimSegments = nextInterimSegments;

        return {
            changedFinalIndexes: changedFinalIndexes,
            sourceText: buildJoinedText(buffer.finalSegments, buffer.interimSegments)
        };
    }

    function updateTranslatedSegment(buffer, index, sourceTranscript, translatedTranscript) {
        buffer.translatedSourceSegments[index] = String(sourceTranscript || "").trim();
        buffer.translatedSegments[index] = String(translatedTranscript || "").trim();
        return buildJoinedText(buffer.translatedSegments, {});
    }

    function getSourceText(buffer) {
        return buildJoinedText(buffer.finalSegments, buffer.interimSegments);
    }

    function getTranslatedText(buffer) {
        return buildJoinedText(buffer.translatedSegments, {});
    }

    function getStableFinalTranscript(buffer, index) {
        return String(buffer.finalSegments[index] || "").trim();
    }

    function getTranslatedSourceTranscript(buffer, index) {
        return String(buffer.translatedSourceSegments[index] || "").trim();
    }

    root.LiveTranslationRecognition = {
        createRecognitionBuffer: createRecognitionBuffer,
        applyRecognitionResults: applyRecognitionResults,
        updateTranslatedSegment: updateTranslatedSegment,
        getSourceText: getSourceText,
        getTranslatedText: getTranslatedText,
        getStableFinalTranscript: getStableFinalTranscript,
        getTranslatedSourceTranscript: getTranslatedSourceTranscript
    };
}(this));
