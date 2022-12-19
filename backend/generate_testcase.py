import sys
import os
import numpy as np
from gtts import gTTS

dirname = os.path.dirname(__file__)
LANGUAGES_PATH = os.path.join(dirname, 'words')
DEFAULT_LANGAUGE = 'en'

def get_languages():
    return [file.split('.')[0] for file in os.listdir(LANGUAGES_PATH)]


def generate_testcase(n, min_length, max_length, language):
    with open(os.path.join(LANGUAGES_PATH, f'{language}.txt'), 'r', encoding='utf-8') as file:
        lines = file.readlines()
    if min_length != 0:
        if max_length != 0:
            lines = [line for line in lines if min_length <= len(line) - 1 <= max_length]
        else:
            lines = [line for line in lines if min_length <= len(line)]
    elif max_length != 0:
        lines = [line for line in lines if len(line) - 1 <= max_length]
    if not lines:
        exit(-1)
    inds = np.random.choice(range(0, len(lines) - 1), size=n, replace=True)
    out = ''
    for i in inds:
        out += lines[i].strip() + ' '
    return out[:-1]


def save_testcase(testcase, language, path):
    gTTS(text=testcase, lang=language, slow=False).save(path)


def gen(*argv):
    output_audio_path = argv[0]
    output_audio_path = os.path.join(dirname, output_audio_path)
    output_text_path = argv[1]
    output_text_path = os.path.join(dirname, output_text_path)

    n = int(argv[2])
    min_length = int(argv[3])
    max_length = int(argv[4])

    if len(argv) == 6:
        language = argv[5]
        if language not in get_languages():
            language = DEFAULT_LANGAUGE
    else:
        language = DEFAULT_LANGAUGE


    testcase = generate_testcase(n, min_length, max_length, language)
    save_testcase(testcase, language, output_audio_path)
    with open(output_text_path, 'w', encoding='utf-8') as file:
        file.write(testcase)
    return "".join(testcase)