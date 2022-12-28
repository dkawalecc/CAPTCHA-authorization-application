import os
import sys
import speech_recognition as sr

# LANGUAGES_PATH = 'words'
dirname = os.path.dirname(__file__)
LANGUAGES_PATH = os.path.join(dirname, 'words')
API_KEY = 'AIzaSyAm8_BfXMcAGDXpJpwA--NVTP6U6pKtWkc'
MAX_DISTANCE = 3


def edit_distance(s1, s2):
    m = len(s1) + 1
    n = len(s2) + 1

    tbl = {}
    for i in range(m): tbl[i, 0] = i
    for j in range(n): tbl[0, j] = j
    for i in range(1, m):
        for j in range(1, n):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            tbl[i, j] = min(tbl[i, j - 1] + 1, tbl[i - 1, j] + 1, tbl[i - 1, j - 1] + cost)

    return tbl[i, j]


def response_match_tescase(response, testcase):
    tokens1 = response.split(' ')
    tokens2 = testcase.split(' ')
    if len(tokens1) != len(tokens2):
        return False
    for i in range(len(tokens1)):
        if edit_distance(tokens1[i], tokens2[i]) > MAX_DISTANCE:
            return False
    return True


def get_languages():
    return [file.split('.')[0] for file in os.listdir(LANGUAGES_PATH)]


def recognize(*argv):

    input_path = argv[0]
    input_path = os.path.join(dirname, input_path)
    output_path = argv[1]
    output_path = os.path.join(dirname, output_path)
    testcase_path = os.path.join(dirname, "res.txt")
    with open(testcase_path, 'r') as f:
        testcase = f.read()

    if len(argv) == 3:
        language = argv[2]
        if language not in get_languages():
            language = 'pl'
    else:
        language = 'pl'

    r = sr.Recognizer()
    with sr.AudioFile(input_path) as source:
        r.adjust_for_ambient_noise(source)
        audio_listened = r.listen(source)

    speech_recognition = r.recognize_google(audio_listened, key=API_KEY, language=language, show_all=True)
    if not speech_recognition:
        return None
    else:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(speech_recognition['alternative'][0]['transcript'].lower())
        tmp = speech_recognition['alternative'][0]['transcript'].lower()

        return tmp if response_match_tescase(tmp, testcase) else None

# recognize(sys.argv[1:])
