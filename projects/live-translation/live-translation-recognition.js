(function (root) {
    function normalizeTranscript(transcript) {
        return String(transcript || "")
            .replace(/\s+/g, " ")
            .trim();
    }

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

                return normalizeTranscript(value);
            })
            .filter(function (value) {
                return value !== "";
            })
            .join("\n");
    }

    function shouldCollapseSegment(previousTranscript, nextTranscript) {
        var normalizedPrevious = normalizeTranscript(previousTranscript);
        var normalizedNext = normalizeTranscript(nextTranscript);

        if (!normalizedPrevious || !normalizedNext) {
            return false;
        }

        if (normalizedPrevious === normalizedNext) {
            return true;
        }

        return normalizedNext.indexOf(normalizedPrevious) === 0;
    }

    function normalizeFinalSegments(finalSegments) {
        var normalizedSegments = {};
        var indexes = getOrderedIndexes(finalSegments, {});
        var index;
        var currentIndex;
        var currentTranscript;
        var previousIndex = null;
        var previousTranscript = "";

        for (index = 0; index < indexes.length; index += 1) {
            currentIndex = indexes[index];
            currentTranscript = normalizeTranscript(finalSegments[currentIndex]);

            if (!currentTranscript) {
                continue;
            }

            if (previousIndex !== null && shouldCollapseSegment(previousTranscript, currentTranscript)) {
                delete normalizedSegments[previousIndex];
            }

            normalizedSegments[currentIndex] = currentTranscript;
            previousIndex = currentIndex;
            previousTranscript = currentTranscript;
        }

        return normalizedSegments;
    }

    function syncTranslatedSegments(buffer, nextFinalSegments) {
        var nextTranslatedSegments = {};
        var nextTranslatedSourceSegments = {};
        var translatedBySource = {};
        var translatedIndexes = getOrderedIndexes(buffer.translatedSourceSegments, buffer.translatedSegments);
        var finalIndexes = getOrderedIndexes(nextFinalSegments, {});
        var index;
        var translatedIndex;
        var finalIndex;
        var sourceTranscript;
        var translatedTranscript;
        var nextTranscript;

        for (index = 0; index < translatedIndexes.length; index += 1) {
            translatedIndex = translatedIndexes[index];
            sourceTranscript = normalizeTranscript(buffer.translatedSourceSegments[translatedIndex]);
            translatedTranscript = normalizeTranscript(buffer.translatedSegments[translatedIndex]);

            if (!sourceTranscript || !translatedTranscript) {
                continue;
            }

            translatedBySource[sourceTranscript] = translatedTranscript;
        }

        for (index = 0; index < finalIndexes.length; index += 1) {
            finalIndex = finalIndexes[index];
            nextTranscript = normalizeTranscript(nextFinalSegments[finalIndex]);

            if (!nextTranscript) {
                continue;
            }

            if (normalizeTranscript(buffer.translatedSourceSegments[finalIndex]) === nextTranscript) {
                nextTranslatedSourceSegments[finalIndex] = nextTranscript;
                nextTranslatedSegments[finalIndex] = normalizeTranscript(buffer.translatedSegments[finalIndex]);
                continue;
            }

            if (typeof translatedBySource[nextTranscript] !== "undefined") {
                nextTranslatedSourceSegments[finalIndex] = nextTranscript;
                nextTranslatedSegments[finalIndex] = translatedBySource[nextTranscript];
            }
        }

        buffer.translatedSourceSegments = nextTranslatedSourceSegments;
        buffer.translatedSegments = nextTranslatedSegments;
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
        var previousFinalSegments = buffer.finalSegments || {};
        var changedFinalIndexes = [];
        var nextFinalSegments = {};
        var nextInterimSegments = {};
        var normalizedFinalSegments;
        var normalizedIndexes;
        var index;
        var entry;
        var transcript;

        for (index = 0; index < entries.length; index += 1) {
            entry = entries[index];
            transcript = normalizeTranscript(entry.transcript);

            if (!transcript) {
                continue;
            }

            if (entry.isFinal) {
                nextFinalSegments[entry.index] = transcript;
            } else {
                nextInterimSegments[entry.index] = transcript;
            }
        }

        normalizedFinalSegments = normalizeFinalSegments(nextFinalSegments);
        normalizedIndexes = getOrderedIndexes(normalizedFinalSegments, {});

        buffer.finalSegments = normalizedFinalSegments;
        buffer.interimSegments = nextInterimSegments;
        syncTranslatedSegments(buffer, normalizedFinalSegments);

        for (index = 0; index < normalizedIndexes.length; index += 1) {
            entry = normalizedIndexes[index];
            if (previousFinalSegments[entry] !== normalizedFinalSegments[entry]) {
                changedFinalIndexes.push(entry);
            }
        }

        return {
            changedFinalIndexes: changedFinalIndexes,
            sourceText: buildJoinedText(buffer.finalSegments, buffer.interimSegments)
        };
    }

    function updateTranslatedSegment(buffer, index, sourceTranscript, translatedTranscript) {
        buffer.translatedSourceSegments[index] = normalizeTranscript(sourceTranscript);
        buffer.translatedSegments[index] = normalizeTranscript(translatedTranscript);
        return buildJoinedText(buffer.translatedSegments, {});
    }

    function getSourceText(buffer) {
        return buildJoinedText(buffer.finalSegments, buffer.interimSegments);
    }

    function getTranslatedText(buffer) {
        return buildJoinedText(buffer.translatedSegments, {});
    }

    function getStableFinalTranscript(buffer, index) {
        return normalizeTranscript(buffer.finalSegments[index]);
    }

    function getTranslatedSourceTranscript(buffer, index) {
        return normalizeTranscript(buffer.translatedSourceSegments[index]);
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
