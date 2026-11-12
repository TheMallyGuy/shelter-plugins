

const {
    plugin: {
        store
    },
    http: {
        intercept
    },
    ui: {
        SwitchItem,
        TextBox, Text,
        Divider
    }
} = shelter

intercept("post", /\/channels\/\d+\/messages/, (req, send) => {
    req.body.content = textProcessing(req.body.content)
    return send(req)
})

export const settings = () => (
    <>
        <SwitchItem
            value={store.fixApostrophes}
            onChange={(v) => {
                store.fixApostrophes = v
            }}
        >
            Fix Apostrophes
        </SwitchItem>
        <SwitchItem
            value={store.expandContractions}
            onChange={(v) => {
                store.expandContractions = v
            }}
        >
            Expand Contractions
        </SwitchItem>
        <SwitchItem
            value={store.fixCapitalization}
            onChange={(v) => {
                store.fixCapitalization = v
            }}
        >
            Fix Capitalization
        </SwitchItem>
        <SwitchItem
            value={store.fixPunctuation}
            onChange={(v) => {
                store.fixPunctuation = v
            }}
        >
            Punctate sentences
        </SwitchItem>
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
            <Text style={{ "white-space": "nowrap", "flex-shrink": 0 }}>
                Punctuation Frequency
            </Text>
            <TextBox
                style={{ flex: 1 }}
                value={store.fixPunctuationFrequency}
                onInput={(v) => { store.fixPunctuationFrequency = v }}
            />
        </div>

        <Divider />
    </>
)

function textProcessing(input: string) {
    // Quick disable, without having to reload the client
    //if (settings.store.quickDisable) return input;

    let text = input;

    // Preserve code blocks
    const codeBlockRegex = /```[\s\S]*?```|`[\s\S]*?`/g;
    const codeBlocks: string[] = [];
    text = text.replace(codeBlockRegex, match => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Run message through formatters.
    if (store.fixApostrophes || store.expandContractions) text = ensureApostrophe(text); // Note: if expanding contractions, fix them first.
    if (store.fixCapitalization) text = capitalize(text);
    if (store.fixPunctuation && (Math.random() * 100 < store.fixPunctuationFrequency)) text = addPeriods(text);
    if (store.expandContractions) text = expandContractions(text);

    text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[parseInt(index)]);

    return text;
}

// Injecting apostrophe as well as contraction expansion rely on this mapping
const contractionsMap: { [key: string]: string; } = {
    "wasn't": "was not",
    "can't": "cannot",
    "don't": "do not",
    "won't": "will not",
    "isn't": "is not",
    "aren't": "are not",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "doesn't": "does not",
    "didn't": "did not",
    "shouldn't": "should not",
    "wouldn't": "would not",
    "couldn't": "could not",
    "that's": "that is",
    "what's": "what is",
    "there's": "there is",
    "how's": "how is",
    "where's": "where is",
    "when's": "when is",
    "who's": "who is",
    "why's": "why is",
    "you'll": "you will",
    "i'll": "I will",
    "they'll": "they will",
    "it'll": "it will",
    "i'm": "I am",
    "you're": "you are",
    "they're": "they are",
    "he's": "he is",
    "she's": "she is",
    "i've": "I have",
    "you've": "you have",
    "we've": "we have",
    "they've": "they have",
    "you'd": "you would",
    "he'd": "he would",
    "she'd": "she would",
    "it'd": "it would",
    "we'd": "we would",
    "they'd": "they would",
    "y'all": "you all",
    "here's": "here is",
};

const missingApostropheMap: { [key: string]: string; } = {};
for (const contraction in contractionsMap) {
    const withoutApostrophe = removeApostrophes(contraction.toLowerCase());
    missingApostropheMap[withoutApostrophe] = contraction;
}

function getCapData(str: string) {
    const booleanArray: boolean[] = [];
    for (const char of str) {
        if (char.match(/[a-zA-Z]/)) { // Only record capitalization for letters
            booleanArray.push(char === char.toUpperCase());
        }
    }
    return booleanArray;
}

function restoreCap(str: string, data: boolean[]): string {
    let resultString = "";
    let dataIndex = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (!char.match(/[a-zA-Z]/)) {
            resultString += char;
            continue;
        }

        const isUppercase = data[dataIndex];
        resultString += isUppercase ? char.toUpperCase() : char.toLowerCase();

        // Increment index unless the data in shorter than the string, in which case we use the most recent for the rest
        if (dataIndex < data.length - 1) dataIndex++;
    }

    return resultString;
}

function ensureApostrophe(textInput: string): string {
    // This function makes sure all contractions have apostrophes

    const potentialContractions = Object.keys(missingApostropheMap);
    if (potentialContractions.length === 0) {
        return textInput; // Nothing to check if the map is empty
    }

    const findMissingRegex = new RegExp(
        `\\b(${potentialContractions.join("|")})\\b`, // Match any of the keys as whole words
        "gi" // Global (all occurrences), Case-insensitive
    );

    return textInput.replace(findMissingRegex, match => {
        const lowerCaseMatch = match.toLowerCase();

        if (Object.prototype.hasOwnProperty.call(missingApostropheMap, lowerCaseMatch)) {
            const correctContraction = missingApostropheMap[lowerCaseMatch];
            return restoreCap(correctContraction, getCapData(match));
        }
        return match;
    });
}

function expandContractions(textInput: string) {
    const contractionRegex = new RegExp(
        `\\b(${Object.keys(contractionsMap).join("|")})\\b`,
        "gi"
    );

    return textInput.replace(contractionRegex, match => {
        const lowerCaseMatch = match.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(contractionsMap, lowerCaseMatch)) {
            return restoreCap(contractionsMap[lowerCaseMatch], getCapData(match));
        }
        return match;
    });
}

function removeApostrophes(str: string): string {
    return str.replace(/'/g, "");
}

function capitalize(textInput: string): string {
    // This one split ellipsis
    // const sentenceSplitRegex = /((?<!\w\.\w.)(?<!\b[A-Z][a-z]\.)(?<![A-Z]\.)(?<=[.?!])\s+|\n+)/;

    // Regex modified from several stack overflows, if you change make sure it's safe against https://devina.io/redos-checker
    const sentenceSplitRegex = /((?<!\w\.\w.)(?<!\b[A-Z][a-z]\.)(?<![A-Z]\.)(?<!\.)(?<=[.?!])\s+|\n+)/;

    const parts = textInput.split(sentenceSplitRegex);
    const filteredParts = parts.filter(part => part !== undefined && part !== null);

    // const blockedWordsArray: string[] = (Settings.plugins.PolishWording.blockedWords || "")
    //     .split(/,\s?/)
    //     .filter(bw => bw)
    //     .map(bw => bw.toLowerCase());

    // Process alternating content and delimiters
    let result = "";
    for (let i = 0; i < filteredParts.length; i++) {
        const element = filteredParts[i];

        const isSentence = !sentenceSplitRegex.test(element); // if it matches the delimiter regex, it's a delimiter

        if (isSentence) {
            // Check if this is just whitespace
            if (!element) continue;
            else if (element.trim() === "") {
                result += element;
                continue;
            }

            // Find the first actual word character for capitalization check
            const firstWordMatch = element.match(/^\s*([\w'-]+)/);
            const firstWord = firstWordMatch ? firstWordMatch[1].toLowerCase() : "";
            // const isBlocked = firstWord ? blockedWordsArray.includes(firstWord) : false;

            if (
                // !isBlocked &&
                !element.startsWith("http") // Don't break links
            ) {
                // Capitalize the first non-whitespace character (sentence splits can include newlines etc)
                result += element.replace(/^(\s*)(\S)/, (match, leadingSpace, firstChar) => {
                    return leadingSpace + firstChar.toUpperCase();
                });
            } else {
                result += element;
            }
        } else {
            // This a delimiter (whitespace/newline regex), so we'll add it to the string to properly reconstruct without being lossy
            if (element) {
                result += element;
            }
        }
    }

    result = result.replace(/\bi\b(?!\s+is\b)(?=['\s]|$)/g, "I");

    return result;
}

function addPeriods(textInput: string) {
    if (!textInput) {
        return "";
    }

    const lines = textInput.split("\n");
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const strippedLine = line.trimEnd();

        const urlRegex = /https?:\/\/\S+$|www\.\S+$/;

        if (!strippedLine) {
            if (i < lines.length - 1) {
                processedLines.push("");
            }

        } else {
            const lastChar = strippedLine.slice(-1);
            if (
                /[A-Za-z0-9]/.test(lastChar) && // If it doesn't already end with punctuation
                !urlRegex.test(strippedLine) // If it doesn't end with a link
            ) {
                processedLines.push(strippedLine + ".");
                continue;
            }

            processedLines.push(strippedLine);

        }
    }

    return processedLines.join("\n");
}